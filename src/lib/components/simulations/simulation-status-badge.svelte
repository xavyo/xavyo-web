<script lang="ts">
	import type { SimulationStatus, Severity, ImpactType } from '$lib/api/types';

	let { value, type = 'status' }: { value: string; type?: 'status' | 'severity' | 'impact' } = $props();

	const statusColors: Record<string, string> = {
		draft: 'bg-muted text-muted-foreground',
		executed: 'bg-info/15 text-info',
		applied: 'bg-success/15 text-success',
		cancelled: 'bg-destructive/15 text-destructive'
	};

	const severityColors: Record<string, string> = {
		critical: 'bg-destructive/15 text-destructive',
		high: 'bg-warning/15 text-warning',
		medium: 'bg-warning/15 text-warning',
		low: 'bg-success/15 text-success'
	};

	const impactColors: Record<string, string> = {
		violation: 'bg-destructive/15 text-destructive',
		entitlement_gain: 'bg-success/15 text-success',
		entitlement_loss: 'bg-warning/15 text-warning',
		no_change: 'bg-muted text-muted-foreground',
		warning: 'bg-warning/15 text-warning'
	};

	const colorMap = $derived(type === 'severity' ? severityColors : type === 'impact' ? impactColors : statusColors);
	let colorClass = $derived(colorMap[value] || 'bg-muted text-muted-foreground');
	let displayValue = $derived(value.replace(/_/g, ' '));
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {colorClass}">
	{displayValue}
</span>
