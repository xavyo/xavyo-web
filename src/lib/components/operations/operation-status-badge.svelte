<script lang="ts">
	interface Props {
		status: string;
	}

	let { status }: Props = $props();

	const statusColors: Record<string, string> = {
		pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
		in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
		dead_letter: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
		awaiting_system: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
		resolved: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
		cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
	};

	const colorClass = $derived(
		statusColors[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
	);

	const displayText = $derived(
		status
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase())
	);
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colorClass}">
	{displayText}
</span>
