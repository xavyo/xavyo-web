<script lang="ts">
	import type { RiskLevel } from '$lib/api/types';

	let { level }: { level: RiskLevel } = $props();

	const styles: Record<RiskLevel, string> = {
		low: 'bg-success/15 text-success',
		medium: 'bg-warning/15 text-warning',
		high: 'bg-warning/15 text-warning',
		critical: 'bg-destructive/15 text-destructive'
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
