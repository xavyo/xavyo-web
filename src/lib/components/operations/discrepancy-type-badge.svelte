<script lang="ts">
	interface Props {
		type: string;
	}

	let { type }: Props = $props();

	const typeColors: Record<string, string> = {
		missing: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
		orphan: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
		mismatch: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		collision: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
		unlinked: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		deleted: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
	};

	const colorClass = $derived(
		typeColors[type] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
	);

	const displayText = $derived(
		type.replace(/\b\w/g, (c) => c.toUpperCase())
	);
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colorClass}">
	{displayText}
</span>
