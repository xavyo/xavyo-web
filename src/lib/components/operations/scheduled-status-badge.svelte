<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		pending: 'bg-warning/15 text-warning',
		executed: 'bg-success/15 text-success',
		cancelled: 'bg-muted text-muted-foreground ',
		failed: 'bg-destructive/15 text-destructive'
	};

	const labels: Record<string, string> = {
		pending: 'Pending',
		executed: 'Executed',
		cancelled: 'Cancelled',
		failed: 'Failed'
	};
</script>

<Badge class={variants[status] ?? variants.pending}>
	{labels[status] ?? status}
</Badge>
