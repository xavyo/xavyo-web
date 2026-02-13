<script lang="ts">
	import type { RiskLevel } from '$lib/api/types';

	let { level }: { level: RiskLevel } = $props();

	const styles: Record<RiskLevel, string> = {
		low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};

	const labels: Record<RiskLevel, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		critical: 'Critical'
	};
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {styles[level]}"
	>{labels[level]}</span
>
