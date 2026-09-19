<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		queued: 'bg-warning/15 text-warning',
		processing: 'bg-warning/15 text-warning',
		completed: 'bg-success/15 text-success',
		failed: 'bg-destructive/15 text-destructive',
		cancelled: 'bg-muted text-muted-foreground '
	};

	const labels: Record<string, string> = {
		queued: 'Queued',
		processing: 'Processing',
		completed: 'Completed',
		failed: 'Failed',
		cancelled: 'Cancelled'
	};
</script>

<Badge class={variants[status] ?? variants.queued}>
	{labels[status] ?? status}
</Badge>
