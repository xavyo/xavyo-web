<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		draft: 'bg-warning/15 text-warning',
		active: 'bg-success/15 text-success',
		inactive: 'bg-muted text-muted-foreground '
	};

	const labels: Record<string, string> = {
		draft: 'Draft',
		active: 'Active',
		inactive: 'Inactive'
	};
</script>

<Badge class={variants[status] ?? variants.draft}>
	{labels[status] ?? status}
</Badge>
