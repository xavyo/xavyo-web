<script lang="ts">
	interface Props {
		status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
	}

	let { status }: Props = $props();

	const config: Record<string, { label: string; class: string }> = {
		pending: { label: 'Pending', class: 'bg-warning/15 text-warning' },
		in_progress: { label: 'In Progress', class: 'bg-info/15 text-info' },
		completed: { label: 'Completed', class: 'bg-success/15 text-success' },
		rejected: { label: 'Rejected', class: 'bg-destructive/15 text-destructive' },
		cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground' }
	};

	const current = $derived(config[status] ?? { label: status, class: 'bg-muted text-muted-foreground' });
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {current.class}">
	{current.label}
</span>
