<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	interface Props {
		open: boolean;
		certificationId: string;
		onDecide: (decision: 'approve' | 'revoke' | 'reduce', comment: string) => Promise<void>;
	}

	let { open = $bindable(), certificationId, onDecide }: Props = $props();

	let decision = $state<'approve' | 'revoke' | 'reduce'>('approve');
	let comment = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	const isRevokeWithoutComment = $derived(decision === 'revoke' && !comment.trim());

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (decision === 'revoke' && !comment.trim()) {
			error = 'Comment is required for revoke decisions';
			return;
		}

		isSubmitting = true;
		error = null;
		try {
			await onDecide(decision, comment.trim());
			resetForm();
			open = false;
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to submit decision';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		decision = 'approve';
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
			<Dialog.Title>Certification Decision</Dialog.Title>
			<Dialog.Description>
				Make a decision for certification <code class="rounded bg-muted px-1 text-xs">{certificationId.slice(0, 8)}...</code>
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4" data-testid="decision-form">
			<div class="space-y-2">
				<Label>Decision</Label>
				<div class="flex gap-3">
					<label class="flex items-center gap-2">
						<input type="radio" bind:group={decision} value="approve" disabled={isSubmitting} />
						<span class="text-sm text-green-700 dark:text-green-400">Approve</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="radio" bind:group={decision} value="revoke" disabled={isSubmitting} />
						<span class="text-sm text-red-700 dark:text-red-400">Revoke</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="radio" bind:group={decision} value="reduce" disabled={isSubmitting} />
						<span class="text-sm text-yellow-700 dark:text-yellow-400">Flag for Review</span>
					</label>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="decision-comment">Comment {decision === 'revoke' ? '(required)' : '(optional)'}</Label>
				<textarea
					id="decision-comment"
					bind:value={comment}
					rows={3}
					class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Enter your comment..."
					disabled={isSubmitting}
					required={decision === 'revoke'}
				></textarea>
			</div>

			{#if error}
				<p class="text-sm text-destructive" data-testid="decision-error">{error}</p>
			{/if}

			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={handleCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting || isRevokeWithoutComment}
					variant={decision === 'revoke' ? 'destructive' : 'default'}
				>
					{isSubmitting ? 'Submitting...' : decision === 'approve' ? 'Approve' : decision === 'reduce' ? 'Flag for Review' : 'Revoke'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
