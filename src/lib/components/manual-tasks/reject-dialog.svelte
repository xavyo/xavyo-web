<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		open: boolean;
		onReject: (reason: string) => void;
		onCancel: () => void;
	}

	let { open = $bindable(), onReject, onCancel }: Props = $props();
	let reason = $state('');

	const isValid = $derived(reason.length >= 5 && reason.length <= 1000);

	function handleReject() {
		if (!isValid) return;
		onReject(reason);
		reason = '';
	}

	function handleCancel() {
		onCancel();
		reason = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Reject Task</Dialog.Title>
			<Dialog.Description>
				Provide a reason for rejecting this provisioning task. The reason will be recorded for audit purposes.
			</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			<label for="reject-reason" class="text-sm font-medium text-foreground">Reason <span class="text-red-500">*</span></label>
			<textarea
				id="reject-reason"
				bind:value={reason}
				class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				rows={4}
				maxlength={1000}
				placeholder="Explain why this task is being rejected..."
			></textarea>
			<p class="mt-1 text-xs text-muted-foreground">
				{reason.length}/1000 characters
				{#if reason.length > 0 && reason.length < 5}
					<span class="text-red-500"> (minimum 5 characters)</span>
				{/if}
			</p>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button variant="destructive" onclick={handleReject} disabled={!isValid}>Reject Task</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
