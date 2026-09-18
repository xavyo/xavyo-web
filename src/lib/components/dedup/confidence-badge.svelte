<script lang="ts">
	interface Props {
		score: number;
		size?: 'sm' | 'md';
	}

	let { score, size = 'md' }: Props = $props();

	const badgeClass = $derived(() => {
		if (score >= 80) return 'bg-success/15 text-success';
		if (score >= 50) return 'bg-warning/15 text-warning';
		return 'bg-muted text-muted-foreground ';
	});

	const sizeClass = $derived(size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1');
</script>

<span class="inline-flex items-center rounded-full font-medium {badgeClass()} {sizeClass}" data-testid="confidence-badge">
	{score.toFixed(1)}%
</span>
