<script lang="ts">
	import type { CircuitState } from '$lib/api/types';

	let { state }: { state: CircuitState } = $props();

	const labels: Record<string, string> = {
		closed: 'Closed',
		open: 'Open',
		half_open: 'Half Open'
	};

	const colors: Record<string, string> = {
		closed: 'bg-success/15 text-success',
		open: 'bg-destructive/15 text-destructive',
		half_open: 'bg-warning/15 text-warning'
	};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colors[state] ?? 'bg-muted text-muted-foreground'}">
	{labels[state] ?? state}
</span>
