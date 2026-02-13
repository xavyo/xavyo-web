<script lang="ts">
	interface Props {
		score: number;
		size?: 'sm' | 'md';
	}

	let { score, size = 'md' }: Props = $props();

	const badgeClass = $derived(() => {
		if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
		if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
		return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
	});

	const sizeClass = $derived(size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1');
</script>

<span class="inline-flex items-center rounded-full font-medium {badgeClass()} {sizeClass}" data-testid="confidence-badge">
	{score.toFixed(1)}%
</span>
