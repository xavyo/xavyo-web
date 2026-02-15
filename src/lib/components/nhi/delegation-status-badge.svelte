<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
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
