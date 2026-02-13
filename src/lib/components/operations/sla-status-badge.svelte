<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
	};

	const labels: Record<string, string> = {
		active: 'Active',
		inactive: 'Inactive'
	};
</script>

<Badge class={variants[status] ?? variants.inactive}>
	{labels[status] ?? status}
</Badge>
