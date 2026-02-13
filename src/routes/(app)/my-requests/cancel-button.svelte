<script lang="ts">
	import { addToast } from '$lib/stores/toast.svelte';

	let { requestId, onCancel }: { requestId: string; onCancel: () => void } = $props();

	let cancelling = $state(false);

	async function handleCancel() {
		if (cancelling) return;
		cancelling = true;
		try {
			const response = await fetch(`/api/governance/access-requests/${requestId}/cancel`, {
				method: 'POST'
			});
			if (!response.ok) {
				throw new Error('Failed to cancel request');
			}
			addToast('success', 'Access request cancelled');
			onCancel();
		} catch {
			addToast('error', 'Failed to cancel access request');
		} finally {
			cancelling = false;
		}
	}
</script>

<button
	onclick={handleCancel}
	disabled={cancelling}
	class="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
>
	{cancelling ? 'Cancelling...' : 'Cancel'}
</button>
