<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';
	import type { LifecycleState, LifecycleTransition, TransitionCondition, LifecycleStateAction } from '$lib/api/types';
	import {
		addState,
		updateStateClient,
		deleteStateClient,
		addTransition,
		deleteTransitionClient,
		fetchConditions,
		fetchStateActions
	} from '$lib/api/lifecycle-client';
	import StateBadge from '$lib/components/lifecycle/state-badge.svelte';
	import EntitlementActionBadge from '$lib/components/lifecycle/entitlement-action-badge.svelte';
	import TransitionCard from '$lib/components/lifecycle/transition-card.svelte';
	import ConditionEditor from '$lib/components/lifecycle/condition-editor.svelte';
	import ActionEditor from '$lib/components/lifecycle/action-editor.svelte';
	import { ArrowLeft, Trash2, Plus, Pencil, Settings, ChevronDown, ChevronUp } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Reactive config data
	let config = $derived(data.config);

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let deleteError = $state('');

	// Edit form
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Configuration updated successfully');
			}
		}
	});

	// Active tab
	let activeTab = $state('details');

	function handleTabChange(tab: string) {
		activeTab = tab;
	}

	// --- States tab state ---
	let showAddState = $state(false);
	let stateLoading = $state(false);
	let stateError = $state('');
	let newStateName = $state('');
	let newStateDescription = $state('');
	let newStateIsInitial = $state(false);
	let newStateIsTerminal = $state(false);
	let newStateEntitlementAction = $state('none');
	let newStatePosition = $state(0);
	let editingStateId = $state<string | null>(null);
	let editStateName = $state('');
	let editStateDescription = $state('');
	let editStateIsInitial = $state(false);
	let editStateIsTerminal = $state(false);
	let editStateEntitlementAction = $state('none');
	let editStatePosition = $state(0);
	let deleteStateId = $state<string | null>(null);

	function resetAddState() {
		newStateName = '';
		newStateDescription = '';
		newStateIsInitial = false;
		newStateIsTerminal = false;
		newStateEntitlementAction = 'none';
		newStatePosition = config.states.length;
		showAddState = false;
		stateError = '';
	}

	async function handleAddState() {
		stateLoading = true;
		stateError = '';
		try {
			await addState(config.id, {
				name: newStateName,
				description: newStateDescription || undefined,
				is_initial: newStateIsInitial,
				is_terminal: newStateIsTerminal,
				entitlement_action: newStateEntitlementAction,
				position: newStatePosition
			});
			addToast('success', `State "${newStateName}" added`);
			resetAddState();
			await invalidateAll();
		} catch (e: any) {
			stateError = e.message || 'Failed to add state';
		} finally {
			stateLoading = false;
		}
	}

	function startEditState(state: LifecycleState) {
		editingStateId = state.id;
		editStateName = state.name;
		editStateDescription = state.description ?? '';
		editStateIsInitial = state.is_initial;
		editStateIsTerminal = state.is_terminal;
		editStateEntitlementAction = state.entitlement_action ?? 'none';
		editStatePosition = state.position ?? 0;
	}

	function cancelEditState() {
		editingStateId = null;
		stateError = '';
	}

	async function handleUpdateState() {
		if (!editingStateId) return;
		stateLoading = true;
		stateError = '';
		try {
			await updateStateClient(config.id, editingStateId, {
				name: editStateName,
				description: editStateDescription || undefined,
				is_initial: editStateIsInitial,
				is_terminal: editStateIsTerminal,
				entitlement_action: editStateEntitlementAction,
				position: editStatePosition
			});
			addToast('success', `State "${editStateName}" updated`);
			editingStateId = null;
			await invalidateAll();
		} catch (e: any) {
			stateError = e.message || 'Failed to update state';
		} finally {
			stateLoading = false;
		}
	}

	async function handleDeleteState(stateId: string, stateName: string) {
		stateLoading = true;
		stateError = '';
		try {
			await deleteStateClient(config.id, stateId);
			addToast('success', `State "${stateName}" deleted`);
			deleteStateId = null;
			await invalidateAll();
		} catch (e: any) {
			stateError = e.message || 'Failed to delete state';
		} finally {
			stateLoading = false;
		}
	}

	// Sorted states
	const sortedStates = $derived(
		[...config.states].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
	);

	// --- Transitions tab state ---
	let showAddTransition = $state(false);
	let transitionLoading = $state(false);
	let transitionError = $state('');
	let newTransitionName = $state('');
	let newTransitionFromStateId = $state('');
	let newTransitionToStateId = $state('');
	let newTransitionRequiresApproval = $state(false);
	let newTransitionGracePeriodHours = $state('');
	let deleteTransitionId = $state<string | null>(null);

	function resetAddTransition() {
		newTransitionName = '';
		newTransitionFromStateId = '';
		newTransitionToStateId = '';
		newTransitionRequiresApproval = false;
		newTransitionGracePeriodHours = '';
		showAddTransition = false;
		transitionError = '';
	}

	async function handleAddTransition() {
		transitionLoading = true;
		transitionError = '';
		try {
			await addTransition(config.id, {
				name: newTransitionName,
				from_state_id: newTransitionFromStateId,
				to_state_id: newTransitionToStateId,
				requires_approval: newTransitionRequiresApproval,
				grace_period_hours: newTransitionGracePeriodHours ? Number(newTransitionGracePeriodHours) : undefined
			});
			addToast('success', `Transition "${newTransitionName}" added`);
			resetAddTransition();
			await invalidateAll();
		} catch (e: any) {
			transitionError = e.message || 'Failed to add transition';
		} finally {
			transitionLoading = false;
		}
	}

	async function handleDeleteTransition(transitionId: string, transitionName: string) {
		transitionLoading = true;
		transitionError = '';
		try {
			await deleteTransitionClient(config.id, transitionId);
			addToast('success', `Transition "${transitionName}" deleted`);
			deleteTransitionId = null;
			await invalidateAll();
		} catch (e: any) {
			transitionError = e.message || 'Failed to delete transition';
		} finally {
			transitionLoading = false;
		}
	}

	// --- Conditions expand state ---
	let expandedTransitionId = $state<string | null>(null);
	let conditionsData = $state<Record<string, TransitionCondition[]>>({});
	let conditionsLoading = $state(false);

	async function toggleConditions(transitionId: string) {
		if (expandedTransitionId === transitionId) {
			expandedTransitionId = null;
			return;
		}
		expandedTransitionId = transitionId;
		if (!conditionsData[transitionId]) {
			conditionsLoading = true;
			try {
				const conditions = await fetchConditions(config.id, transitionId);
				conditionsData = { ...conditionsData, [transitionId]: conditions };
			} catch {
				conditionsData = { ...conditionsData, [transitionId]: [] };
			} finally {
				conditionsLoading = false;
			}
		}
	}

	// --- Actions expand state ---
	let expandedStateActionsId = $state<string | null>(null);
	let actionsData = $state<Record<string, { entry: LifecycleStateAction[]; exit: LifecycleStateAction[] }>>({});
	let actionsLoading = $state(false);

	async function toggleActions(stateId: string) {
		if (expandedStateActionsId === stateId) {
			expandedStateActionsId = null;
			return;
		}
		expandedStateActionsId = stateId;
		if (!actionsData[stateId]) {
			actionsLoading = true;
			try {
				const result = await fetchStateActions(config.id, stateId);
				actionsData = { ...actionsData, [stateId]: { entry: result.entry_actions ?? [], exit: result.exit_actions ?? [] } };
			} catch {
				actionsData = { ...actionsData, [stateId]: { entry: [], exit: [] } };
			} finally {
				actionsLoading = false;
			}
		}
	}

	// Helper to get state name by ID
	function getStateName(stateId: string): string {
		const state = config.states.find((s) => s.id === stateId);
		return state?.name ?? 'Unknown';
	}
</script>

<div class="mb-6">
	<a href="/governance/lifecycle" class="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
		<ArrowLeft class="h-4 w-4" />
		Back to Lifecycle Configurations
	</a>

	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">{config.name}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{config.description ?? 'Lifecycle configuration'}</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline">{config.object_type}</Badge>
			{#if config.is_active}
				<Badge variant="default">Active</Badge>
			{:else}
				<Badge variant="secondary">Inactive</Badge>
			{/if}
		</div>
	</div>
</div>

<Tabs value={activeTab} onValueChange={handleTabChange}>
	<TabsList>
		<TabsTrigger value="details">Details</TabsTrigger>
		<TabsTrigger value="states">States ({config.states.length})</TabsTrigger>
		<TabsTrigger value="transitions">Transitions ({config.transitions.length})</TabsTrigger>
	</TabsList>

	<!-- Details Tab -->
	<TabsContent value="details">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Edit configuration</h2>
			</CardHeader>
			<CardContent>
				{#if $message}
					<Alert variant={String($message).includes('error') || String($message).includes('failed') ? 'destructive' : 'default'} class="mb-4">
						<AlertDescription>{$message}</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" action="?/update" use:enhance class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Name</Label>
						<Input id="name" name="name" type="text" value={String($form.name ?? '')} />
						{#if $errors.name}
							<p class="text-sm text-destructive">{$errors.name}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="description">Description</Label>
						<textarea
							id="description"
							name="description"
							class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							value={String($form.description ?? '')}
						></textarea>
						{#if $errors.description}
							<p class="text-sm text-destructive">{$errors.description}</p>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						<input
							id="is_active"
							name="is_active"
							type="checkbox"
							class="h-4 w-4 rounded border-input"
							checked={$form.is_active}
						/>
						<Label for="is_active">Active</Label>
					</div>

					<div class="flex items-center gap-2">
						<input
							id="auto_assign_initial_state"
							name="auto_assign_initial_state"
							type="checkbox"
							class="h-4 w-4 rounded border-input"
							checked={$form.auto_assign_initial_state}
						/>
						<Label for="auto_assign_initial_state">Auto-assign initial state to new objects</Label>
					</div>

					<Button type="submit">Save Changes</Button>
				</form>

				<Separator class="my-6" />

				<!-- Metadata -->
				<div class="mb-6 space-y-2 text-sm text-muted-foreground">
					<p>Object type: <span class="font-medium text-foreground">{config.object_type}</span></p>
					<p>Created: <span class="font-medium text-foreground">{new Date(config.created_at).toLocaleString()}</span></p>
					<p>Updated: <span class="font-medium text-foreground">{new Date(config.updated_at).toLocaleString()}</span></p>
					<p>States: <span class="font-medium text-foreground">{config.states.length}</span></p>
					<p>Transitions: <span class="font-medium text-foreground">{config.transitions.length}</span></p>
				</div>

				<Separator class="my-6" />

				<!-- Delete Section -->
				<div>
					<h3 class="text-lg font-semibold text-destructive">Danger zone</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						Deleting a lifecycle configuration is permanent and cannot be undone.
					</p>
					{#if deleteError}
						<Alert variant="destructive" class="mt-2">
							<AlertDescription>{deleteError}</AlertDescription>
						</Alert>
					{/if}
					{#if showDeleteDialog}
						<div class="mt-3 rounded-md border border-destructive p-4">
							<p class="text-sm">Are you sure you want to delete "{config.name}"?</p>
							<div class="mt-3 flex gap-2">
								<form
									method="POST"
									action="?/delete"
									use:formEnhance={({ cancel }) => {
										return async ({ result, update }) => {
											if (result.type === 'failure') {
												deleteError = (result.data as any)?.error || 'Failed to delete';
												showDeleteDialog = false;
											} else if (result.type === 'redirect') {
												addToast('success', 'Configuration deleted');
												await update();
											}
										};
									}}
								>
									<Button type="submit" variant="destructive" size="sm">
										<Trash2 class="mr-1 h-3 w-3" />
										Confirm Delete
									</Button>
								</form>
								<Button variant="outline" size="sm" onclick={() => { showDeleteDialog = false; deleteError = ''; }}>
									Cancel
								</Button>
							</div>
						</div>
					{:else}
						<Button variant="destructive" size="sm" class="mt-3" onclick={() => (showDeleteDialog = true)}>
							<Trash2 class="mr-1 h-3 w-3" />
							Delete Configuration
						</Button>
					{/if}
				</div>
			</CardContent>
		</Card>
	</TabsContent>

	<!-- States Tab -->
	<TabsContent value="states">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">States</h2>
					{#if !showAddState}
						<Button size="sm" onclick={() => { showAddState = true; newStatePosition = config.states.length; }}>
							<Plus class="mr-1 h-4 w-4" />
							Add State
						</Button>
					{/if}
				</div>
			</CardHeader>
			<CardContent>
				{#if stateError}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{stateError}</AlertDescription>
					</Alert>
				{/if}

				<!-- Add State Form -->
				{#if showAddState}
					<div class="mb-6 rounded-md border p-4">
						<h3 class="mb-3 text-sm font-semibold">New State</h3>
						<div class="space-y-3">
							<div class="grid grid-cols-2 gap-3">
								<div class="space-y-1">
									<Label for="new-state-name">Name</Label>
									<Input id="new-state-name" type="text" placeholder="e.g. Onboarding" bind:value={newStateName} />
								</div>
								<div class="space-y-1">
									<Label for="new-state-position">Position</Label>
									<Input id="new-state-position" type="number" bind:value={newStatePosition} />
								</div>
							</div>
							<div class="space-y-1">
								<Label for="new-state-desc">Description (optional)</Label>
								<Input id="new-state-desc" type="text" placeholder="Brief description" bind:value={newStateDescription} />
							</div>
							<div class="grid grid-cols-3 gap-3">
								<div class="flex items-center gap-2">
									<input id="new-state-initial" type="checkbox" class="h-4 w-4 rounded border-input" bind:checked={newStateIsInitial} />
									<Label for="new-state-initial">Initial</Label>
								</div>
								<div class="flex items-center gap-2">
									<input id="new-state-terminal" type="checkbox" class="h-4 w-4 rounded border-input" bind:checked={newStateIsTerminal} />
									<Label for="new-state-terminal">Terminal</Label>
								</div>
								<div class="space-y-1">
									<Label for="new-state-action">Entitlement Action</Label>
									<select
										id="new-state-action"
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
										bind:value={newStateEntitlementAction}
									>
										<option value="none">None</option>
										<option value="revoke">Revoke</option>
										<option value="pause">Pause</option>
									</select>
								</div>
							</div>
							<div class="flex gap-2">
								<Button size="sm" disabled={!newStateName || stateLoading} onclick={handleAddState}>
									{stateLoading ? 'Adding...' : 'Add State'}
								</Button>
								<Button variant="outline" size="sm" onclick={resetAddState}>Cancel</Button>
							</div>
						</div>
					</div>
				{/if}

				<!-- State List -->
				{#if sortedStates.length === 0}
					<p class="text-sm text-muted-foreground">No states defined yet. Add your first state to build the lifecycle.</p>
				{:else}
					<div class="space-y-2">
						{#each sortedStates as state (state.id)}
							{#if editingStateId === state.id}
								<!-- Edit State Inline -->
								<div class="rounded-md border border-primary p-3">
									<div class="space-y-3">
										<div class="grid grid-cols-2 gap-3">
											<div class="space-y-1">
												<Label>Name</Label>
												<Input type="text" bind:value={editStateName} />
											</div>
											<div class="space-y-1">
												<Label>Position</Label>
												<Input type="number" bind:value={editStatePosition} />
											</div>
										</div>
										<div class="space-y-1">
											<Label>Description</Label>
											<Input type="text" bind:value={editStateDescription} />
										</div>
										<div class="grid grid-cols-3 gap-3">
											<div class="flex items-center gap-2">
												<input type="checkbox" class="h-4 w-4 rounded border-input" bind:checked={editStateIsInitial} />
												<Label>Initial</Label>
											</div>
											<div class="flex items-center gap-2">
												<input type="checkbox" class="h-4 w-4 rounded border-input" bind:checked={editStateIsTerminal} />
												<Label>Terminal</Label>
											</div>
											<div class="space-y-1">
												<Label>Entitlement Action</Label>
												<select
													class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
													bind:value={editStateEntitlementAction}
												>
													<option value="none">None</option>
													<option value="revoke">Revoke</option>
													<option value="pause">Pause</option>
												</select>
											</div>
										</div>
										<div class="flex gap-2">
											<Button size="sm" disabled={!editStateName || stateLoading} onclick={handleUpdateState}>
												{stateLoading ? 'Saving...' : 'Save'}
											</Button>
											<Button variant="outline" size="sm" onclick={cancelEditState}>Cancel</Button>
										</div>
									</div>
								</div>
							{:else}
								<!-- Display State -->
								<div class="rounded-md border">
									<div class="flex items-center justify-between p-3">
										<div class="flex items-center gap-3">
											<span class="text-xs text-muted-foreground">#{state.position ?? 0}</span>
											<span class="font-medium">{state.name}</span>
											<StateBadge isInitial={state.is_initial} isTerminal={state.is_terminal} />
											<EntitlementActionBadge action={state.entitlement_action ?? 'none'} />
											{#if state.description}
												<span class="text-sm text-muted-foreground">{state.description}</span>
											{/if}
										</div>
										<div class="flex items-center gap-1">
											{#if deleteStateId === state.id}
												<Button variant="destructive" size="sm" onclick={() => handleDeleteState(state.id, state.name)} disabled={stateLoading}>
													Confirm
												</Button>
												<Button variant="outline" size="sm" onclick={() => (deleteStateId = null)}>Cancel</Button>
											{:else}
												<Button variant="ghost" size="sm" onclick={() => toggleActions(state.id)} title="Configure actions">
													{#if expandedStateActionsId === state.id}
														<ChevronUp class="h-3 w-3" />
													{:else}
														<Settings class="h-3 w-3" />
													{/if}
												</Button>
												<Button variant="ghost" size="sm" onclick={() => startEditState(state)}>
													<Pencil class="h-3 w-3" />
												</Button>
												<Button variant="ghost" size="sm" onclick={() => (deleteStateId = state.id)}>
													<Trash2 class="h-3 w-3 text-destructive" />
												</Button>
											{/if}
										</div>
									</div>
									{#if expandedStateActionsId === state.id}
										<div class="border-t bg-muted/30 p-4">
											<h4 class="mb-3 text-sm font-semibold">Entry / Exit Actions</h4>
											{#if actionsLoading}
												<p class="text-sm text-muted-foreground">Loading actions...</p>
											{:else}
												<ActionEditor
													configId={config.id}
													stateId={state.id}
													initialEntryActions={actionsData[state.id]?.entry ?? []}
													initialExitActions={actionsData[state.id]?.exit ?? []}
												/>
											{/if}
										</div>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Transitions Tab -->
	<TabsContent value="transitions">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Transitions</h2>
					{#if !showAddTransition && config.states.length >= 2}
						<Button size="sm" onclick={() => (showAddTransition = true)}>
							<Plus class="mr-1 h-4 w-4" />
							Add Transition
						</Button>
					{/if}
				</div>
			</CardHeader>
			<CardContent>
				{#if transitionError}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{transitionError}</AlertDescription>
					</Alert>
				{/if}

				{#if config.states.length < 2}
					<p class="text-sm text-muted-foreground">You need at least 2 states before you can create transitions. Add states in the States tab first.</p>
				{:else}
					<!-- Add Transition Form -->
					{#if showAddTransition}
						<div class="mb-6 rounded-md border p-4">
							<h3 class="mb-3 text-sm font-semibold">New Transition</h3>
							<div class="space-y-3">
								<div class="space-y-1">
									<Label for="new-transition-name">Name</Label>
									<Input id="new-transition-name" type="text" placeholder="e.g. Activate" bind:value={newTransitionName} />
								</div>
								<div class="grid grid-cols-2 gap-3">
									<div class="space-y-1">
										<Label for="new-transition-from">From State</Label>
										<select
											id="new-transition-from"
											class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
											bind:value={newTransitionFromStateId}
										>
											<option value="">Select state...</option>
											{#each sortedStates as state (state.id)}
												<option value={state.id}>{state.name}</option>
											{/each}
										</select>
									</div>
									<div class="space-y-1">
										<Label for="new-transition-to">To State</Label>
										<select
											id="new-transition-to"
											class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
											bind:value={newTransitionToStateId}
										>
											<option value="">Select state...</option>
											{#each sortedStates as state (state.id)}
												<option value={state.id}>{state.name}</option>
											{/each}
										</select>
									</div>
								</div>
								<div class="grid grid-cols-2 gap-3">
									<div class="flex items-center gap-2">
										<input id="new-transition-approval" type="checkbox" class="h-4 w-4 rounded border-input" bind:checked={newTransitionRequiresApproval} />
										<Label for="new-transition-approval">Requires approval</Label>
									</div>
									<div class="space-y-1">
										<Label for="new-transition-grace">Grace period (hours, optional)</Label>
										<Input id="new-transition-grace" type="number" placeholder="e.g. 48" bind:value={newTransitionGracePeriodHours} />
									</div>
								</div>
								<div class="flex gap-2">
									<Button
										size="sm"
										disabled={!newTransitionName || !newTransitionFromStateId || !newTransitionToStateId || transitionLoading}
										onclick={handleAddTransition}
									>
										{transitionLoading ? 'Adding...' : 'Add Transition'}
									</Button>
									<Button variant="outline" size="sm" onclick={resetAddTransition}>Cancel</Button>
								</div>
							</div>
						</div>
					{/if}

					<!-- Transition List -->
					{#if config.transitions.length === 0}
						<p class="text-sm text-muted-foreground">No transitions defined yet. Add transitions to define how objects move between states.</p>
					{:else}
						<div class="space-y-2">
							{#each config.transitions as transition (transition.id)}
								{#if deleteTransitionId === transition.id}
									<div class="rounded-md border border-destructive p-3">
										<p class="mb-2 text-sm">Delete transition "{transition.name}"?</p>
										<div class="flex gap-2">
											<Button variant="destructive" size="sm" onclick={() => handleDeleteTransition(transition.id, transition.name)} disabled={transitionLoading}>
												Confirm
											</Button>
											<Button variant="outline" size="sm" onclick={() => (deleteTransitionId = null)}>Cancel</Button>
										</div>
									</div>
								{:else}
									<div>
										<div class="flex items-center gap-2">
											<div class="flex-1">
												<TransitionCard
													name={transition.name}
													fromStateName={getStateName(transition.from_state_id)}
													toStateName={getStateName(transition.to_state_id)}
													requiresApproval={transition.requires_approval}
													gracePeriodHours={transition.grace_period_hours}
													ondelete={() => (deleteTransitionId = transition.id)}
												/>
											</div>
											<Button variant="ghost" size="sm" onclick={() => toggleConditions(transition.id)} title="Configure conditions">
												{#if expandedTransitionId === transition.id}
													<ChevronUp class="h-4 w-4" />
												{:else}
													<ChevronDown class="h-4 w-4" />
												{/if}
											</Button>
										</div>
										{#if expandedTransitionId === transition.id}
											<div class="ml-2 mt-2 rounded-md border bg-muted/30 p-4">
												<h4 class="mb-3 text-sm font-semibold">Transition Conditions</h4>
												{#if conditionsLoading}
													<p class="text-sm text-muted-foreground">Loading conditions...</p>
												{:else}
													<ConditionEditor
														configId={config.id}
														transitionId={transition.id}
														initialConditions={conditionsData[transition.id] ?? []}
													/>
												{/if}
											</div>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				{/if}
			</CardContent>
		</Card>
	</TabsContent>
</Tabs>
