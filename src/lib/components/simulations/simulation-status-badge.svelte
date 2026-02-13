<script lang="ts">
	import type { SimulationStatus, Severity, ImpactType } from '$lib/api/types';

	let { value, type = 'status' }: { value: string; type?: 'status' | 'severity' | 'impact' } = $props();

	const statusColors: Record<string, string> = {
		draft: 'bg-muted text-muted-foreground',
		executed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		applied: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};

	const severityColors: Record<string, string> = {
		critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
		medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
	};

	const impactColors: Record<string, string> = {
		violation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		entitlement_gain: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		entitlement_loss: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
		no_change: 'bg-muted text-muted-foreground',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
	};

	const colorMap = type === 'severity' ? severityColors : type === 'impact' ? impactColors : statusColors;
	let colorClass = $derived(colorMap[value] || 'bg-muted text-muted-foreground');
	let displayValue = $derived(value.replace(/_/g, ' '));
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {colorClass}">
	{displayValue}
</span>
