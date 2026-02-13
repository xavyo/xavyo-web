<script lang="ts">
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/stores/toast.svelte';
	import { triggerLifecycleEventClient } from '$lib/api/birthright-client';
	import type { LifecycleEventType } from '$lib/api/types';

	interface Props {
		open: boolean;
		onclose: () => void;
		onsuccess: () => void;
	}

	let { open = $bindable(false), onclose, onsuccess }: Props = $props();

	let userId = $state('');
	let eventType = $state<LifecycleEventType>('joiner');
	let attributesBefore = $state('');
	let attributesAfter = $state('');
	let source = $state('api');
	let submitting = $state(false);
	let error = $state('');

	let needsBefore = $derived(eventType === 'mover');
	let needsAfter = $derived(eventType === 'joiner' || eventType === 'mover');

	function resetForm() {
		userId = '';
		eventType = 'joiner';
		attributesBefore = '';
		attributesAfter = '';
		source = 'api';
		error = '';
	}

	function parseJson(val: string): Record<string, unknown> | null {
		if (!val.trim()) return null;
		try {
			const parsed = JSON.parse(val);
			if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
			return parsed as Record<string, unknown>;
		} catch {
			return null;
		}
	}

	async function handleSubmit() {
		error = '';

		if (!userId.trim()) {
			error = 'User ID is required';
			return;
		}

		let attrBefore: Record<string, unknown> | undefined;
		let attrAfter: Record<string, unknown> | undefined;

		if (needsBefore && attributesBefore.trim()) {
			const parsed = parseJson(attributesBefore);
			if (!parsed) {
				error = 'attributes_before must be a valid JSON object';
				return;
			}
			attrBefore = parsed;
		}

		if (needsAfter && attributesAfter.trim()) {
			const parsed = parseJson(attributesAfter);
			if (!parsed) {
				error = 'attributes_after must be a valid JSON object';
				return;
			}
			attrAfter = parsed;
		}

		submitting = true;
		try {
			await triggerLifecycleEventClient({
				user_id: userId,
				event_type: eventType,
				attributes_before: attrBefore,
				attributes_after: attrAfter,
				source: source || 'api'
			});
			addToast('success', `Lifecycle event triggered for ${eventType}`);
			resetForm();
			open = false;
			onsuccess();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to trigger event');
		} finally {
			submitting = false;
		}
	}

	function handleCancel() {
		resetForm();
		open = false;
		onclose();
	}
</script>

<Dialog.Root bind:open>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>Trigger Lifecycle Event</DialogTitle>
		</DialogHeader>

		<div class="space-y-4 py-4">
			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}

			<div class="space-y-2">
				<Label for="trigger-user-id">User ID</Label>
				<Input
					id="trigger-user-id"
					type="text"
					placeholder="UUID of the target user"
					bind:value={userId}
				/>
			</div>

			<div class="space-y-2">
				<Label for="trigger-event-type">Event Type</Label>
				<select
					id="trigger-event-type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					bind:value={eventType}
				>
					<option value="joiner">Joiner (New Hire)</option>
					<option value="mover">Mover (Role Change)</option>
					<option value="leaver">Leaver (Termination)</option>
				</select>
			</div>

			{#if needsBefore}
				<div class="space-y-2">
					<Label for="trigger-attrs-before">Attributes Before (JSON)</Label>
					<textarea
						id="trigger-attrs-before"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						placeholder={'{"department": "Sales"}'}
						bind:value={attributesBefore}
					></textarea>
				</div>
			{/if}

			{#if needsAfter}
				<div class="space-y-2">
					<Label for="trigger-attrs-after">Attributes After (JSON)</Label>
					<textarea
						id="trigger-attrs-after"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						placeholder={'{"department": "Engineering"}'}
						bind:value={attributesAfter}
					></textarea>
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="trigger-source">Source</Label>
				<Input
					id="trigger-source"
					type="text"
					placeholder="api"
					bind:value={source}
				/>
			</div>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={submitting}>
				{submitting ? 'Triggering...' : 'Trigger Event'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
