<script lang="ts">
	import type { BatchExportStatus } from '$lib/api/types';

	let { status }: { status: BatchExportStatus } = $props();

	const labels: Record<string, string> = {
		pending: 'Pending',
		processing: 'Processing',
		completed: 'Completed',
		failed: 'Failed'
	};

	const colors: Record<string, string> = {
		pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
	};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colors[status] ?? 'bg-gray-100 text-gray-800'}">
	{labels[status] ?? status}
</span>
