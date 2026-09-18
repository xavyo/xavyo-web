<script lang="ts">
	let { status }: { status: string } = $props();

	const styles: Record<string, string> = {
		pending: 'bg-warning/15 text-warning',
		pending_approval: 'bg-info/15 text-info',
		approved: 'bg-success/15 text-success',
		provisioned: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
		rejected: 'bg-destructive/15 text-destructive',
		cancelled: 'bg-muted text-muted-foreground ',
		expired: 'bg-warning/15 text-warning',
		failed: 'bg-destructive/15 text-destructive'
	};

	const labels: Record<string, string> = {
		pending: 'Pending',
		pending_approval: 'Pending Approval',
		approved: 'Approved',
		provisioned: 'Provisioned',
		rejected: 'Rejected',
		cancelled: 'Cancelled',
		expired: 'Expired',
		failed: 'Failed'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {styles[status] ?? 'bg-muted text-muted-foreground'}"
	>{labels[status] ?? status}</span
>
