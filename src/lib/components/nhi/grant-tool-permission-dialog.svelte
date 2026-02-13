<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	interface Props {
		open: boolean;
		agentId: string;
		onGrant: (toolId: string, expiresAt?: string) => Promise<void>;
	}

	let { open = $bindable(), agentId, onGrant }: Props = $props();

	let toolId = $state('');
	let expiresAt = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!toolId.trim()) {
			error = 'Tool ID is required';
			return;
		}
		isSubmitting = true;
		error = null;
		try {
			await onGrant(toolId.trim(), expiresAt || undefined);
			toolId = '';
			expiresAt = '';
			open = false;
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to grant tool access';
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		toolId = '';
		expiresAt = '';
		error = null;
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Grant Tool Access</Dialog.Title>
			<Dialog.Description>
				Grant agent <code class="rounded bg-muted px-1 text-xs">{agentId}</code> access to a tool.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="grant-tool-id">Tool ID</Label>
				<Input
					id="grant-tool-id"
					bind:value={toolId}
					placeholder="Enter tool ID"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="space-y-2">
				<Label for="grant-tool-expires">Expiry (optional)</Label>
				<Input
					id="grant-tool-expires"
					type="datetime-local"
					bind:value={expiresAt}
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
