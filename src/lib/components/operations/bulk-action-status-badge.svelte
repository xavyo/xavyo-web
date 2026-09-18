<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		pending: 'bg-warning/15 text-warning',
		previewing: 'bg-info/15 text-info',
		approved: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
		executing: 'bg-warning/15 text-warning',
		completed: 'bg-success/15 text-success',
		failed: 'bg-destructive/15 text-destructive',
		cancelled: 'bg-muted text-muted-foreground '
	};

	const labels: Record<string, string> = {
		pending: 'Pending',
		previewing: 'Previewing',
		approved: 'Approved',
		executing: 'Executing',
		completed: 'Completed',
		failed: 'Failed',
		cancelled: 'Cancelled'
	};
</script>

<Badge class={variants[status] ?? variants.pending}>
	{labels[status] ?? status}
</Badge>
