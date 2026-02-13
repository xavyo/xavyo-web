<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	interface Props {
		open: boolean;
		certificationId: string;
		onDelegate: (delegateTo: string, comment: string) => Promise<void>;
	}

	let { open = $bindable(), certificationId, onDelegate }: Props = $props();

	let delegateTo = $state('');
	let comment = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!delegateTo.trim()) {
			error = 'Reviewer ID is required';
			return;
		}

		isSubmitting = true;
		error = null;
		try {
			await onDelegate(delegateTo.trim(), comment.trim());
			resetForm();
			open = false;
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to delegate certification';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		delegateTo = '';
		comment = '';
		error = null;
	}

	function handleCancel() {
		resetForm();
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delegate Certification</Dialog.Title>
			<Dialog.Description>
				Delegate certification <code class="rounded bg-muted px-1 text-xs">{certificationId.slice(0, 8)}...</code> to another reviewer.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4" data-testid="delegate-form">
			<div class="space-y-2">
				<Label for="delegate-to">Delegate To (Reviewer ID)</Label>
				<Input
					id="delegate-to"
					bind:value={delegateTo}
					placeholder="Enter reviewer UUID"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="space-y-2">
				<Label for="delegate-comment">Comment (optional)</Label>
				<textarea
					id="delegate-comment"
					bind:value={comment}
					rows={3}
					class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Reason for delegation..."
					disabled={isSubmitting}
				></textarea>
			</div>

			{#if error}
				<p class="text-sm text-destructive" data-testid="delegate-error">{error}</p>
			{/if}

			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={handleCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting || !delegateTo.trim()}>
					{isSubmitting ? 'Delegating...' : 'Delegate'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
