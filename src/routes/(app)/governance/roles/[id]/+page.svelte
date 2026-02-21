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
	import type {
		GovernanceRole,
		RoleEntitlement,
		EffectiveEntitlementsResponse,
		RoleParameter,
		InheritanceBlock,
		ImpactAnalysisResponse,
		RoleInducement,
		InducedRoleInfo
	} from '$lib/api/types';
	import {
		fetchRoleAncestors,
		fetchRoleChildren,
		fetchRoleDescendants,
		fetchRoleImpact,
		moveRoleClient,
		fetchRoleEntitlements,
		addRoleEntitlementClient,
		removeRoleEntitlementClient,
		fetchEffectiveEntitlements,
		recomputeEntitlementsClient,
		fetchRoleParameters,
		addRoleParameterClient,
		updateRoleParameterClient,
		deleteRoleParameterClient,
		validateRoleParametersClient,
		fetchInheritanceBlocks,
		addInheritanceBlockClient,
		removeInheritanceBlockClient,
		fetchRoleInducements,
		createRoleInducementClient,
		deleteRoleInducementClient,
		enableRoleInducementClient,
		disableRoleInducementClient,
		fetchInducedRoles
	} from '$lib/api/governance-roles-client';
	import { fetchEntitlements } from '$lib/api/governance-client';
	import { Trash2, RefreshCw, Plus } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let deleteError = $state('');

	// Edit form
	const { form, errors, enhance, message } = superForm(data.form, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Role updated successfully');
			}
		}
	});

	// Active tab
	let activeTab = $state('details');

	// --- Hierarchy tab state ---
	let ancestors = $state<GovernanceRole[]>([]);
	let children = $state<GovernanceRole[]>([]);
	let descendants = $state<GovernanceRole[]>([]);
	let impact = $state<ImpactAnalysisResponse | null>(null);
	let hierarchyLoaded = $state(false);
	let hierarchyLoading = $state(false);
	let moveParentId = $state('');
	let moveLoading = $state(false);
	let moveError = $state('');

	async function loadHierarchy() {
		if (hierarchyLoaded) return;
		hierarchyLoading = true;
		try {
			const [a, c, d, i] = await Promise.all([
				fetchRoleAncestors(data.role.id),
				fetchRoleChildren(data.role.id),
				fetchRoleDescendants(data.role.id),
				fetchRoleImpact(data.role.id)
			]);
			ancestors = a;
			children = c;
			descendants = d;
			impact = i;
			hierarchyLoaded = true;
		} catch {
			// Error loading hierarchy
		} finally {
			hierarchyLoading = false;
		}
	}

	async function handleMove() {
		moveLoading = true;
		moveError = '';
		try {
			await moveRoleClient(data.role.id, {
				new_parent_id: moveParentId || null,
				version: data.role.version
			});
			addToast('success', 'Role moved successfully');
			await invalidateAll();
			hierarchyLoaded = false;
			await loadHierarchy();
		} catch (e: any) {
			if (e.message?.includes('409')) {
				moveError = 'This role was modified by another user. Please reload.';
			} else {
				moveError = e.message || 'Failed to move role';
			}
		} finally {
			moveLoading = false;
		}
	}

	// --- Entitlements tab state ---
	let roleEntitlements = $state<RoleEntitlement[]>([]);
	let effectiveEntitlements = $state<EffectiveEntitlementsResponse | null>(null);
	let entitlementsLoaded = $state(false);
	let entitlementsLoading = $state(false);
	let showAddEntitlement = $state(false);
	let availableEntitlements = $state<{ id: string; name: string }[]>([]);
	let selectedEntitlementId = $state('');
	let addEntitlementLoading = $state(false);

	async function loadEntitlements() {
		if (entitlementsLoaded) return;
		entitlementsLoading = true;
		try {
			const [direct, effective] = await Promise.all([
				fetchRoleEntitlements(data.role.id),
				fetchEffectiveEntitlements(data.role.id)
			]);
			roleEntitlements = direct;
			effectiveEntitlements = effective;
			entitlementsLoaded = true;
		} catch {
			// Error loading entitlements
		} finally {
			entitlementsLoading = false;
		}
	}

	async function openAddEntitlement() {
		showAddEntitlement = true;
		try {
			const result = await fetchEntitlements({ limit: 100 });
			availableEntitlements = result.items.map((e) => ({ id: e.id, name: e.name }));
		} catch {
			availableEntitlements = [];
		}
	}

	async function handleAddEntitlement() {
		if (!selectedEntitlementId) return;
		addEntitlementLoading = true;
		try {
			await addRoleEntitlementClient(data.role.id, {
				entitlement_id: selectedEntitlementId,
				role_name: data.role.name
			});
			addToast('success', 'Entitlement added');
			showAddEntitlement = false;
			selectedEntitlementId = '';
			entitlementsLoaded = false;
			await loadEntitlements();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to add entitlement');
		} finally {
			addEntitlementLoading = false;
		}
	}

	async function handleRemoveEntitlement(entitlementId: string) {
		try {
			await removeRoleEntitlementClient(data.role.id, entitlementId);
			addToast('success', 'Entitlement removed');
			entitlementsLoaded = false;
			await loadEntitlements();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to remove entitlement');
		}
	}

	async function handleRecompute() {
		try {
			await recomputeEntitlementsClient(data.role.id);
			addToast('success', 'Entitlements recomputed');
			entitlementsLoaded = false;
			await loadEntitlements();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to recompute');
		}
	}

	// --- Parameters tab state ---
	let parameters = $state<RoleParameter[]>([]);
	let parametersLoaded = $state(false);
	let parametersLoading = $state(false);
	let showAddParameter = $state(false);
	let newParam = $state({
		name: '',
		parameter_type: 'string' as string,
		description: '',
		is_required: false,
		default_value: '',
		constraints_json: '',
		display_name: '',
		display_order: 0
	});
	let addParamLoading = $state(false);

	async function loadParameters() {
		if (parametersLoaded) return;
		parametersLoading = true;
		try {
			const result = await fetchRoleParameters(data.role.id);
			parameters = result.items;
			parametersLoaded = true;
		} catch {
			// Error loading parameters
		} finally {
			parametersLoading = false;
		}
	}

	async function handleAddParameter() {
		addParamLoading = true;
		try {
			let constraints: Record<string, unknown> | undefined;
			if (newParam.constraints_json) {
				constraints = JSON.parse(newParam.constraints_json) as Record<string, unknown>;
			}
			await addRoleParameterClient(data.role.id, {
				name: newParam.name,
				parameter_type: newParam.parameter_type as any,
				description: newParam.description || undefined,
				is_required: newParam.is_required,
				default_value: newParam.default_value || undefined,
				constraints,
				display_name: newParam.display_name || undefined,
				display_order: newParam.display_order
			});
			addToast('success', 'Parameter added');
			showAddParameter = false;
			newParam = { name: '', parameter_type: 'string', description: '', is_required: false, default_value: '', constraints_json: '', display_name: '', display_order: 0 };
			parametersLoaded = false;
			await loadParameters();
		} catch (e: any) {
			if (e instanceof SyntaxError) {
				addToast('error', 'Invalid JSON in constraints');
			} else {
				addToast('error', e.message || 'Failed to add parameter');
			}
		} finally {
			addParamLoading = false;
		}
	}

	async function handleDeleteParameter(parameterId: string) {
		try {
			await deleteRoleParameterClient(data.role.id, parameterId);
			addToast('success', 'Parameter deleted');
			parametersLoaded = false;
			await loadParameters();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to delete parameter');
		}
	}

	// --- Blocks tab state ---
	let blocks = $state<InheritanceBlock[]>([]);
	let blocksLoaded = $state(false);
	let blocksLoading = $state(false);
	let showAddBlock = $state(false);
	let blockEntitlementId = $state('');
	let addBlockLoading = $state(false);
	let blockEntitlements = $state<{ id: string; name: string }[]>([]);

	async function loadBlocks() {
		if (blocksLoaded) return;
		blocksLoading = true;
		try {
			blocks = await fetchInheritanceBlocks(data.role.id);
			blocksLoaded = true;
		} catch {
			// Error loading blocks
		} finally {
			blocksLoading = false;
		}
	}

	async function loadBlockEntitlements() {
		try {
			const ents = await fetchEntitlements();
			blockEntitlements = (ents.items || []).map((e: any) => ({ id: e.id, name: e.name }));
		} catch {
			blockEntitlements = [];
		}
	}

	async function handleAddBlock() {
		if (!blockEntitlementId) return;
		addBlockLoading = true;
		try {
			await addInheritanceBlockClient(data.role.id, {
				entitlement_id: blockEntitlementId
			});
			addToast('success', 'Inheritance block added');
			showAddBlock = false;
			blockEntitlementId = '';
			blocksLoaded = false;
			await loadBlocks();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to add block');
		} finally {
			addBlockLoading = false;
		}
	}

	async function handleRemoveBlock(blockId: string) {
		try {
			await removeInheritanceBlockClient(data.role.id, blockId);
			addToast('success', 'Block removed');
			blocksLoaded = false;
			await loadBlocks();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to remove block');
		}
	}

	// --- Inducements tab state ---
	let inducements = $state<RoleInducement[]>([]);
	let inducedRoles = $state<InducedRoleInfo[]>([]);
	let inducementsLoaded = $state(false);
	let inducementsLoading = $state(false);
	let showAddInducement = $state(false);
	let inducementRoleId = $state('');
	let inducementDescription = $state('');
	let addInducementLoading = $state(false);

	async function loadInducements() {
		if (inducementsLoaded) return;
		inducementsLoading = true;
		try {
			const [indResult, induced] = await Promise.all([
				fetchRoleInducements(data.role.id),
				fetchInducedRoles(data.role.id)
			]);
			inducements = indResult.items;
			inducedRoles = induced;
			inducementsLoaded = true;
		} catch {
			// Error loading inducements
		} finally {
			inducementsLoading = false;
		}
	}

	async function handleAddInducement() {
		if (!inducementRoleId) return;
		addInducementLoading = true;
		try {
			await createRoleInducementClient(data.role.id, {
				induced_role_id: inducementRoleId,
				description: inducementDescription || undefined
			});
			addToast('success', 'Inducement added');
			showAddInducement = false;
			inducementRoleId = '';
			inducementDescription = '';
			inducementsLoaded = false;
			await loadInducements();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to add inducement');
		} finally {
			addInducementLoading = false;
		}
	}

	async function handleDeleteInducement(inducementId: string) {
		try {
			await deleteRoleInducementClient(data.role.id, inducementId);
			addToast('success', 'Inducement removed');
			inducementsLoaded = false;
			await loadInducements();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to remove inducement');
		}
	}

	async function handleToggleInducement(inducement: RoleInducement) {
		try {
			if (inducement.is_enabled) {
				await disableRoleInducementClient(data.role.id, inducement.id);
				addToast('success', 'Inducement disabled');
			} else {
				await enableRoleInducementClient(data.role.id, inducement.id);
				addToast('success', 'Inducement enabled');
			}
			inducementsLoaded = false;
			await loadInducements();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to toggle inducement');
		}
	}

	// Tab change handler — lazy load data
	function handleTabChange(tab: string) {
		activeTab = tab;
		if (tab === 'hierarchy') loadHierarchy();
		if (tab === 'entitlements') loadEntitlements();
		if (tab === 'parameters') loadParameters();
		if (tab === 'blocks') { loadBlocks(); loadBlockEntitlements(); }
		if (tab === 'inducements') loadInducements();
	}
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">{data.role.name}</h1>
		<p class="mt-1 text-sm text-muted-foreground">{data.role.description ?? 'Governance role'}</p>
	</div>
	<div class="flex items-center gap-2">
		{#if data.role.is_abstract}
			<Badge variant="secondary">Abstract</Badge>
		{:else}
			<Badge variant="default">Concrete</Badge>
		{/if}
		<Badge variant="outline">Depth: {data.role.hierarchy_depth}</Badge>
		<Badge variant="outline">v{data.role.version}</Badge>
	</div>
</div>

<Tabs value={activeTab} onValueChange={handleTabChange}>
	<TabsList>
		<TabsTrigger value="details">Details</TabsTrigger>
		<TabsTrigger value="entitlements">Entitlements</TabsTrigger>
		<TabsTrigger value="parameters">Parameters</TabsTrigger>
		<TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
		<TabsTrigger value="blocks">Blocks</TabsTrigger>
		<TabsTrigger value="inducements">Inducements</TabsTrigger>
	</TabsList>

	<!-- Details Tab -->
	<TabsContent value="details">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Edit role</h2>
			</CardHeader>
			<CardContent>
				{#if $message}
					<Alert variant={String($message).includes('modified by another') ? 'destructive' : 'default'} class="mb-4">
						<AlertDescription>
							{$message}
							{#if String($message).includes('modified by another')}
								<Button variant="outline" size="sm" class="ml-2" onclick={() => invalidateAll()}>
									<RefreshCw class="mr-1 h-3 w-3" />
									Reload
								</Button>
							{/if}
						</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" action="?/update" use:enhance class="space-y-4">
					<input type="hidden" name="version" value={$form.version} />

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
							id="is_abstract"
							name="is_abstract"
							type="checkbox"
							class="h-4 w-4 rounded border-input"
							checked={$form.is_abstract}
						/>
						<Label for="is_abstract">Abstract role (cannot be directly assigned)</Label>
					</div>

					<Button type="submit">Save Changes</Button>
				</form>

				<Separator class="my-6" />

				<!-- Delete Section -->
				<div>
					<h3 class="text-lg font-semibold text-destructive">Danger zone</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						Deleting a role is permanent. Roles with children cannot be deleted.
					</p>
					{#if deleteError}
						<Alert variant="destructive" class="mt-2">
							<AlertDescription>{deleteError}</AlertDescription>
						</Alert>
					{/if}
					{#if showDeleteDialog}
						<div class="mt-3 rounded-md border border-destructive p-4">
							<p class="text-sm">Are you sure you want to delete "{data.role.name}"?</p>
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
												addToast('success', 'Role deleted');
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
							Delete Role
						</Button>
					{/if}
				</div>
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Entitlements Tab -->
	<TabsContent value="entitlements">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Entitlements</h2>
					<div class="flex gap-2">
						<Button variant="outline" size="sm" onclick={handleRecompute}>
							<RefreshCw class="mr-1 h-3 w-3" />
							Recompute
						</Button>
						<Button size="sm" onclick={openAddEntitlement}>
							<Plus class="mr-1 h-3 w-3" />
							Add Entitlement
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{#if entitlementsLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-8 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else}
					<!-- Effective counts -->
					{#if effectiveEntitlements}
						<div class="mb-4 flex gap-3">
							<Badge variant="default">Direct: {effectiveEntitlements.direct_count}</Badge>
							<Badge variant="secondary">Inherited: {effectiveEntitlements.inherited_count}</Badge>
							<Badge variant="outline">Total: {effectiveEntitlements.total}</Badge>
						</div>
					{/if}

					<!-- Direct entitlements list -->
					{#if roleEntitlements.length === 0}
						<p class="text-sm text-muted-foreground">No direct entitlements assigned.</p>
					{:else}
						<div class="space-y-2">
							{#each roleEntitlements as ent (ent.id)}
								<div class="flex items-center justify-between rounded-md border p-3">
									<div>
										<span class="font-medium">{ent.role_name}</span>
										<span class="ml-2 text-xs text-muted-foreground">ID: {ent.entitlement_id}</span>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => handleRemoveEntitlement(ent.id)}
									>
										<Trash2 class="h-4 w-4 text-destructive" />
									</Button>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Add entitlement dialog -->
					{#if showAddEntitlement}
						<div class="mt-4 rounded-md border p-4">
							<h4 class="font-medium">Add entitlement</h4>
							<div class="mt-2 space-y-3">
								<select
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									bind:value={selectedEntitlementId}
								>
									<option value="">Select entitlement</option>
									{#each availableEntitlements as ent}
										<option value={ent.id}>{ent.name}</option>
									{/each}
								</select>
								<div class="flex gap-2">
									<Button size="sm" disabled={!selectedEntitlementId || addEntitlementLoading} onclick={handleAddEntitlement}>
										Add
									</Button>
									<Button variant="outline" size="sm" onclick={() => (showAddEntitlement = false)}>
										Cancel
									</Button>
								</div>
							</div>
						</div>
					{/if}
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Parameters Tab -->
	<TabsContent value="parameters">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Parameters</h2>
					<Button size="sm" onclick={() => (showAddParameter = true)}>
						<Plus class="mr-1 h-3 w-3" />
						Add Parameter
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{#if parametersLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-8 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else if parameters.length === 0}
					<p class="text-sm text-muted-foreground">No parameters defined.</p>
				{:else}
					<div class="space-y-3">
						{#each parameters as param (param.id)}
							<div class="rounded-md border p-3">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="font-medium">{param.name}</span>
										<Badge variant="outline">{param.parameter_type}</Badge>
										{#if param.is_required}
											<Badge variant="destructive">Required</Badge>
										{/if}
									</div>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => handleDeleteParameter(param.id)}
									>
										<Trash2 class="h-4 w-4 text-destructive" />
									</Button>
								</div>
								{#if param.description}
									<p class="mt-1 text-sm text-muted-foreground">{param.description}</p>
								{/if}
								<div class="mt-2 flex gap-4 text-xs text-muted-foreground">
									{#if param.default_value !== null && param.default_value !== undefined}
										<span>Default: {String(param.default_value)}</span>
									{/if}
									{#if param.constraints}
										<span>Constraints: {JSON.stringify(param.constraints)}</span>
									{/if}
									<span>Order: {param.display_order}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add parameter dialog -->
				{#if showAddParameter}
					<div class="mt-4 rounded-md border p-4">
						<h4 class="font-medium">Add parameter</h4>
						<div class="mt-2 space-y-3">
							<div class="grid grid-cols-2 gap-3">
								<div class="space-y-1">
									<Label for="param_name">Name</Label>
									<Input id="param_name" bind:value={newParam.name} placeholder="e.g. access_level" />
								</div>
								<div class="space-y-1">
									<Label for="param_type">Type</Label>
									<select
										id="param_type"
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
										bind:value={newParam.parameter_type}
									>
										<option value="string">String</option>
										<option value="integer">Integer</option>
										<option value="boolean">Boolean</option>
										<option value="date">Date</option>
										<option value="enum">Enum</option>
									</select>
								</div>
							</div>
							<div class="space-y-1">
								<Label for="param_desc">Description</Label>
								<Input id="param_desc" bind:value={newParam.description} placeholder="Optional description" />
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div class="space-y-1">
									<Label for="param_default">Default value</Label>
									<Input id="param_default" bind:value={newParam.default_value} placeholder="Optional default" />
								</div>
								<div class="space-y-1">
									<Label for="param_constraints">Constraints (JSON)</Label>
									<Input id="param_constraints" bind:value={newParam.constraints_json} placeholder={'{"allowed_values": ["a","b"]}'} />
								</div>
							</div>
							<div class="flex items-center gap-2">
								<input id="param_required" type="checkbox" class="h-4 w-4 rounded border-input" bind:checked={newParam.is_required} />
								<Label for="param_required">Required</Label>
							</div>
							<div class="flex gap-2">
								<Button size="sm" disabled={!newParam.name || addParamLoading} onclick={handleAddParameter}>
									Add Parameter
								</Button>
								<Button variant="outline" size="sm" onclick={() => (showAddParameter = false)}>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Hierarchy Tab -->
	<TabsContent value="hierarchy">
		<Card>
			<CardHeader>
				<h2 class="text-xl font-semibold">Hierarchy</h2>
			</CardHeader>
			<CardContent>
				{#if hierarchyLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-8 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else}
					<!-- Impact Analysis -->
					{#if impact}
						<div class="mb-4 flex gap-3">
							<Badge variant="outline">Descendants: {impact.descendant_count}</Badge>
							<Badge variant="outline">Affected users: {impact.total_affected_users}</Badge>
						</div>
					{/if}

					<!-- Ancestors -->
					<h3 class="font-medium">Ancestors</h3>
					{#if ancestors.length === 0}
						<p class="text-sm text-muted-foreground">This is a root role (no ancestors).</p>
					{:else}
						<div class="mt-1 space-y-1">
							{#each ancestors as ancestor (ancestor.id)}
								<a href="/governance/roles/{ancestor.id}" class="block rounded px-2 py-1 text-sm text-primary hover:bg-muted">
									{ancestor.name} (depth {ancestor.hierarchy_depth})
								</a>
							{/each}
						</div>
					{/if}

					<Separator class="my-4" />

					<!-- Children -->
					<h3 class="font-medium">Direct children</h3>
					{#if children.length === 0}
						<p class="text-sm text-muted-foreground">No child roles.</p>
					{:else}
						<div class="mt-1 space-y-1">
							{#each children as child (child.id)}
								<a href="/governance/roles/{child.id}" class="block rounded px-2 py-1 text-sm text-primary hover:bg-muted">
									{child.name}
								</a>
							{/each}
						</div>
					{/if}

					<Separator class="my-4" />

					<!-- Move Role -->
					<h3 class="font-medium">Move role</h3>
					<p class="text-sm text-muted-foreground">Change the parent of this role.</p>
					{#if moveError}
						<Alert variant="destructive" class="mt-2">
							<AlertDescription>
								{moveError}
								{#if moveError.includes('modified by another')}
									<Button variant="outline" size="sm" class="ml-2" onclick={() => invalidateAll()}>Reload</Button>
								{/if}
							</AlertDescription>
						</Alert>
					{/if}
					<div class="mt-2 flex gap-2">
						<select
							class="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
							bind:value={moveParentId}
						>
							<option value="">No parent (make root)</option>
							{#each data.availableRoles as role}
								<option value={role.id}>{role.name}</option>
							{/each}
						</select>
						<Button size="sm" disabled={moveLoading} onclick={handleMove}>
							Move
						</Button>
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Blocks Tab -->
	<TabsContent value="blocks">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Inheritance Blocks</h2>
					<Button size="sm" onclick={() => (showAddBlock = true)}>
						<Plus class="mr-1 h-3 w-3" />
						Add Block
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{#if blocksLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-8 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else if blocks.length === 0}
					<p class="text-sm text-muted-foreground">No inheritance blocks configured.</p>
				{:else}
					<div class="space-y-2">
						{#each blocks as block (block.id)}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div>
									<span class="text-sm font-medium">{block.entitlement_name}</span>
									{#if block.application_name}
										<span class="ml-2 text-xs text-muted-foreground">({block.application_name})</span>
									{/if}
									<p class="text-xs text-muted-foreground">ID: {block.entitlement_id}</p>
								</div>
								<Button variant="ghost" size="sm" onclick={() => handleRemoveBlock(block.id)}>
									<Trash2 class="h-4 w-4 text-destructive" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add block dialog -->
				{#if showAddBlock}
					<div class="mt-4 rounded-md border p-4">
						<h4 class="font-medium">Add inheritance block</h4>
						<p class="mt-1 text-xs text-muted-foreground">Block a specific entitlement from being inherited by child roles.</p>
						<div class="mt-2 space-y-3">
							<div class="space-y-1">
								<Label for="block_entitlement">Entitlement</Label>
								<select
									id="block_entitlement"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									bind:value={blockEntitlementId}
								>
									<option value="">Select an entitlement</option>
									{#each blockEntitlements as ent}
										<option value={ent.id}>{ent.name}</option>
									{/each}
								</select>
							</div>
							<div class="flex gap-2">
								<Button size="sm" disabled={!blockEntitlementId || addBlockLoading} onclick={handleAddBlock}>
									Add Block
								</Button>
								<Button variant="outline" size="sm" onclick={() => (showAddBlock = false)}>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Inducements Tab -->
	<TabsContent value="inducements">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Inducements</h2>
					<Button size="sm" onclick={() => (showAddInducement = true)}>
						<Plus class="mr-1 h-3 w-3" />
						Add Inducement
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{#if inducementsLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-8 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else if inducements.length === 0}
					<p class="text-sm text-muted-foreground">No inducements configured.</p>
				{:else}
					<div class="space-y-2">
						{#each inducements as ind (ind.id)}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div>
									<span class="text-sm font-medium">{ind.induced_role_name ?? ind.induced_role_id}</span>
									{#if ind.description}
										<p class="text-xs text-muted-foreground">{ind.description}</p>
									{/if}
								</div>
								<div class="flex items-center gap-2">
									<button
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {ind.is_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}"
										onclick={() => handleToggleInducement(ind)}
									>
										{ind.is_enabled ? 'Enabled' : 'Disabled'}
									</button>
									<Button variant="ghost" size="sm" onclick={() => handleDeleteInducement(ind.id)}>
										<Trash2 class="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add inducement dialog -->
				{#if showAddInducement}
					<div class="mt-4 rounded-md border p-4">
						<h4 class="font-medium">Add inducement</h4>
						<p class="mt-1 text-xs text-muted-foreground">Select a role whose constructions will be inherited by this role.</p>
						<div class="mt-2 space-y-3">
							<div class="space-y-1">
								<Label for="inducement_role">Induced Role</Label>
								<select
									id="inducement_role"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									bind:value={inducementRoleId}
								>
									<option value="">Select a role</option>
									{#each data.availableRoles as role}
										{#if role.id !== data.role.id}
											<option value={role.id}>{role.name}</option>
										{/if}
									{/each}
								</select>
							</div>
							<div class="space-y-1">
								<Label for="inducement_desc">Description (optional)</Label>
								<Input id="inducement_desc" bind:value={inducementDescription} placeholder="Why this inducement?" />
							</div>
							<div class="flex gap-2">
								<Button size="sm" disabled={!inducementRoleId || addInducementLoading} onclick={handleAddInducement}>
									Add Inducement
								</Button>
								<Button variant="outline" size="sm" onclick={() => (showAddInducement = false)}>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				{/if}

				<!-- Induced Roles (recursive traversal) -->
				{#if inducedRoles.length > 0}
					<Separator class="my-4" />
					<h3 class="font-medium">Induced Roles (recursive)</h3>
					<p class="mt-1 text-xs text-muted-foreground">All roles induced by this role, including transitive inducements.</p>
					<div class="mt-2 space-y-1">
						{#each inducedRoles as ir (ir.role_id)}
							<div class="flex items-center gap-2 rounded px-2 py-1 text-sm">
								<span style="margin-left: {ir.depth * 16}px">{ir.depth > 0 ? '\u2514\u2500 ' : ''}{ir.role_name}</span>
								<Badge variant="outline">depth {ir.depth}</Badge>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>
</Tabs>
