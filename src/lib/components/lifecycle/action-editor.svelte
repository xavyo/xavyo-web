<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import { Plus, Trash2 } from 'lucide-svelte';
	import type { LifecycleStateAction } from '$lib/api/types';
	import { saveStateActions } from '$lib/api/lifecycle-client';
	import { addToast } from '$lib/stores/toast.svelte';

	let {
		configId,
		stateId,
		initialEntryActions = [],
		initialExitActions = []
	}: {
		configId: string;
		stateId: string;
		initialEntryActions?: LifecycleStateAction[];
		initialExitActions?: LifecycleStateAction[];
	} = $props();

	let entryActions = $state<LifecycleStateAction[]>([...initialEntryActions]);
	let exitActions = $state<LifecycleStateAction[]>([...initialExitActions]);
	let saving = $state(false);
	let error = $state('');

	function addEntryAction() {
		entryActions = [...entryActions, { action_type: '', parameters: {} }];
	}

	function removeEntryAction(index: number) {
		entryActions = entryActions.filter((_, i) => i !== index);
	}

	function addExitAction() {
		exitActions = [...exitActions, { action_type: '', parameters: {} }];
	}

	function removeExitAction(index: number) {
		exitActions = exitActions.filter((_, i) => i !== index);
	}

	function parseParams(json: string): Record<string, unknown> {
		try {
			return JSON.parse(json) as Record<string, unknown>;
		} catch {
			return {};
		}
	}

	function stringifyParams(params: Record<string, unknown>): string {
		return JSON.stringify(params, null, 2);
	}

	async function handleSave() {
		saving = true;
		error = '';
		try {
			await saveStateActions(configId, stateId, {
				entry_actions: entryActions,
				exit_actions: exitActions
			});
			addToast('success', 'Actions saved');
		} catch (e: any) {
			error = e.message || 'Failed to save actions';
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6">
	{#if error}
		<Alert variant="destructive">
			<AlertDescription>{error}</AlertDescription>
		</Alert>
	{/if}

	<!-- Entry Actions -->
	<div>
		<div class="mb-2 flex items-center justify-between">
			<h4 class="text-sm font-semibold">Entry Actions</h4>
			<Button variant="outline" size="sm" onclick={addEntryAction}>
				<Plus class="mr-1 h-3 w-3" />
				Add
			</Button>
		</div>
		{#if entryActions.length === 0}
			<p class="text-sm text-muted-foreground">No entry actions configured.</p>
		{:else}
			<div class="space-y-2">
				{#each entryActions as action, i}
					<div class="flex items-start gap-2 rounded-md border p-3">
						<div class="flex-1 space-y-1">
							<Label>Action Type</Label>
							<Input type="text" placeholder="e.g. send_notification" bind:value={action.action_type} />
						</div>
						<div class="flex-1 space-y-1">
							<Label>Parameters (JSON)</Label>
							<textarea
								class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
								value={stringifyParams(action.parameters)}
								onchange={(e) => { action.parameters = parseParams((e.target as HTMLTextAreaElement).value); }}
							></textarea>
						</div>
						<Button variant="ghost" size="sm" class="mt-6" onclick={() => removeEntryAction(i)}>
							<Trash2 class="h-4 w-4 text-destructive" />
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<Separator />

	<!-- Exit Actions -->
	<div>
		<div class="mb-2 flex items-center justify-between">
			<h4 class="text-sm font-semibold">Exit Actions</h4>
			<Button variant="outline" size="sm" onclick={addExitAction}>
				<Plus class="mr-1 h-3 w-3" />
				Add
			</Button>
		</div>
		{#if exitActions.length === 0}
			<p class="text-sm text-muted-foreground">No exit actions configured.</p>
		{:else}
			<div class="space-y-2">
				{#each exitActions as action, i}
					<div class="flex items-start gap-2 rounded-md border p-3">
						<div class="flex-1 space-y-1">
							<Label>Action Type</Label>
							<Input type="text" placeholder="e.g. trigger_provisioning" bind:value={action.action_type} />
						</div>
						<div class="flex-1 space-y-1">
							<Label>Parameters (JSON)</Label>
							<textarea
								class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
								value={stringifyParams(action.parameters)}
								onchange={(e) => { action.parameters = parseParams((e.target as HTMLTextAreaElement).value); }}
							></textarea>
						</div>
						<Button variant="ghost" size="sm" class="mt-6" onclick={() => removeExitAction(i)}>
							<Trash2 class="h-4 w-4 text-destructive" />
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<Button onclick={handleSave} disabled={saving}>
		{saving ? 'Saving...' : 'Save Actions'}
	</Button>
</div>
