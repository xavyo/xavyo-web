<script lang="ts">
	import type { MiningJobStatus } from '$lib/api/types';

	const { status }: { status: MiningJobStatus } = $props();

	const config = $derived({
		pending: { label: 'Pending', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
		running: { label: 'Running', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
		completed: { label: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
		failed: { label: 'Failed', class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
		cancelled: { label: 'Cancelled', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' }
	}[status]);
</script>

<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {config.class}">
	{#if status === 'running'}
		<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
	{/if}
	{config.label}
</span>
