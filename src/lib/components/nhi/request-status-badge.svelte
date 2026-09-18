<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		pending: 'bg-warning/15 text-warning',
		approved: 'bg-success/15 text-success',
		rejected: 'bg-destructive/15 text-destructive',
		cancelled: 'bg-muted text-muted-foreground '
	};

	const labels: Record<string, string> = {
		pending: 'Pending',
		approved: 'Approved',
		rejected: 'Rejected',
		cancelled: 'Cancelled'
	};
</script>

<Badge class={variants[status] ?? variants.pending}>
	{labels[status] ?? status}
</Badge>
