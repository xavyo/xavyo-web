<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { dropIdentityClient } from '$lib/api/power-of-attorney-client';
	import { addToast } from '$lib/stores/toast.svelte';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		donorName: string;
		donorId: string;
		poaId: string;
	}

	let { donorName, donorId, poaId }: Props = $props();
	let dropping = $state(false);

	async function handleDrop() {
		dropping = true;
		try {
			await dropIdentityClient();
			addToast('success', 'Returned to your own identity');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to drop assumed identity');
		} finally {
			dropping = false;
		}
	}
</script>

<div class="flex items-center gap-3 rounded-md border border-amber-500/50 bg-amber-50 px-4 py-2 dark:bg-amber-950/30" data-testid="assumed-identity-indicator">
	<div class="flex-1 text-sm font-medium text-amber-800 dark:text-amber-200">
		Acting as <strong>{donorName || donorId}</strong>
	</div>
	<Button variant="outline" size="sm" onclick={handleDrop} disabled={dropping}>
		{dropping ? 'Dropping...' : 'Drop'}
	</Button>
</div>
