<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		active: 'bg-success/15 text-success',
		inactive: 'bg-muted text-muted-foreground '
	};

	const labels: Record<string, string> = {
		active: 'Active',
		inactive: 'Inactive'
	};
</script>

<Badge class={variants[status] ?? variants.inactive}>
	{labels[status] ?? status}
</Badge>
