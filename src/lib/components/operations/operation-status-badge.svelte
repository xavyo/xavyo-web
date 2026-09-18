<script lang="ts">
	interface Props {
		status: string;
	}

	let { status }: Props = $props();

	const statusColors: Record<string, string> = {
		pending: 'bg-muted text-muted-foreground ',
		in_progress: 'bg-info/15 text-info',
		completed: 'bg-success/15 text-success',
		failed: 'bg-destructive/15 text-destructive',
		dead_letter: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
		awaiting_system: 'bg-primary/15 text-primary',
		resolved: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
		cancelled: 'bg-muted text-muted-foreground '
	};

	const colorClass = $derived(
		statusColors[status] ?? 'bg-muted text-muted-foreground '
	);

	const displayText = $derived(
		status
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase())
	);
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {colorClass}">
	{displayText}
</span>
