<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import RiskLevelBadge from '../../risk-level-badge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let scores = $derived(data.scores);

	let riskLevelFilter = $state(data.filters.risk_level ?? '');
	let minScoreFilter = $state(data.filters.min_score !== undefined ? String(data.filters.min_score) : '');
	let maxScoreFilter = $state(data.filters.max_score !== undefined ? String(data.filters.max_score) : '');

	function applyFilters() {
		const params = new URLSearchParams();
		if (riskLevelFilter) params.set('risk_level', riskLevelFilter);
		if (minScoreFilter) params.set('min_score', minScoreFilter);
		if (maxScoreFilter) params.set('max_score', maxScoreFilter);
		const qs = params.toString();
		goto(`/governance/risk/scores${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function truncateId(id: string): string {
		return id.length > 12 ? id.slice(0, 12) + '...' : id;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<PageHeader title="Risk Scores" description="View and filter identity risk scores across the organization">
	<a href="/governance/risk" class="text-sm text-muted-foreground hover:text-foreground hover:underline">&larr; Back to Risk Dashboard</a>
</PageHeader>

<!-- Filters -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={riskLevelFilter}
		onchange={applyFilters}
	>
		<option value="">All Risk Levels</option>
		<option value="low">Low</option>
		<option value="medium">Medium</option>
		<option value="high">High</option>
		<option value="critical">Critical</option>
	</select>

	<input
		type="number"
		placeholder="Min Score"
		class="h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={minScoreFilter}
		onchange={applyFilters}
	/>

	<input
		type="number"
		placeholder="Max Score"
		class="h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={maxScoreFilter}
		onchange={applyFilters}
	/>
</div>

{#if scores.items.length === 0}
	<EmptyState
		title="No risk scores"
		description="No risk scores match the current filters."
	/>
{:else}
	<div class="mb-2 text-sm text-muted-foreground">
		Showing {scores.offset + 1} - {Math.min(scores.offset + scores.limit, scores.total)} of {scores.total} risk scores
	</div>

	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">User ID</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Total Score</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Risk Level</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Static Score</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Dynamic Score</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Calculated At</th>
				</tr>
			</thead>
			<tbody>
				{#each scores.items as score}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3">
							<a
								href="/governance/risk/scores/{score.user_id}"
								class="font-medium text-primary hover:underline"
								title={score.user_id}
							>
								{truncateId(score.user_id)}
							</a>
						</td>
						<td class="px-4 py-3 font-medium text-foreground">{score.total_score.toFixed(1)}</td>
						<td class="px-4 py-3"><RiskLevelBadge level={score.risk_level} /></td>
						<td class="px-4 py-3 text-foreground">{score.static_score.toFixed(1)}</td>
						<td class="px-4 py-3 text-foreground">{score.dynamic_score.toFixed(1)}</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(score.calculated_at)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if scores.total > scores.limit}
		<div class="mt-4 flex items-center justify-between text-sm text-muted-foreground">
			<span>
				Showing {scores.offset + 1} - {Math.min(scores.offset + scores.limit, scores.total)} of {scores.total}
			</span>
			<div class="flex gap-2">
				{#if scores.offset > 0}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (riskLevelFilter) params.set('risk_level', riskLevelFilter);
							if (minScoreFilter) params.set('min_score', minScoreFilter);
							if (maxScoreFilter) params.set('max_score', maxScoreFilter);
							params.set('offset', String(Math.max(0, scores.offset - scores.limit)));
							goto(`/governance/risk/scores?${params.toString()}`, { replaceState: true });
						}}
					>
						Previous
					</Button>
				{/if}
				{#if scores.offset + scores.limit < scores.total}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (riskLevelFilter) params.set('risk_level', riskLevelFilter);
							if (minScoreFilter) params.set('min_score', minScoreFilter);
							if (maxScoreFilter) params.set('max_score', maxScoreFilter);
							params.set('offset', String(scores.offset + scores.limit));
							goto(`/governance/risk/scores?${params.toString()}`, { replaceState: true });
						}}
					>
						Next
					</Button>
				{/if}
			</div>
		</div>
	{/if}
{/if}
