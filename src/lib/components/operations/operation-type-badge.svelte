<script lang="ts">
	interface Props {
		type: string;
	}

	let { type }: Props = $props();

	const typeColors: Record<string, string> = {
		create: 'bg-success/15 text-success',
		update: 'bg-info/15 text-info',
		delete: 'bg-destructive/15 text-destructive'
	};

	const colorClass = $derived(
		typeColors[type] ?? 'bg-muted text-muted-foreground '
	);

	const displayText = $derived(
		type.replace(/\b\w/g, (c) => c.toUpperCase())
	);
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colorClass}">
	{displayText}
</span>
