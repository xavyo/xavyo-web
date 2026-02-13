<script lang="ts">
	interface Props {
		status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
	}

	let { status }: Props = $props();

	const config: Record<string, { label: string; class: string }> = {
		pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
		in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
		completed: { label: 'Completed', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
		rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
		cancelled: { label: 'Cancelled', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
	};

	const current = $derived(config[status] ?? { label: status, class: 'bg-gray-100 text-gray-800' });
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {current.class}">
	{current.label}
</span>
