<script lang="ts">
	let { status }: { status: string } = $props();

	const styles: Record<string, string> = {
		active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
	};

	const labels: Record<string, string> = {
		active: 'Active',
		inactive: 'Inactive',
		suspended: 'Suspended'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {styles[status] ?? 'bg-gray-100 text-gray-800'}"
	>{labels[status] ?? status}</span
>
