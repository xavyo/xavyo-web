<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		pending_retry: 'bg-warning/15 text-warning',
		retrying: 'bg-warning/15 text-warning',
		dismissed: 'bg-muted text-muted-foreground ',
		resolved: 'bg-success/15 text-success'
	};

	const labels: Record<string, string> = {
		pending_retry: 'Pending Retry',
		retrying: 'Retrying',
		dismissed: 'Dismissed',
		resolved: 'Resolved'
	};
</script>

<Badge class={variants[status] ?? variants.pending_retry}>
	{labels[status] ?? status}
</Badge>
