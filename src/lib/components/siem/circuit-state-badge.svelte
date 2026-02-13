<script lang="ts">
	import type { CircuitState } from '$lib/api/types';

	let { state }: { state: CircuitState } = $props();

	const labels: Record<string, string> = {
		closed: 'Closed',
		open: 'Open',
		half_open: 'Half Open'
	};

	const colors: Record<string, string> = {
		closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		open: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		half_open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
	};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colors[state] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
	{labels[state] ?? state}
</span>
