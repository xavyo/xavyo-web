<script lang="ts">
	import type { AlertSeverity } from '$lib/api/types';

	let { severity }: { severity: AlertSeverity } = $props();

	const styles: Record<AlertSeverity, string> = {
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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
