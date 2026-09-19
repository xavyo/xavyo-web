<script lang="ts">
	import type { AlertSeverity } from '$lib/api/types';

	let { severity }: { severity: AlertSeverity } = $props();

	const styles: Record<AlertSeverity, string> = {
		info: 'bg-info/15 text-info',
		warning: 'bg-warning/15 text-warning',
		critical: 'bg-destructive/15 text-destructive'
	};

	const labels: Record<AlertSeverity, string> = {
		info: 'Info',
		warning: 'Warning',
		critical: 'Critical'
	};
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {styles[severity]}"
	>{labels[severity]}</span
>
