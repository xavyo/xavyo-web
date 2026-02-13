<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { status }: { status: string } = $props();

	const variants: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		previewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		approved: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
		executing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
		completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
	};

	const labels: Record<string, string> = {
		pending: 'Pending',
		previewing: 'Previewing',
		approved: 'Approved',
		executing: 'Executing',
		completed: 'Completed',
		failed: 'Failed',
		cancelled: 'Cancelled'
	};
</script>

<Badge class={variants[status] ?? variants.pending}>
	{labels[status] ?? status}
</Badge>
