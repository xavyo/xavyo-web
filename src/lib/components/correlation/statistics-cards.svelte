<script lang="ts">
	import type { CorrelationStatistics } from '$lib/api/types';
	import { Info } from 'lucide-svelte';

	interface Props {
		statistics: CorrelationStatistics | null;
		isLoading?: boolean;
	}

	let { statistics, isLoading = false }: Props = $props();

	let cards = $derived(
		statistics
			? [
					{
						label: 'Total Evaluated',
						value: statistics.total_evaluated.toLocaleString(),
						color: 'text-foreground'
					},
					{
						label: 'Auto-Confirmed',
						value: `${statistics.auto_confirmed_count.toLocaleString()} (${Math.round(statistics.auto_confirmed_percentage)}%)`,
						color: 'text-green-600 dark:text-green-400'
					},
					{
						label: 'Manual Review',
						value: `${statistics.manual_review_count.toLocaleString()} (${Math.round(statistics.manual_review_percentage)}%)`,
						color: 'text-yellow-600 dark:text-yellow-400'
					},
					{
						label: 'No Match',
						value: `${statistics.no_match_count.toLocaleString()} (${Math.round(statistics.no_match_percentage)}%)`,
						color: 'text-muted-foreground'
					},
					{
						label: 'Average Confidence',
						value: `${Math.round(statistics.average_confidence * 100)}%`,
						color: 'text-foreground'
					},
					{
						label: 'Review Queue Depth',
						value: statistics.review_queue_depth.toLocaleString(),
						color: 'text-foreground'
					}
				]
			: []
	);

	let cardBgClasses = [
		'',
		'bg-green-50 dark:bg-green-950/20',
		'bg-yellow-50 dark:bg-yellow-950/20',
		'bg-gray-50 dark:bg-gray-950/20',
		'',
		''
	];
</script>

{#if isLoading}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each Array(6) as _}
			<div class="animate-pulse rounded-lg border border-border p-4">
				<div class="mb-2 h-3 w-24 rounded bg-muted"></div>
				<div class="h-6 w-16 rounded bg-muted"></div>
			</div>
		{/each}
	</div>
{:else if statistics}
	<div class="space-y-4">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each cards as card, i}
				<div class="rounded-lg border border-border p-4 {cardBgClasses[i] ?? ''}">
					<p class="text-xs font-medium text-muted-foreground">{card.label}</p>
					<p class="mt-1 text-xl font-semibold {card.color}">{card.value}</p>
				</div>
			{/each}
		</div>

		{#if statistics.suggestions.length > 0}
			<div
				class="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30"
			>
				<Info class="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
				<div class="space-y-1">
					<p class="text-sm font-medium text-blue-800 dark:text-blue-300">Suggestions</p>
					<ul class="list-inside list-disc space-y-0.5 text-sm text-blue-700 dark:text-blue-400">
						{#each statistics.suggestions as suggestion}
							<li>{suggestion}</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p class="py-8 text-center text-sm text-muted-foreground">No statistics data available.</p>
{/if}
