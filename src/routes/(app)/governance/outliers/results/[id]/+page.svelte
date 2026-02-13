<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { OutlierDisposition, CreateDispositionRequest } from '$lib/api/types';

	let { data } = $props();
	let result = $derived(data.result);

	let showDispositionForm: boolean = $state(false);
	let dispositionStatus: string = $state('legitimate');
	let dispositionJustification: string = $state('');
	let submittingDisposition: boolean = $state(false);

	const classificationColors: Record<string, string> = {
		outlier: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		normal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		unclassifiable: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
	};

	function scoreColor(score: number): string {
		if (score >= 80) return 'text-red-600 dark:text-red-400';
		if (score >= 60) return 'text-orange-600 dark:text-orange-400';
		if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-green-600 dark:text-green-400';
	}

	async function submitDisposition() {
		submittingDisposition = true;
		try {
			const body: CreateDispositionRequest = {
				status: dispositionStatus as CreateDispositionRequest['status'],
				justification: dispositionJustification || undefined
			};
			const res = await fetch(`/api/governance/outliers/results/${result.id}/disposition`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error('Failed');
			addToast('success', 'Disposition recorded');
			showDispositionForm = false;
		} catch {
			addToast('error', 'Failed to create disposition');
		} finally {
			submittingDisposition = false;
		}
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Outlier Result Detail"
		description="User: {result.user_id.substring(0, 8)}..."
	/>
	<div class="flex gap-2">
		<button
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			onclick={() => (showDispositionForm = !showDispositionForm)}
		>
			{showDispositionForm ? 'Cancel' : 'Add Disposition'}
		</button>
	</div>
</div>

{#if showDispositionForm}
	<div class="mb-6 rounded-lg border border-border bg-card p-4">
		<h3 class="mb-3 font-semibold">Record Disposition</h3>
		<div class="space-y-3">
			<div>
				<label for="disp-status" class="mb-1 block text-sm font-medium">Decision</label>
				<select
					id="disp-status"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					bind:value={dispositionStatus}
				>
					<option value="legitimate">Legitimate</option>
					<option value="requires_remediation">Requires Remediation</option>
					<option value="under_investigation">Under Investigation</option>
					<option value="remediated">Remediated</option>
				</select>
			</div>
			<div>
				<label for="disp-justification" class="mb-1 block text-sm font-medium">Justification</label>
				<textarea
					id="disp-justification"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					rows="3"
					bind:value={dispositionJustification}
					placeholder="Explain the rationale for this decision..."
				></textarea>
			</div>
			<button
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				onclick={submitDisposition}
				disabled={submittingDisposition}
			>
				{submittingDisposition ? 'Saving...' : 'Save Disposition'}
			</button>
		</div>
	</div>
{/if}

<div class="mt-6 space-y-6">
	<!-- Score Overview -->
	<div class="rounded-lg border border-border bg-card p-6">
		<h3 class="mb-4 text-lg font-semibold">Score Overview</h3>
		<div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
			<div>
				<p class="text-sm text-muted-foreground">Overall Score</p>
				<p class="text-3xl font-bold {scoreColor(result.overall_score)}">{result.overall_score.toFixed(1)}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Classification</p>
				<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {classificationColors[result.classification] ?? ''}">
					{result.classification}
				</span>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Previous Score</p>
				<p class="text-xl font-bold">{result.previous_score !== null ? result.previous_score.toFixed(1) : '—'}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Score Change</p>
				{#if result.score_change !== null}
					<p class="text-xl font-bold {result.score_change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
						{result.score_change > 0 ? '+' : ''}{result.score_change.toFixed(1)}
					</p>
				{:else}
					<p class="text-xl font-bold">—</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Peer Group Scores -->
	{#if result.peer_scores.length > 0}
		<div class="rounded-lg border border-border bg-card p-6">
			<h3 class="mb-4 text-lg font-semibold">Peer Group Comparison</h3>
			<div class="space-y-3">
				{#each result.peer_scores as ps}
					<div class="flex items-center justify-between rounded-md border border-border p-3">
						<div>
							<p class="font-medium">{ps.peer_group_name}</p>
							<p class="text-sm text-muted-foreground">Z-Score: {ps.z_score.toFixed(2)} | Deviation: {ps.deviation_factor.toFixed(1)}</p>
						</div>
						<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {ps.is_outlier ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}">
							{ps.is_outlier ? 'Outlier' : 'Normal'}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Factor Breakdown -->
	{#if result.factor_breakdown}
		<div class="rounded-lg border border-border bg-card p-6">
			<h3 class="mb-4 text-lg font-semibold">Factor Breakdown</h3>
			<div class="space-y-4">
				{#each Object.entries(result.factor_breakdown) as [key, factor]}
					{#if factor}
						<div>
							<div class="mb-1 flex items-center justify-between">
								<span class="text-sm font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
								<span class="text-sm text-muted-foreground">Weight: {(factor.weight * 100).toFixed(0)}%</span>
							</div>
							<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
								<div class="h-full rounded-full bg-primary" style="width: {Math.min(factor.contribution * 100, 100)}%"></div>
							</div>
							<p class="mt-1 text-xs text-muted-foreground">{factor.details}</p>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Metadata -->
	<div class="rounded-lg border border-border bg-card p-6">
		<h3 class="mb-4 text-lg font-semibold">Metadata</h3>
		<dl class="grid grid-cols-2 gap-4">
			<div>
				<dt class="text-sm text-muted-foreground">Result ID</dt>
				<dd class="font-mono text-sm">{result.id}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Analysis ID</dt>
				<dd class="font-mono text-sm">{result.analysis_id}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">User ID</dt>
				<dd class="font-mono text-sm">{result.user_id}</dd>
			</div>
			<div>
				<dt class="text-sm text-muted-foreground">Created</dt>
				<dd class="text-sm">{new Date(result.created_at).toLocaleString()}</dd>
			</div>
		</dl>
	</div>
</div>

<div class="mt-4">
	<a href="/governance/outliers" class="text-sm text-primary hover:underline">Back to Outlier Detection</a>
</div>
