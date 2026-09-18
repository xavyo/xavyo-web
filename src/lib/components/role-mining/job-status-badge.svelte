<script lang="ts">
	import type { MiningJobStatus } from '$lib/api/types';

	const { status }: { status: MiningJobStatus } = $props();

	const config = $derived({
		pending: { label: 'Pending', class: 'bg-muted text-muted-foreground ' },
		running: { label: 'Running', class: 'bg-info/15 text-info' },
		completed: { label: 'Completed', class: 'bg-success/15 text-success' },
		failed: { label: 'Failed', class: 'bg-destructive/15 text-destructive' },
		cancelled: { label: 'Cancelled', class: 'bg-warning/15 text-warning' }
	}[status]);
</script>

<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {config.class}">
	{#if status === 'running'}
		<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-info"></span>
	{/if}
	{config.label}
</span>
