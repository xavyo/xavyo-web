<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	interface Props {
		open: boolean;
		nhiId: string;
		onGrant: (userId: string) => Promise<void>;
	}

	let { open = $bindable(), nhiId, onGrant }: Props = $props();

	let userId = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!userId.trim()) {
			error = 'User ID is required';
			return;
		}
		isSubmitting = true;
		error = null;
		try {
			await onGrant(userId.trim());
			userId = '';
			open = false;
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to grant user access';
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		userId = '';
		error = null;
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Grant User Access</Dialog.Title>
			<Dialog.Description>
				Grant a user access to NHI entity <code class="rounded bg-muted px-1 text-xs">{nhiId}</code>.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="grant-user-id">User ID</Label>
				<Input
					id="grant-user-id"
					bind:value={userId}
					placeholder="Enter user ID"
					required
					disabled={isSubmitting}
				/>
			</div>

			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}

			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={handleCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Granting...' : 'Grant Access'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
