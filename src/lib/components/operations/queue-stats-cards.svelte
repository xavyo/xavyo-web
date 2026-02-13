<script lang="ts">
	import type { QueueStatistics } from '$lib/api/types';

	interface Props {
		stats: QueueStatistics;
	}

	let { stats }: Props = $props();

	interface CardConfig {
		label: string;
		key: keyof QueueStatistics | null;
		dotColor: string;
	}

	const cards: CardConfig[] = [
		{ label: 'Pending', key: 'pending', dotColor: 'bg-gray-400' },
		{ label: 'In Progress', key: 'in_progress', dotColor: 'bg-blue-500' },
		{ label: 'Completed', key: 'completed', dotColor: 'bg-green-500' },
		{ label: 'Failed', key: 'failed', dotColor: 'bg-red-500' },
		{ label: 'Dead Letter', key: 'dead_letter', dotColor: 'bg-amber-500' },
		{ label: 'Awaiting System', key: 'awaiting_system', dotColor: 'bg-purple-500' },
		{ label: 'Avg Time', key: null, dotColor: 'bg-cyan-500' }
	];

	function formatAvgTime(secs: number | null | undefined): string {
		if (secs == null || secs === 0) return 'N/A';
		return `${secs.toFixed(1)}s`;
	}
</script>

<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
	{#each cards as card}
		<div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
			<div class="flex items-center gap-2">
				<span class="inline-block h-2 w-2 rounded-full {card.dotColor}"></span>
				<span class="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
			</div>
			<p class="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
				{#if card.key !== null}
					{stats[card.key] ?? 0}
				{:else}
					{formatAvgTime(stats.avg_processing_time_secs)}
				{/if}
			</p>
		</div>
	{/each}
</div>
