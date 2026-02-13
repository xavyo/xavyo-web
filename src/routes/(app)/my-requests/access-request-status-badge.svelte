<script lang="ts">
	let { status }: { status: string } = $props();

	const styles: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		pending_approval: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		provisioned: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
		rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {styles[status] ?? 'bg-gray-100 text-gray-800'}"
	>{labels[status] ?? status}</span
>
