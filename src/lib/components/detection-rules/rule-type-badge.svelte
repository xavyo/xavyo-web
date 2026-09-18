<script lang="ts">
	interface Props {
		ruleType: 'no_manager' | 'terminated' | 'inactive' | 'custom';
	}

	let { ruleType }: Props = $props();

	const config: Record<string, { label: string; class: string }> = {
		no_manager: { label: 'No Manager', class: 'bg-warning/15 text-warning' },
		terminated: { label: 'Terminated', class: 'bg-destructive/15 text-destructive' },
		inactive: { label: 'Inactive', class: 'bg-warning/15 text-warning' },
		custom: { label: 'Custom', class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' }
	};

	const current = $derived(config[ruleType] ?? { label: ruleType, class: 'bg-muted text-muted-foreground' });
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {current.class}">
	{current.label}
</span>
