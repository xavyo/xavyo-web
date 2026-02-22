<script lang="ts">
	let { simulationId, simulationType = 'policy', baseUrl }: {
		simulationId: string;
		simulationType?: 'policy' | 'batch' | 'comparison';
		baseUrl?: string;
	} = $props();

	let open = $state(false);

	const urlMap = $derived<Record<string, string>>({
		policy: `/api/governance/simulations/policy/${simulationId}/export`,
		batch: `/api/governance/simulations/batch/${simulationId}/export`,
		comparison: `/api/governance/simulations/comparisons/${simulationId}/export`
	});

	let exportUrl = $derived(baseUrl || urlMap[simulationType]);

	function handleExport(format: 'json' | 'csv') {
		window.open(`${exportUrl}?format=${format}`, '_blank');
		open = false;
	}
</script>

<div class="relative">
	<button
		type="button"
		class="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
		onclick={() => (open = !open)}
	>
		Export
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>
	{#if open}
		<div class="absolute right-0 z-10 mt-1 w-32 rounded-md border border-border bg-popover shadow-lg">
			<button
				type="button"
				class="w-full px-4 py-2 text-left text-sm hover:bg-accent"
				onclick={() => handleExport('json')}
			>
				JSON
			</button>
			<button
				type="button"
				class="w-full px-4 py-2 text-left text-sm hover:bg-accent"
				onclick={() => handleExport('csv')}
			>
				CSV
			</button>
		</div>
	{/if}
</div>
