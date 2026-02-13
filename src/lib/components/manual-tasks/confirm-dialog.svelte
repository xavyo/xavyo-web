<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		open: boolean;
		onConfirm: (notes: string) => void;
		onCancel: () => void;
	}

	let { open = $bindable(), onConfirm, onCancel }: Props = $props();
	let notes = $state('');

	function handleConfirm() {
		onConfirm(notes);
		notes = '';
	}

	function handleCancel() {
		onCancel();
		notes = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Task Completion</Dialog.Title>
			<Dialog.Description>
				Mark this provisioning task as completed. Optionally add notes about the work performed.
			</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			<label for="confirm-notes" class="text-sm font-medium text-foreground">Notes (optional)</label>
			<textarea
				id="confirm-notes"
				bind:value={notes}
				class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				rows={4}
				maxlength={2000}
				placeholder="Describe the provisioning actions taken..."
			></textarea>
			<p class="mt-1 text-xs text-muted-foreground">{notes.length}/2000 characters</p>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button onclick={handleConfirm}>Confirm Completion</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
