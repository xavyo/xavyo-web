<script lang="ts">
	interface Props {
		ruleType: 'default' | 'computed' | 'validation' | 'normalization';
	}

	let { ruleType }: Props = $props();

	const labels: Record<string, string> = {
		default: 'Default',
		computed: 'Computed',
		validation: 'Validation',
		normalization: 'Normalization'
	};

	const colors: Record<string, string> = {
		default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		computed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
		validation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
		normalization: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
	};
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colors[ruleType] ?? 'bg-zinc-100 text-zinc-600'}">
	{labels[ruleType] ?? ruleType}
</span>
