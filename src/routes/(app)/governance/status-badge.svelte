<script lang="ts">
	let { status }: { status: string } = $props();

	const styles: Record<string, string> = {
		active: 'bg-success/15 text-success',
		inactive: 'bg-muted text-muted-foreground ',
		suspended: 'bg-warning/15 text-warning'
	};

	const labels: Record<string, string> = {
		active: 'Active',
		inactive: 'Inactive',
		suspended: 'Suspended'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {styles[status] ?? 'bg-muted text-muted-foreground'}"
	>{labels[status] ?? status}</span
>
