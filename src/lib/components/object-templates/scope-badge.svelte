<script lang="ts">
	interface Props {
		scopeType: 'global' | 'organization' | 'category' | 'condition';
		scopeValue?: string | null;
	}

	let { scopeType, scopeValue = null }: Props = $props();

	const labels: Record<string, string> = {
		global: 'Global',
		organization: 'Organization',
		category: 'Category',
		condition: 'Condition'
	};

	const colors: Record<string, string> = {
		global: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
		organization: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
		category: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
		condition: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
	};
</script>

<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {colors[scopeType] ?? 'bg-zinc-100 text-zinc-600'}">
	<span>{labels[scopeType] ?? scopeType}</span>
	{#if scopeValue && scopeType !== 'global'}
		<span class="opacity-70">: {scopeValue}</span>
	{/if}
</span>
