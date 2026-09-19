<script lang="ts">
	import type { SimulationStatus } from '$lib/api/types';

	const { status }: { status: SimulationStatus } = $props();

	const config = $derived({
		draft: { label: 'Draft', class: 'bg-muted text-muted-foreground ' },
		executed: { label: 'Executed', class: 'bg-info/15 text-info' },
		applied: { label: 'Applied', class: 'bg-success/15 text-success' },
		cancelled: { label: 'Cancelled', class: 'bg-warning/15 text-warning' }
	}[status]);
</script>

<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {config.class}">
	{config.label}
</span>
