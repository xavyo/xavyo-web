<script lang="ts">
	import type { HourlyCount } from '$lib/api/types';

	interface Props {
		data: HourlyCount[];
	}

	let { data }: Props = $props();

	const maxCount = $derived(Math.max(...data.map((d) => d.count), 1));

	function getHeight(count: number): string {
		return `${Math.max((count / maxCount) * 100, 2)}%`;
	}
</script>

<div class="space-y-2">
	<h4 class="text-sm font-medium">Hourly Distribution</h4>
	<div class="flex h-32 items-end gap-0.5">
		{#each Array(24) as _, hour}
			{@const entry = data.find((d) => d.hour === hour)}
			{@const count = entry?.count ?? 0}
			<div class="group relative flex flex-1 flex-col items-center">
				<div
					class="w-full rounded-t bg-primary/80 transition-colors hover:bg-primary dark:bg-primary/60 dark:hover:bg-primary/80"
					style="height: {count > 0 ? getHeight(count) : '2%'}"
					title="{hour}:00 — {count} attempts"
				></div>
			</div>
		{/each}
	</div>
	<div class="flex gap-0.5">
		{#each Array(24) as _, hour}
			<div class="flex-1 text-center text-[9px] text-muted-foreground">
				{#if hour % 4 === 0}
					{hour}
				{/if}
			</div>
		{/each}
	</div>
</div>
