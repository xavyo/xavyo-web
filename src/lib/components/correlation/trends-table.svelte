<script lang="ts">
	import type { CorrelationTrends } from '$lib/api/types';
	import { Info } from 'lucide-svelte';

	interface Props {
		trends: CorrelationTrends | null;
		isLoading?: boolean;
	}

	let { trends, isLoading = false }: Props = $props();

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		return d.toLocaleDateString();
	}
</script>

{#if isLoading}
	<div class="space-y-3">
		<div class="h-4 w-48 animate-pulse rounded bg-muted"></div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Date</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Total Evaluated</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Auto-Confirmed</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Manual Review</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">No Match</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Avg Confidence</th>
					</tr>
				</thead>
				<tbody>
					{#each Array(5) as _}
						<tr class="border-b border-border">
							{#each Array(6) as __}
								<td class="px-3 py-2">
									<div class="h-4 w-16 animate-pulse rounded bg-muted"></div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{:else if trends && trends.daily_trends.length > 0}
	<div class="space-y-3">
		<p class="text-sm text-muted-foreground">
			{formatDate(trends.period_start)} to {formatDate(trends.period_end)}
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Date</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Total Evaluated</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Auto-Confirmed</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Manual Review</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">No Match</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Avg Confidence</th>
					</tr>
				</thead>
				<tbody>
					{#each trends.daily_trends as day}
						<tr class="border-b border-border">
							<td class="px-3 py-2 text-foreground">{formatDate(day.date)}</td>
							<td class="px-3 py-2 text-foreground">
								{day.total_evaluated.toLocaleString()}
							</td>
							<td class="px-3 py-2 text-green-600 dark:text-green-400">
								{day.auto_confirmed.toLocaleString()}
							</td>
							<td class="px-3 py-2 text-yellow-600 dark:text-yellow-400">
								{day.manual_review.toLocaleString()}
							</td>
							<td class="px-3 py-2 text-muted-foreground">
								{day.no_match.toLocaleString()}
							</td>
							<td class="px-3 py-2 text-foreground">
								{Math.round(day.average_confidence * 100)}%
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if trends.suggestions.length > 0}
			<div
				class="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30"
			>
				<Info class="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
				<div class="space-y-1">
					<p class="text-sm font-medium text-blue-800 dark:text-blue-300">Suggestions</p>
					<ul class="list-inside list-disc space-y-0.5 text-sm text-blue-700 dark:text-blue-400">
						{#each trends.suggestions as suggestion}
							<li>{suggestion}</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p class="py-8 text-center text-sm text-muted-foreground">No trend data available.</p>
{/if}
