<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		active: 'bg-success/15 text-success',
		expired: 'bg-warning/15 text-warning',
		revoked: 'bg-destructive/15 text-destructive',
		unknown: 'bg-muted text-muted-foreground '
	};

	const labels: Record<string, string> = {
		active: 'Active',
		expired: 'Expired',
		revoked: 'Revoked'
	};
</script>

<Badge class={variants[status] ?? variants.unknown}>
	{labels[status] ?? status}
</Badge>
