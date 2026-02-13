<script lang="ts">
	interface DataPoint {
		date: string;
		total: number;
		by_type?: Record<string, number> | null;
	}

	interface Props {
		dataPoints: DataPoint[];
	}

	let { dataPoints }: Props = $props();

	const maxValue = $derived(
		dataPoints.length > 0
			? Math.max(...dataPoints.map((p) => p.total), 1)
			: 1
	);

	function barHeight(total: number): string {
		return `${(total / maxValue) * 100}%`;
	}

	function formatDate(date: string): string {
		const d = new Date(date);
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
</script>

{#if dataPoints.length === 0}
	<p class="text-sm text-gray-500 dark:text-gray-400">No trend data available.</p>
{:else}
	<div class="flex gap-2">
		<!-- Y-axis labels -->
		<div class="flex flex-col justify-between py-1 text-xs text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">
			<span>{maxValue}</span>
			<span>0</span>
		</div>

		<!-- Chart area -->
		<div class="flex-1 flex flex-col">
			<!-- Bars -->
			<div class="flex items-end gap-1 h-48">
				{#each dataPoints as point}
					<div
						class="flex-1 rounded-t bg-blue-500 dark:bg-blue-400 transition-all min-w-1"
						style="height: {barHeight(point.total)}"
						title="{point.date}: {point.total}"
					></div>
				{/each}
			</div>

			<!-- Date labels -->
			<div class="flex gap-1 mt-2">
				{#each dataPoints as point}
					<div class="flex-1 min-w-1">
						<span
							class="block text-xs text-gray-500 dark:text-gray-400 origin-top-left rotate-45 whitespace-nowrap"
						>
							{formatDate(point.date)}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
