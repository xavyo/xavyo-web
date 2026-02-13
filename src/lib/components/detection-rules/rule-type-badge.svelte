<script lang="ts">
	interface Props {
		ruleType: 'no_manager' | 'terminated' | 'inactive' | 'custom';
	}

	let { ruleType }: Props = $props();

	const config: Record<string, { label: string; class: string }> = {
		no_manager: { label: 'No Manager', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
		terminated: { label: 'Terminated', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
		inactive: { label: 'Inactive', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
		custom: { label: 'Custom', class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' }
	};

	const current = $derived(config[ruleType] ?? { label: ruleType, class: 'bg-gray-100 text-gray-800' });
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {current.class}">
	{current.label}
</span>
