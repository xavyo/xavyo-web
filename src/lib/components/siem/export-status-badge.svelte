<script lang="ts">
	import type { BatchExportStatus } from '$lib/api/types';

	let { status }: { status: BatchExportStatus } = $props();

	const labels: Record<string, string> = {
		pending: 'Pending',
		processing: 'Processing',
		completed: 'Completed',
		failed: 'Failed'
	};

	const colors: Record<string, string> = {
		pending: 'bg-muted text-muted-foreground',
		processing: 'bg-info/15 text-info',
		completed: 'bg-success/15 text-success',
		failed: 'bg-destructive/15 text-destructive'
	};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colors[status] ?? 'bg-muted text-muted-foreground'}">
	{labels[status] ?? status}
</span>
