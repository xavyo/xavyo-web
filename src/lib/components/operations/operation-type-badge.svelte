<script lang="ts">
	interface Props {
		type: string;
	}

	let { type }: Props = $props();

	const typeColors: Record<string, string> = {
		create: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
		update: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		delete: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
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
