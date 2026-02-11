<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	interface Props {
		open: boolean;
		sourceId: string;
		onGrant: (
			targetId: string,
			body: {
				permission_type: string;
				allowed_actions?: Record<string, unknown>;
				max_calls_per_hour?: number;
				expires_at?: string;
			}
		) => Promise<void>;
	}

	let { open = $bindable(), sourceId, onGrant }: Props = $props();

	let targetId = $state('');
	let permissionType = $state('');
	let allowedActionsJson = $state('');
	let maxCallsPerHour = $state<string>('');
	let expiresAt = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!targetId.trim()) {
			error = 'Target NHI ID is required';
			return;
		}
		if (!permissionType.trim()) {
			error = 'Permission type is required';
			return;
		}

		let allowedActions: Record<string, unknown> | undefined;
		if (allowedActionsJson.trim()) {
			try {
				allowedActions = JSON.parse(allowedActionsJson) as Record<string, unknown>;
			} catch {
				error = 'Invalid JSON for allowed actions';
				return;
			}
		}

		const maxCalls = maxCallsPerHour ? parseInt(maxCallsPerHour, 10) : undefined;
		if (maxCallsPerHour && (isNaN(maxCalls!) || maxCalls! < 0)) {
			error = 'Max calls per hour must be a positive number';
			return;
		}

		isSubmitting = true;
		error = null;
		try {
			await onGrant(targetId.trim(), {
				permission_type: permissionType.trim(),
				allowed_actions: allowedActions,
				max_calls_per_hour: maxCalls,
				expires_at: expiresAt || undefined
			});
			resetForm();
			open = false;
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to grant NHI permission';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		targetId = '';
		permissionType = '';
		allowedActionsJson = '';
		maxCallsPerHour = '';
		expiresAt = '';
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
			<Dialog.Title>Grant NHI Calling Permission</Dialog.Title>
			<Dialog.Description>
				Allow <code class="rounded bg-muted px-1 text-xs">{sourceId}</code> to call another NHI entity.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="grant-nhi-target">Target NHI ID</Label>
				<Input
					id="grant-nhi-target"
					bind:value={targetId}
					placeholder="Enter target NHI ID"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="space-y-2">
				<Label for="grant-nhi-perm-type">Permission Type</Label>
				<Input
					id="grant-nhi-perm-type"
					bind:value={permissionType}
					placeholder="e.g. invoke, read, write"
					required
					disabled={isSubmitting}
				/>
			</div>

			<div class="space-y-2">
				<Label for="grant-nhi-actions">Allowed Actions (JSON, optional)</Label>
				<textarea
					id="grant-nhi-actions"
					bind:value={allowedActionsJson}
					rows={3}
					class="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					placeholder={'{"action": "value"\u007D'}
					disabled={isSubmitting}
				></textarea>
			</div>

			<div class="space-y-2">
				<Label for="grant-nhi-max-calls">Max Calls Per Hour (optional)</Label>
				<Input
					id="grant-nhi-max-calls"
					type="number"
					bind:value={maxCallsPerHour}
					placeholder="e.g. 100"
					min="0"
					disabled={isSubmitting}
				/>
			</div>

			<div class="space-y-2">
				<Label for="grant-nhi-expires">Expiry (optional)</Label>
				<Input
					id="grant-nhi-expires"
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
					{isSubmitting ? 'Granting...' : 'Grant Permission'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
