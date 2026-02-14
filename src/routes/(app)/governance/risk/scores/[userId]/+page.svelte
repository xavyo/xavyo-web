<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import RiskLevelBadge from '../../../risk-level-badge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let score = $derived(data.score);
	let userId = $derived(data.userId);

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<PageHeader title="Risk Score — {userId}" description="Detailed risk score breakdown for this user">
	<a href="/governance/risk/scores" class="text-sm text-muted-foreground hover:text-foreground hover:underline">&larr; Back to Risk Scores</a>
</PageHeader>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Score Overview -->
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold text-foreground">Score Overview</h2>
		</CardHeader>
		<CardContent>
			<div class="mb-4 flex items-center gap-4">
				<span class="text-4xl font-bold text-foreground">{score.total_score.toFixed(1)}</span>
				<RiskLevelBadge level={score.risk_level} />
			</div>

			<Separator class="my-4" />

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">Static Score</p>
					<p class="font-medium text-foreground">{score.static_score.toFixed(1)}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Dynamic Score</p>
					<p class="font-medium text-foreground">{score.dynamic_score.toFixed(1)}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Calculated At</p>
					<p class="text-sm text-foreground">{formatDate(score.calculated_at)}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Last Updated</p>
					<p class="text-sm text-foreground">{formatDate(score.updated_at)}</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Peer Comparison -->
	{#if score.peer_comparison}
		<Card>
			<CardHeader>
				<h2 class="text-lg font-semibold text-foreground">Peer Comparison</h2>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<p class="text-sm text-muted-foreground">Group</p>
						<p class="font-medium text-foreground">{score.peer_comparison.group_name}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Group Average</p>
						<p class="font-medium text-foreground">{score.peer_comparison.group_average.toFixed(1)}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Deviation</p>
						<p class="font-medium text-foreground">{score.peer_comparison.deviation.toFixed(1)}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Std Dev</p>
						<p class="font-medium text-foreground">{score.peer_comparison.group_stddev.toFixed(1)}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Entitlements</p>
						<p class="font-medium text-foreground">{score.peer_comparison.user_entitlement_count}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Outlier</p>
						<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {score.peer_comparison.is_outlier ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}">
							{score.peer_comparison.is_outlier ? 'Yes' : 'No'}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Factor Breakdown -->
{#if score.factor_breakdown.length > 0}
	<div class="mt-6">
		<Card>
			<CardHeader>
				<h2 class="text-lg font-semibold text-foreground">Factor Breakdown</h2>
			</CardHeader>
			<CardContent>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="border-b border-border bg-muted/50">
							<tr>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Factor Name</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Raw Value</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Weight</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Contribution</th>
							</tr>
						</thead>
						<tbody>
							{#each score.factor_breakdown as factor}
								<tr class="border-b border-border hover:bg-muted/30">
									<td class="px-4 py-3 font-medium text-foreground">{factor.factor_name}</td>
									<td class="px-4 py-3 text-foreground">{factor.category}</td>
									<td class="px-4 py-3 text-foreground">{factor.raw_value.toFixed(2)}</td>
									<td class="px-4 py-3 text-foreground">{factor.weight.toFixed(2)}</td>
									<td class="px-4 py-3 text-foreground">{factor.contribution.toFixed(2)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}

<!-- Actions -->
<div class="mt-6 flex items-center gap-4">
	<a
		href="/governance/risk/events/{userId}"
		class="text-sm font-medium text-primary hover:underline"
	>
		View Risk Events &rarr;
	</a>
	<a href="/governance/risk/scores" class="text-sm text-muted-foreground hover:text-foreground hover:underline">&larr; Back to Risk Scores</a>
</div>
