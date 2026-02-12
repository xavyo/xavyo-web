<script lang="ts">
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ConfidenceBadge from '$lib/components/dedup/confidence-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();
	let pendingDuplicates = $derived(data.pendingDuplicates);

	let selectedIds: Set<string> = $state(new Set());
	let selectAll = $state(false);

	function toggleAll() {
		if (selectAll) {
			selectedIds = new Set(pendingDuplicates.items.map((d) => d.id));
		} else {
			selectedIds = new Set();
		}
	}

	function toggleId(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedIds = next;
	}

	let batchResult = $derived(
		actionData && 'result' in actionData ? actionData.result : null
	);
	let previewData = $derived(
		actionData && 'preview' in actionData ? actionData.preview : null
	);
	let errorMsg = $derived(
		actionData && 'error' in actionData ? actionData.error : null
	);
</script>

<PageHeader title="Batch Merge" description="Merge multiple duplicate pairs at once">
	<a href="/governance/dedup" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to hub</a>
</PageHeader>

<div class="space-y-6">
	{#if errorMsg}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
			{errorMsg}
		</div>
	{/if}

	{#if batchResult}
		<div class="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
			<h3 class="mb-3 text-lg font-semibold text-green-800 dark:text-green-400">Batch Merge Complete</h3>
			<div class="grid grid-cols-4 gap-4 text-center">
				<div>
					<p class="text-2xl font-bold text-foreground">{batchResult.total_pairs}</p>
					<p class="text-sm text-muted-foreground">Total</p>
				</div>
				<div>
					<p class="text-2xl font-bold text-green-600">{batchResult.successful}</p>
					<p class="text-sm text-muted-foreground">Successful</p>
				</div>
				<div>
					<p class="text-2xl font-bold text-red-600">{batchResult.failed}</p>
					<p class="text-sm text-muted-foreground">Failed</p>
				</div>
				<div>
					<p class="text-2xl font-bold text-yellow-600">{batchResult.skipped}</p>
					<p class="text-sm text-muted-foreground">Skipped</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Candidate Selection -->
	{#if pendingDuplicates.items.length === 0}
		<div class="rounded-lg border border-dashed border-border p-8 text-center">
			<p class="text-muted-foreground">No pending duplicate candidates to merge.</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-3 pr-4 text-left">
							<input type="checkbox" bind:checked={selectAll} onchange={toggleAll} />
						</th>
						<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Identity A</th>
						<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Identity B</th>
						<th class="py-3 pr-4 text-left font-medium text-muted-foreground">Confidence</th>
						<th class="py-3 text-left font-medium text-muted-foreground">Detected</th>
					</tr>
				</thead>
				<tbody>
					{#each pendingDuplicates.items as dup}
						<tr class="border-b border-border/50 hover:bg-muted/50">
							<td class="py-3 pr-4">
								<input
									type="checkbox"
									checked={selectedIds.has(dup.id)}
									onchange={() => toggleId(dup.id)}
								/>
							</td>
							<td class="py-3 pr-4 font-mono text-xs text-foreground">{dup.identity_a_id.slice(0, 8)}...</td>
							<td class="py-3 pr-4 font-mono text-xs text-foreground">{dup.identity_b_id.slice(0, 8)}...</td>
							<td class="py-3 pr-4"><ConfidenceBadge score={dup.confidence_score} size="sm" /></td>
							<td class="py-3 text-muted-foreground">{new Date(dup.detected_at).toLocaleDateString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<p class="text-sm text-muted-foreground">{selectedIds.size} of {pendingDuplicates.items.length} selected</p>

		<!-- Configuration -->
		<div class="grid gap-4 md:grid-cols-3">
			<div>
				<label for="batch-strategy" class="block text-sm font-medium text-muted-foreground">Entitlement Strategy</label>
				<select id="batch-strategy" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" form="batch-form" name="entitlement_strategy">
					<option value="union">Union (keep all)</option>
					<option value="intersection">Intersection (common only)</option>
					<option value="manual">Manual</option>
				</select>
			</div>
			<div>
				<label for="batch-rule" class="block text-sm font-medium text-muted-foreground">Attribute Resolution</label>
				<select id="batch-rule" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" form="batch-form" name="attribute_rule">
					<option value="newest_wins">Newest wins</option>
					<option value="oldest_wins">Oldest wins</option>
					<option value="prefer_non_null">Prefer non-null</option>
				</select>
			</div>
			<div class="flex items-end">
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" form="batch-form" name="skip_sod_violations" value="true" />
					<span class="text-foreground">Skip SoD violations</span>
				</label>
			</div>
		</div>

		<!-- Actions -->
		<form id="batch-form" method="POST" use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success' && result.data) {
					const d = result.data as Record<string, unknown>;
					if (d.success && d.result) {
						addToast('success', 'Batch merge completed');
					} else if (d.success && d.preview) {
						addToast('info', 'Preview generated');
					} else if (d.error) {
						addToast('error', String(d.error));
					}
				}
				await update();
			};
		}}>
			{#each [...selectedIds] as id}
				<input type="hidden" name="candidate_ids" value={id} />
			{/each}

			<div class="flex gap-3">
				<button
					type="submit"
					formaction="?/preview"
					class="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
					disabled={selectedIds.size === 0}
				>
					Preview
				</button>
				<button
					type="submit"
					formaction="?/execute"
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					disabled={selectedIds.size === 0}
				>
					Execute Batch Merge
				</button>
			</div>
		</form>

		<!-- Preview Result -->
		{#if previewData}
			<div class="rounded-lg border border-border p-4">
				<h3 class="mb-3 text-sm font-semibold text-foreground">Preview: {previewData.total_candidates} pairs will be merged</h3>
				<p class="text-sm text-muted-foreground">
					Strategy: {previewData.entitlement_strategy} | Attribute rule: {previewData.attribute_rule}
				</p>
			</div>
		{/if}
	{/if}
</div>
