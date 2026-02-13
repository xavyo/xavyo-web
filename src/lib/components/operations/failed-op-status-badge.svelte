<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		pending_retry: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		retrying: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
		dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
		resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
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
