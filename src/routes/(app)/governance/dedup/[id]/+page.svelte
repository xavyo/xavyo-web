<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ConfidenceBadge from '$lib/components/dedup/confidence-badge.svelte';
	import AttributeComparison from '$lib/components/dedup/attribute-comparison.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let duplicate = $derived(data.duplicate);

	// svelte-ignore state_referenced_locally
	const { form: dismissFormData, enhance: dismissEnhance } = superForm(data.dismissForm, {
		invalidateAll: 'force',
		onUpdated({ form }) {
			if (form.message) {
				addToast(form.valid ? 'success' : 'error', form.message);
			}
		}
	});

	let showDismissDialog = $state(false);

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'merged': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}
</script>

<PageHeader title="Duplicate Detail" description="Review detected duplicate pair">
	<a href="/governance/dedup" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to list</a>
</PageHeader>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<ConfidenceBadge score={duplicate.confidence_score} />
		<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusBadgeClass('pending')}">
			pending
		</span>
	</div>

	<!-- Side-by-side Identity Summaries -->
	<div class="grid gap-4 md:grid-cols-2">
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Identity A</h3>
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Email</dt>
					<dd class="text-foreground">{duplicate.identity_a.email ?? '—'}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Name</dt>
					<dd class="text-foreground">{duplicate.identity_a.display_name ?? '—'}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Department</dt>
					<dd class="text-foreground">{duplicate.identity_a.department ?? '—'}</dd>
				</div>
			</dl>
		</div>
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Identity B</h3>
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Email</dt>
					<dd class="text-foreground">{duplicate.identity_b.email ?? '—'}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Name</dt>
					<dd class="text-foreground">{duplicate.identity_b.display_name ?? '—'}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Department</dt>
					<dd class="text-foreground">{duplicate.identity_b.department ?? '—'}</dd>
				</div>
			</dl>
		</div>
	</div>

	<!-- Attribute Comparison -->
	<div class="rounded-lg border border-border p-4">
		<h3 class="mb-3 text-sm font-semibold text-foreground">Attribute Comparison</h3>
		<AttributeComparison
			comparisons={duplicate.attribute_comparison}
			identityA={duplicate.identity_a}
			identityB={duplicate.identity_b}
		/>
	</div>

	<!-- Rule Matches -->
	{#if duplicate.rule_matches.length > 0}
		<div class="rounded-lg border border-border p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Rule Match Breakdown</h3>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Rule</th>
						<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Attribute</th>
						<th class="py-2 pr-4 text-left font-medium text-muted-foreground">Similarity</th>
						<th class="py-2 text-left font-medium text-muted-foreground">Weighted Score</th>
					</tr>
				</thead>
				<tbody>
					{#each duplicate.rule_matches as match}
						<tr class="border-b border-border/50">
							<td class="py-2 pr-4 text-foreground">{match.rule_name}</td>
							<td class="py-2 pr-4 text-foreground">{match.attribute}</td>
							<td class="py-2 pr-4">
								<div class="flex items-center gap-2">
									<div class="h-2 w-20 overflow-hidden rounded-full bg-muted">
										<div class="h-full rounded-full bg-primary" style:width="{match.similarity * 100}%"></div>
									</div>
									<span class="text-xs text-muted-foreground">{(match.similarity * 100).toFixed(0)}%</span>
								</div>
							</td>
							<td class="py-2 font-mono text-sm text-foreground">{match.weighted_score.toFixed(1)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex gap-3">
		<a
			href="/governance/dedup/{duplicate.id}/merge"
			class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
		>
			Merge
		</a>
		<button
			class="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
			onclick={() => (showDismissDialog = true)}
		>
			Dismiss
		</button>
	</div>

	<!-- Dismiss Dialog -->
	{#if showDismissDialog}
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Dismiss as False Positive</h3>
			<form method="POST" action="?/dismiss" use:dismissEnhance>
				<div class="space-y-3">
					<div>
						<label for="dismiss-reason" class="block text-sm text-muted-foreground">Reason</label>
						<textarea
							id="dismiss-reason"
							name="reason"
							rows="3"
							class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
							placeholder="Why is this not a duplicate?"
							value={String($dismissFormData.reason ?? '')}
						></textarea>
					</div>
					<div class="flex gap-3">
						<button type="submit" class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
							Dismiss
						</button>
						<button type="button" class="rounded-md border border-input px-4 py-2 text-sm text-foreground hover:bg-muted" onclick={() => (showDismissDialog = false)}>
							Cancel
						</button>
					</div>
				</div>
			</form>
		</div>
	{/if}
</div>
