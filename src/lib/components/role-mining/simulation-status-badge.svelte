<script lang="ts">
	import type { SimulationStatus } from '$lib/api/types';

	const { status }: { status: SimulationStatus } = $props();

	const config = $derived({
		draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
		executed: { label: 'Executed', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
		applied: { label: 'Applied', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
		cancelled: { label: 'Cancelled', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' }
	}[status]);
</script>

<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {config.class}">
	{config.label}
</span>
