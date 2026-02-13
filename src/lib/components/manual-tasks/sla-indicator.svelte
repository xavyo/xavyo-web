<script lang="ts">
	interface Props {
		slaDeadline: string | null;
		slaBreached: boolean;
		slaWarningSent: boolean;
	}

	let { slaDeadline, slaBreached, slaWarningSent }: Props = $props();

	const status = $derived(
		slaBreached ? 'breached' : slaWarningSent ? 'at-risk' : 'normal'
	);

	const config: Record<string, { label: string; class: string }> = {
		breached: { label: 'SLA Breached', class: 'text-red-600 dark:text-red-400' },
		'at-risk': { label: 'SLA At Risk', class: 'text-orange-600 dark:text-orange-400' },
		normal: { label: 'On Track', class: 'text-green-600 dark:text-green-400' }
	};

	const current = $derived(config[status]);

	function formatDeadline(d: string | null): string {
		if (!d) return 'No deadline';
		const date = new Date(d);
		if (isNaN(date.getTime())) return 'Invalid date';
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="flex flex-col">
	<span class="text-sm font-medium {current.class}">{current.label}</span>
	{#if slaDeadline}
		<span class="text-xs text-muted-foreground">{formatDeadline(slaDeadline)}</span>
	{/if}
</div>
