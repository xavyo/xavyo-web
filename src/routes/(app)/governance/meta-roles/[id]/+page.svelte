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
		MetaRoleInheritance,
		MetaRoleConflict,
		MetaRoleSimulationResult,
		MetaRoleCascadeStatus,
		MetaRoleEvent,
		MetaRoleEventStats
	} from '$lib/api/types';
	import {
		addCriterionClient,
		removeCriterionClient,
		addEntitlementClient,
		removeEntitlementClient,
		addConstraintClient,
		removeConstraintClient,
		fetchInheritances,
		reevaluateMetaRoleClient,
		simulateMetaRoleClient,
		cascadeMetaRoleClient,
		fetchConflicts,
		resolveConflictClient,
		fetchEvents,
		getEventStatsClient
	} from '$lib/api/meta-roles-client';
	import { fetchEntitlements } from '$lib/api/governance-client';
	import { Trash2, Plus, RefreshCw, Play, AlertTriangle, CheckCircle } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Delete dialog
	let showDeleteDialog = $state(false);
	let deleteError = $state('');

	// Edit form
	const { form, errors, enhance, message } = superForm(data.form, {
		invalidateAll: 'force',
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Meta-role updated successfully');
			}
		}
	});

	// Active tab
	let activeTab = $state('details');

	// --- Criteria tab state ---
	let showAddCriterion = $state(false);
	let criterionField = $state('risk_level');
	let criterionOperator = $state('eq');
	let criterionValue = $state('');
	let addCriterionLoading = $state(false);

	async function handleAddCriterion() {
		if (!criterionValue.trim()) return;
		addCriterionLoading = true;
		try {
			await addCriterionClient(data.metaRole.id, {
				field: criterionField,
				operator: criterionOperator as any,
				value: criterionValue.trim()
			});
			addToast('success', 'Criterion added');
			showAddCriterion = false;
			criterionValue = '';
			await invalidateAll();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to add criterion');
		} finally {
			addCriterionLoading = false;
		}
	}

	async function handleRemoveCriterion(criteriaId: string) {
		try {
			await removeCriterionClient(data.metaRole.id, criteriaId);
			addToast('success', 'Criterion removed');
			await invalidateAll();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to remove criterion');
		}
	}

	// --- Entitlements tab state ---
	let showAddEntitlement = $state(false);
	let availableEntitlements = $state<{ id: string; name: string }[]>([]);
	let selectedEntitlementId = $state('');
	let selectedPermissionType = $state<'grant' | 'deny'>('grant');
	let addEntitlementLoading = $state(false);

	async function openAddEntitlement() {
		showAddEntitlement = true;
		try {
			const result = await fetchEntitlements({ limit: 100 });
			availableEntitlements = result.items.map((e: any) => ({ id: e.id, name: e.name }));
		} catch {
			availableEntitlements = [];
		}
	}

	async function handleAddEntitlement() {
		if (!selectedEntitlementId) return;
		addEntitlementLoading = true;
		try {
			await addEntitlementClient(data.metaRole.id, {
				entitlement_id: selectedEntitlementId,
				permission_type: selectedPermissionType
			});
			addToast('success', 'Entitlement added');
			showAddEntitlement = false;
			selectedEntitlementId = '';
			selectedPermissionType = 'grant';
			await invalidateAll();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to add entitlement');
		} finally {
			addEntitlementLoading = false;
		}
	}

	async function handleRemoveEntitlement(entitlementId: string) {
		try {
			await removeEntitlementClient(data.metaRole.id, entitlementId);
			addToast('success', 'Entitlement removed');
			await invalidateAll();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to remove entitlement');
		}
	}

	// --- Constraints tab state ---
	let showAddConstraint = $state(false);
	let constraintType = $state('require_mfa');
	let constraintValue = $state('');
	let addConstraintLoading = $state(false);

	function getDefaultConstraintValue(type: string): string {
		switch (type) {
			case 'require_mfa':
				return '{"enabled": true}';
			case 'max_session_duration':
				return '{"hours": 8}';
			case 'ip_whitelist':
				return '{"cidrs": ["10.0.0.0/8"]}';
			case 'approval_required':
				return '{"approval_type": "manager"}';
			default:
				return '{}';
		}
	}

	async function handleAddConstraint() {
		addConstraintLoading = true;
		try {
			const parsedValue = JSON.parse(constraintValue) as Record<string, unknown>;
			await addConstraintClient(data.metaRole.id, {
				constraint_type: constraintType as any,
				constraint_value: parsedValue
			});
			addToast('success', 'Constraint added');
			showAddConstraint = false;
			constraintValue = '';
			await invalidateAll();
		} catch (e: any) {
			if (e instanceof SyntaxError) {
				addToast('error', 'Invalid JSON value');
			} else {
				addToast('error', e.message || 'Failed to add constraint');
			}
		} finally {
			addConstraintLoading = false;
		}
	}

	async function handleRemoveConstraint(constraintId: string) {
		try {
			await removeConstraintClient(data.metaRole.id, constraintId);
			addToast('success', 'Constraint removed');
			await invalidateAll();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to remove constraint');
		}
	}

	// --- Inheritances tab state ---
	let inheritances = $state<MetaRoleInheritance[]>([]);
	let inheritancesTotal = $state(0);
	let inheritancesLoaded = $state(false);
	let inheritancesLoading = $state(false);
	let inheritanceStatusFilter = $state('');
	let reevaluateLoading = $state(false);

	async function loadInheritances() {
		inheritancesLoading = true;
		try {
			const result = await fetchInheritances(data.metaRole.id, {
				status: inheritanceStatusFilter || undefined,
				limit: 50
			});
			inheritances = result.items;
			inheritancesTotal = result.total;
			inheritancesLoaded = true;
		} catch {
			inheritances = [];
		} finally {
			inheritancesLoading = false;
		}
	}

	async function handleReevaluate() {
		reevaluateLoading = true;
		try {
			const stats = await reevaluateMetaRoleClient(data.metaRole.id);
			addToast('success', `Re-evaluated: ${stats.active_inheritances} active inheritances`);
			await invalidateAll();
			inheritancesLoaded = false;
			await loadInheritances();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to re-evaluate');
		} finally {
			reevaluateLoading = false;
		}
	}

	// --- Conflicts tab state ---
	let conflicts = $state<MetaRoleConflict[]>([]);
	let conflictsTotal = $state(0);
	let conflictsLoaded = $state(false);
	let conflictsLoading = $state(false);
	let conflictTypeFilter = $state('');
	let conflictStatusFilter = $state('');
	let resolveComment = $state('');

	async function loadConflicts() {
		conflictsLoading = true;
		try {
			const result = await fetchConflicts({
				meta_role_id: data.metaRole.id,
				conflict_type: conflictTypeFilter || undefined,
				resolution_status: conflictStatusFilter || undefined,
				limit: 50
			});
			conflicts = result.items;
			conflictsTotal = result.total;
			conflictsLoaded = true;
		} catch {
			conflicts = [];
		} finally {
			conflictsLoading = false;
		}
	}

	async function handleResolveConflict(conflictId: string, strategy: string, choice?: string) {
		try {
			await resolveConflictClient(conflictId, {
				resolution_status: strategy as any,
				resolution_choice: choice,
				comment: resolveComment || undefined
			});
			addToast('success', 'Conflict resolved');
			resolveComment = '';
			conflictsLoaded = false;
			await loadConflicts();
			await invalidateAll();
		} catch (e: any) {
			addToast('error', e.message || 'Failed to resolve conflict');
		}
	}

	// --- Simulation tab state ---
	let simulationType = $state('criteria_change');
	let simulationCriteriaChanges = $state('');
	let simulationLimit = $state(100);
	let simulationResult = $state<MetaRoleSimulationResult | null>(null);
	let simulationLoading = $state(false);
	let cascadeResult = $state<MetaRoleCascadeStatus | null>(null);
	let cascadeLoading = $state(false);
	let cascadeDryRun = $state(true);

	async function handleSimulate() {
		simulationLoading = true;
		simulationResult = null;
		try {
			let criteriaChanges: { field: string; operator: string; value: unknown }[] | undefined;
			if (simulationType === 'criteria_change' && simulationCriteriaChanges.trim()) {
				criteriaChanges = JSON.parse(simulationCriteriaChanges) as { field: string; operator: string; value: unknown }[];
			}
			const result = await simulateMetaRoleClient(data.metaRole.id, {
				simulation_type: simulationType as any,
				criteria_changes: criteriaChanges as any,
				limit: simulationLimit
			});
			simulationResult = result;
		} catch (e: any) {
			if (e instanceof SyntaxError) {
				addToast('error', 'Invalid JSON in criteria changes');
			} else {
				addToast('error', e.message || 'Simulation failed');
			}
		} finally {
			simulationLoading = false;
		}
	}

	async function handleCascade() {
		cascadeLoading = true;
		cascadeResult = null;
		try {
			const result = await cascadeMetaRoleClient(data.metaRole.id, {
				meta_role_id: data.metaRole.id,
				dry_run: cascadeDryRun
			});
			cascadeResult = result;
			addToast('success', cascadeDryRun ? 'Dry run complete' : 'Cascade started');
		} catch (e: any) {
			addToast('error', e.message || 'Cascade failed');
		} finally {
			cascadeLoading = false;
		}
	}

	// --- Events tab state ---
	let events = $state<MetaRoleEvent[]>([]);
	let eventsTotal = $state(0);
	let eventStats = $state<MetaRoleEventStats | null>(null);
	let eventsLoaded = $state(false);
	let eventsLoading = $state(false);
	let eventTypeFilter = $state('');
	let eventFromDate = $state('');
	let eventToDate = $state('');
	let expandedEventIds = $state<Set<string>>(new Set());

	async function loadEvents() {
		eventsLoading = true;
		try {
			const [eventsResult, statsResult] = await Promise.all([
				fetchEvents({
					meta_role_id: data.metaRole.id,
					event_type: eventTypeFilter || undefined,
					from_date: eventFromDate ? `${eventFromDate}T00:00:00Z` : undefined,
					to_date: eventToDate ? `${eventToDate}T23:59:59Z` : undefined,
					limit: 50
				}),
				getEventStatsClient({
					meta_role_id: data.metaRole.id,
					event_type: eventTypeFilter || undefined,
					from_date: eventFromDate ? `${eventFromDate}T00:00:00Z` : undefined,
					to_date: eventToDate ? `${eventToDate}T23:59:59Z` : undefined
				})
			]);
			events = eventsResult.items;
			eventsTotal = eventsResult.total;
			eventStats = statsResult;
			eventsLoaded = true;
		} catch {
			events = [];
		} finally {
			eventsLoading = false;
		}
	}

	function toggleEventExpand(eventId: string) {
		const next = new Set(expandedEventIds);
		if (next.has(eventId)) {
			next.delete(eventId);
		} else {
			next.add(eventId);
		}
		expandedEventIds = next;
	}

	// Tab change handler - lazy load data
	function handleTabChange(tab: string) {
		activeTab = tab;
		if (tab === 'inheritances' && !inheritancesLoaded) loadInheritances();
		if (tab === 'conflicts' && !conflictsLoaded) loadConflicts();
		if (tab === 'events' && !eventsLoaded) loadEvents();
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatJson(value: unknown): string {
		if (value === null || value === undefined) return '-';
		if (typeof value === 'string') return value;
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}

	function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'active':
				return 'default';
			case 'suspended':
			case 'disabled':
				return 'secondary';
			case 'removed':
				return 'destructive';
			case 'unresolved':
				return 'destructive';
			case 'resolved_priority':
			case 'resolved_manual':
				return 'default';
			case 'ignored':
				return 'secondary';
			default:
				return 'outline';
		}
	}

	function conflictTypeBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (type) {
			case 'entitlement_conflict':
				return 'destructive';
			case 'constraint_conflict':
				return 'secondary';
			case 'policy_conflict':
				return 'outline';
			default:
				return 'outline';
		}
	}

	function eventTypeBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (type) {
			case 'created':
			case 'enabled':
			case 'inheritance_applied':
			case 'conflict_resolved':
			case 'cascade_completed':
				return 'default';
			case 'updated':
			case 'cascade_started':
				return 'secondary';
			case 'deleted':
			case 'disabled':
			case 'inheritance_removed':
			case 'cascade_failed':
				return 'destructive';
			case 'conflict_detected':
				return 'outline';
			default:
				return 'outline';
		}
	}

	const CRITERIA_FIELDS = ['risk_level', 'application_id', 'owner_id', 'status', 'name', 'is_delegable', 'metadata'];
	const CRITERIA_OPERATORS = ['eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'contains', 'starts_with'];
	const CONSTRAINT_TYPES = ['max_session_duration', 'require_mfa', 'ip_whitelist', 'approval_required'];
	const EVENT_TYPES = ['created', 'updated', 'deleted', 'disabled', 'enabled', 'inheritance_applied', 'inheritance_removed', 'conflict_detected', 'conflict_resolved', 'cascade_started', 'cascade_completed', 'cascade_failed'];
	const SIMULATION_TYPES = ['create', 'update', 'delete', 'criteria_change', 'enable', 'disable'];
	const CONFLICT_TYPES = ['entitlement_conflict', 'constraint_conflict', 'policy_conflict'];
	const RESOLUTION_STATUSES = ['unresolved', 'resolved_priority', 'resolved_manual', 'ignored'];
	const INHERITANCE_STATUSES = ['active', 'suspended', 'removed'];
</script>

<!-- Header section -->
<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">{data.metaRole.name}</h1>
		<p class="mt-1 text-sm text-muted-foreground">{data.metaRole.description ?? 'Meta-role'}</p>
	</div>
	<div class="flex items-center gap-2">
		<Badge variant={data.metaRole.status === 'active' ? 'default' : 'secondary'}>
			{data.metaRole.status}
		</Badge>
		<Badge variant="outline">Priority: {data.metaRole.priority}</Badge>
		<Badge variant="outline">{data.metaRole.criteria_logic.toUpperCase()}</Badge>
	</div>
</div>

<!-- Stats summary -->
<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
	<div class="rounded-md border p-3 text-center">
		<p class="text-2xl font-bold">{data.metaRole.stats?.criteria_count ?? 0}</p>
		<p class="text-xs text-muted-foreground">Criteria</p>
	</div>
	<div class="rounded-md border p-3 text-center">
		<p class="text-2xl font-bold">{data.metaRole.stats?.entitlements_count ?? 0}</p>
		<p class="text-xs text-muted-foreground">Entitlements</p>
	</div>
	<div class="rounded-md border p-3 text-center">
		<p class="text-2xl font-bold">{data.metaRole.stats?.constraints_count ?? 0}</p>
		<p class="text-xs text-muted-foreground">Constraints</p>
	</div>
	<div class="rounded-md border p-3 text-center">
		<p class="text-2xl font-bold">{data.metaRole.stats?.active_inheritances ?? 0}</p>
		<p class="text-xs text-muted-foreground">Inheritances</p>
	</div>
	<div class="rounded-md border p-3 text-center">
		<p class="text-2xl font-bold text-destructive">{data.metaRole.stats?.unresolved_conflicts ?? 0}</p>
		<p class="text-xs text-muted-foreground">Conflicts</p>
	</div>
</div>

<!-- Tabs -->
<Tabs value={activeTab} onValueChange={handleTabChange}>
	<TabsList>
		<TabsTrigger value="details">Details</TabsTrigger>
		<TabsTrigger value="criteria">Criteria</TabsTrigger>
		<TabsTrigger value="entitlements">Entitlements</TabsTrigger>
		<TabsTrigger value="constraints">Constraints</TabsTrigger>
		<TabsTrigger value="inheritances">Inheritances</TabsTrigger>
		<TabsTrigger value="conflicts">Conflicts</TabsTrigger>
		<TabsTrigger value="simulation">Simulation</TabsTrigger>
		<TabsTrigger value="events">Events</TabsTrigger>
	</TabsList>

	<!-- ========================== -->
	<!-- Details Tab                -->
	<!-- ========================== -->
	<TabsContent value="details">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Edit meta-role</h2>
			</CardHeader>
			<CardContent>
				{#if $message}
					<Alert variant="default" class="mb-4">
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

					<div class="space-y-2">
						<Label for="priority">Priority</Label>
						<Input id="priority" name="priority" type="number" min="1" max="1000" value={String($form.priority ?? '')} />
						{#if $errors.priority}
							<p class="text-sm text-destructive">{$errors.priority}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="criteria_logic">Criteria Logic</Label>
						<select
							id="criteria_logic"
							name="criteria_logic"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							value={String($form.criteria_logic ?? 'and')}
						>
							<option value="and">AND (all criteria must match)</option>
							<option value="or">OR (any criterion can match)</option>
						</select>
						{#if $errors.criteria_logic}
							<p class="text-sm text-destructive">{$errors.criteria_logic}</p>
						{/if}
					</div>

					<Button type="submit">Save Changes</Button>
				</form>

				<Separator class="my-6" />

				<!-- Enable / Disable -->
				<div class="mb-6">
					<h3 class="text-lg font-semibold">Status</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						Current status: <Badge variant={data.metaRole.status === 'active' ? 'default' : 'secondary'}>{data.metaRole.status}</Badge>
					</p>
					{#if data.metaRole.status === 'active'}
						<form
							method="POST"
							action="?/disable"
							class="mt-3"
							use:formEnhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										addToast('success', 'Meta-role disabled');
										await invalidateAll();
									} else if (result.type === 'failure') {
										addToast('error', (result.data as any)?.error || 'Failed to disable');
									}
								};
							}}
						>
							<Button type="submit" variant="secondary" size="sm">Disable Meta-Role</Button>
						</form>
					{:else}
						<form
							method="POST"
							action="?/enable"
							class="mt-3"
							use:formEnhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										addToast('success', 'Meta-role enabled');
										await invalidateAll();
									} else if (result.type === 'failure') {
										addToast('error', (result.data as any)?.error || 'Failed to enable');
									}
								};
							}}
						>
							<Button type="submit" size="sm">Enable Meta-Role</Button>
						</form>
					{/if}
				</div>

				<Separator class="my-6" />

				<!-- Delete Section -->
				<div>
					<h3 class="text-lg font-semibold text-destructive">Danger zone</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						Deleting a meta-role is permanent and will remove all associated criteria, entitlements, and constraints.
					</p>
					{#if deleteError}
						<Alert variant="destructive" class="mt-2">
							<AlertDescription>{deleteError}</AlertDescription>
						</Alert>
					{/if}
					{#if showDeleteDialog}
						<div class="mt-3 rounded-md border border-destructive p-4">
							<p class="text-sm">Are you sure you want to delete "{data.metaRole.name}"?</p>
							<div class="mt-3 flex gap-2">
								<form
									method="POST"
									action="?/delete"
									use:formEnhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'failure') {
												deleteError = (result.data as any)?.error || 'Failed to delete';
												showDeleteDialog = false;
											} else if (result.type === 'redirect') {
												addToast('success', 'Meta-role deleted');
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
								<Button
									variant="outline"
									size="sm"
									onclick={() => {
										showDeleteDialog = false;
										deleteError = '';
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					{:else}
						<Button variant="destructive" size="sm" class="mt-3" onclick={() => (showDeleteDialog = true)}>
							<Trash2 class="mr-1 h-3 w-3" />
							Delete Meta-Role
						</Button>
					{/if}
				</div>

				<Separator class="my-6" />

				<!-- Metadata -->
				<div>
					<h3 class="text-lg font-semibold">Metadata</h3>
					<div class="mt-2 space-y-1 text-sm text-muted-foreground">
						<p>ID: <code class="rounded bg-muted px-1">{data.metaRole.id}</code></p>
						<p>Created by: {data.metaRole.created_by}</p>
						<p>Created: {formatDate(data.metaRole.created_at)}</p>
						<p>Updated: {formatDate(data.metaRole.updated_at)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</TabsContent>

	<!-- ========================== -->
	<!-- Criteria Tab               -->
	<!-- ========================== -->
	<TabsContent value="criteria">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Criteria ({data.metaRole.criteria.length})</h2>
					<Button size="sm" onclick={() => (showAddCriterion = true)}>
						<Plus class="mr-1 h-3 w-3" />
						Add Criterion
					</Button>
				</div>
				<p class="text-sm text-muted-foreground">
					Criteria logic: <Badge variant="outline">{data.metaRole.criteria_logic.toUpperCase()}</Badge> - {data.metaRole.criteria_logic === 'and' ? 'all criteria must match' : 'any criterion can match'}
				</p>
			</CardHeader>
			<CardContent>
				{#if data.metaRole.criteria.length === 0}
					<p class="text-sm text-muted-foreground">No criteria defined. Add criteria to determine which roles inherit from this meta-role.</p>
				{:else}
					<div class="space-y-2">
						{#each data.metaRole.criteria as criterion (criterion.id)}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div class="flex items-center gap-2">
									<Badge variant="outline">{criterion.field}</Badge>
									<span class="text-sm font-medium">{criterion.operator}</span>
									<code class="rounded bg-muted px-2 py-0.5 text-sm">{formatJson(criterion.value)}</code>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-xs text-muted-foreground">{formatDate(criterion.created_at)}</span>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => handleRemoveCriterion(criterion.id)}
									>
										<Trash2 class="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add criterion form -->
				{#if showAddCriterion}
					<div class="mt-4 rounded-md border p-4">
						<h4 class="font-medium">Add criterion</h4>
						<div class="mt-2 space-y-3">
							<div class="grid grid-cols-3 gap-3">
								<div class="space-y-1">
									<Label for="criterion_field">Field</Label>
									<select
										id="criterion_field"
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
										bind:value={criterionField}
									>
										{#each CRITERIA_FIELDS as field}
											<option value={field}>{field}</option>
										{/each}
									</select>
								</div>
								<div class="space-y-1">
									<Label for="criterion_operator">Operator</Label>
									<select
										id="criterion_operator"
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
										bind:value={criterionOperator}
									>
										{#each CRITERIA_OPERATORS as op}
											<option value={op}>{op}</option>
										{/each}
									</select>
								</div>
								<div class="space-y-1">
									<Label for="criterion_value">Value</Label>
									<Input id="criterion_value" bind:value={criterionValue} placeholder="e.g. high" />
								</div>
							</div>
							<div class="flex gap-2">
								<Button
									size="sm"
									disabled={!criterionValue.trim() || addCriterionLoading}
									onclick={handleAddCriterion}
								>
									Add
								</Button>
								<Button variant="outline" size="sm" onclick={() => (showAddCriterion = false)}>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- ========================== -->
	<!-- Entitlements Tab           -->
	<!-- ========================== -->
	<TabsContent value="entitlements">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Entitlements ({data.metaRole.entitlements.length})</h2>
					<Button size="sm" onclick={openAddEntitlement}>
						<Plus class="mr-1 h-3 w-3" />
						Add Entitlement
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{#if data.metaRole.entitlements.length === 0}
					<p class="text-sm text-muted-foreground">No entitlements assigned. Add entitlements that will be granted or denied to matching roles.</p>
				{:else}
					<div class="space-y-2">
						{#each data.metaRole.entitlements as ent (ent.id)}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div>
									<div class="flex items-center gap-2">
										<span class="font-medium">{ent.entitlement?.name ?? ent.entitlement_id}</span>
										<Badge variant={ent.permission_type === 'grant' ? 'default' : 'destructive'}>
											{ent.permission_type}
										</Badge>
									</div>
									{#if ent.entitlement}
										<div class="mt-1 flex gap-2 text-xs text-muted-foreground">
											{#if ent.entitlement.application_name}
												<span>App: {ent.entitlement.application_name}</span>
											{/if}
											{#if ent.entitlement.risk_level}
												<Badge variant="outline" class="text-xs">{ent.entitlement.risk_level}</Badge>
											{/if}
										</div>
									{/if}
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

				<!-- Add entitlement form -->
				{#if showAddEntitlement}
					<div class="mt-4 rounded-md border p-4">
						<h4 class="font-medium">Add entitlement</h4>
						<div class="mt-2 space-y-3">
							<div class="space-y-1">
								<Label for="entitlement_select">Entitlement</Label>
								<select
									id="entitlement_select"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									bind:value={selectedEntitlementId}
								>
									<option value="">Select entitlement</option>
									{#each availableEntitlements as ent}
										<option value={ent.id}>{ent.name}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-1">
								<Label for="permission_type">Permission Type</Label>
								<select
									id="permission_type"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									bind:value={selectedPermissionType}
								>
									<option value="grant">Grant</option>
									<option value="deny">Deny</option>
								</select>
							</div>
							<div class="flex gap-2">
								<Button
									size="sm"
									disabled={!selectedEntitlementId || addEntitlementLoading}
									onclick={handleAddEntitlement}
								>
									Add
								</Button>
								<Button variant="outline" size="sm" onclick={() => (showAddEntitlement = false)}>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- ========================== -->
	<!-- Constraints Tab            -->
	<!-- ========================== -->
	<TabsContent value="constraints">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Constraints ({data.metaRole.constraints.length})</h2>
					<Button
						size="sm"
						onclick={() => {
							showAddConstraint = true;
							constraintValue = getDefaultConstraintValue(constraintType);
						}}
					>
						<Plus class="mr-1 h-3 w-3" />
						Add Constraint
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{#if data.metaRole.constraints.length === 0}
					<p class="text-sm text-muted-foreground">No constraints defined. Add constraints like MFA requirements, session limits, or IP restrictions.</p>
				{:else}
					<div class="space-y-2">
						{#each data.metaRole.constraints as constraint (constraint.id)}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div>
									<div class="flex items-center gap-2">
										<Badge variant="outline">{constraint.constraint_type.replace(/_/g, ' ')}</Badge>
									</div>
									<pre class="mt-1 max-w-md overflow-x-auto rounded bg-muted p-2 text-xs">{formatJson(constraint.constraint_value)}</pre>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => handleRemoveConstraint(constraint.id)}
								>
									<Trash2 class="h-4 w-4 text-destructive" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add constraint form -->
				{#if showAddConstraint}
					<div class="mt-4 rounded-md border p-4">
						<h4 class="font-medium">Add constraint</h4>
						<div class="mt-2 space-y-3">
							<div class="space-y-1">
								<Label for="constraint_type">Constraint Type</Label>
								<select
									id="constraint_type"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									bind:value={constraintType}
									onchange={() => { constraintValue = getDefaultConstraintValue(constraintType); }}
								>
									{#each CONSTRAINT_TYPES as ct}
										<option value={ct}>{ct.replace(/_/g, ' ')}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-1">
								<Label for="constraint_value">Value (JSON)</Label>
								<textarea
									id="constraint_value"
									class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									bind:value={constraintValue}
								></textarea>
							</div>
							<div class="flex gap-2">
								<Button
									size="sm"
									disabled={!constraintValue.trim() || addConstraintLoading}
									onclick={handleAddConstraint}
								>
									Add
								</Button>
								<Button variant="outline" size="sm" onclick={() => (showAddConstraint = false)}>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- ========================== -->
	<!-- Inheritances Tab           -->
	<!-- ========================== -->
	<TabsContent value="inheritances">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Inheritances ({inheritancesTotal})</h2>
					<div class="flex gap-2">
						<Button variant="outline" size="sm" disabled={reevaluateLoading} onclick={handleReevaluate}>
							<RefreshCw class="mr-1 h-3 w-3" />
							Re-evaluate
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<!-- Status filter -->
				<div class="mb-4 flex items-center gap-3">
					<Label for="inheritance_status_filter">Filter by status:</Label>
					<select
						id="inheritance_status_filter"
						class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
						bind:value={inheritanceStatusFilter}
						onchange={() => {
							inheritancesLoaded = false;
							loadInheritances();
						}}
					>
						<option value="">All</option>
						{#each INHERITANCE_STATUSES as s}
							<option value={s}>{s}</option>
						{/each}
					</select>
				</div>

				{#if inheritancesLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-12 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else if inheritances.length === 0}
					<p class="text-sm text-muted-foreground">No inheritances found. Click "Re-evaluate" to discover matching roles.</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b text-left">
									<th class="pb-2 pr-4 font-medium">Child Role</th>
									<th class="pb-2 pr-4 font-medium">Application</th>
									<th class="pb-2 pr-4 font-medium">Status</th>
									<th class="pb-2 pr-4 font-medium">Match Reason</th>
									<th class="pb-2 font-medium">Matched At</th>
								</tr>
							</thead>
							<tbody>
								{#each inheritances as inh (inh.id)}
									<tr class="border-b last:border-0">
										<td class="py-2 pr-4">
											{#if inh.child_role}
												<a href="/governance/roles/{inh.child_role.id}" class="text-primary hover:underline">
													{inh.child_role.name}
												</a>
											{:else}
												<span class="text-muted-foreground">{inh.child_role_id}</span>
											{/if}
										</td>
										<td class="py-2 pr-4 text-muted-foreground">
											{inh.child_role?.application_name ?? '-'}
										</td>
										<td class="py-2 pr-4">
											<Badge variant={statusBadgeVariant(inh.status)}>{inh.status}</Badge>
										</td>
										<td class="py-2 pr-4">
											<code class="max-w-[200px] truncate rounded bg-muted px-1 text-xs">{formatJson(inh.match_reason)}</code>
										</td>
										<td class="py-2 text-xs text-muted-foreground">
											{formatDate(inh.matched_at)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					{#if inheritancesTotal > inheritances.length}
						<p class="mt-3 text-xs text-muted-foreground">
							Showing {inheritances.length} of {inheritancesTotal} inheritances.
						</p>
					{/if}
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- ========================== -->
	<!-- Conflicts Tab              -->
	<!-- ========================== -->
	<TabsContent value="conflicts">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Conflicts ({conflictsTotal})</h2>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							conflictsLoaded = false;
							loadConflicts();
						}}
					>
						<RefreshCw class="mr-1 h-3 w-3" />
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<!-- Filters -->
				<div class="mb-4 flex flex-wrap items-center gap-3">
					<div class="flex items-center gap-2">
						<Label for="conflict_type_filter">Type:</Label>
						<select
							id="conflict_type_filter"
							class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
							bind:value={conflictTypeFilter}
							onchange={() => {
								conflictsLoaded = false;
								loadConflicts();
							}}
						>
							<option value="">All</option>
							{#each CONFLICT_TYPES as ct}
								<option value={ct}>{ct.replace(/_/g, ' ')}</option>
							{/each}
						</select>
					</div>
					<div class="flex items-center gap-2">
						<Label for="conflict_status_filter">Status:</Label>
						<select
							id="conflict_status_filter"
							class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
							bind:value={conflictStatusFilter}
							onchange={() => {
								conflictsLoaded = false;
								loadConflicts();
							}}
						>
							<option value="">All</option>
							{#each RESOLUTION_STATUSES as rs}
								<option value={rs}>{rs.replace(/_/g, ' ')}</option>
							{/each}
						</select>
					</div>
				</div>

				{#if conflictsLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-12 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else if conflicts.length === 0}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<CheckCircle class="h-4 w-4 text-green-500" />
						No conflicts found.
					</div>
				{:else}
					<div class="space-y-4">
						{#each conflicts as conflict (conflict.id)}
							<div class="rounded-md border p-4">
								<div class="flex items-start justify-between">
									<div>
										<div class="flex items-center gap-2">
											<Badge variant={conflictTypeBadgeVariant(conflict.conflict_type)}>
												{conflict.conflict_type.replace(/_/g, ' ')}
											</Badge>
											<Badge variant={statusBadgeVariant(conflict.resolution_status)}>
												{conflict.resolution_status.replace(/_/g, ' ')}
											</Badge>
										</div>
										<div class="mt-2 text-sm">
											<span class="font-medium">{conflict.meta_role_a?.name ?? conflict.meta_role_a_id}</span>
											<span class="mx-2 text-muted-foreground">vs</span>
											<span class="font-medium">{conflict.meta_role_b?.name ?? conflict.meta_role_b_id}</span>
										</div>
										{#if conflict.affected_role}
											<p class="mt-1 text-xs text-muted-foreground">
												Affected role: <a href="/governance/roles/{conflict.affected_role.id}" class="text-primary hover:underline">{conflict.affected_role.name}</a>
												{#if conflict.affected_role.application_name}
													({conflict.affected_role.application_name})
												{/if}
											</p>
										{/if}
										{#if conflict.conflicting_items}
											<pre class="mt-2 max-w-lg overflow-x-auto rounded bg-muted p-2 text-xs">{formatJson(conflict.conflicting_items)}</pre>
										{/if}
										<p class="mt-1 text-xs text-muted-foreground">Detected: {formatDate(conflict.detected_at)}</p>
										{#if conflict.resolved_at}
											<p class="text-xs text-muted-foreground">Resolved: {formatDate(conflict.resolved_at)}</p>
										{/if}
									</div>
								</div>

								<!-- Resolution controls for unresolved conflicts -->
								{#if conflict.resolution_status === 'unresolved'}
									<Separator class="my-3" />
									<div class="space-y-2">
										<div class="space-y-1">
											<Label for="resolve_comment_{conflict.id}">Comment (optional)</Label>
											<Input
												id="resolve_comment_{conflict.id}"
												bind:value={resolveComment}
												placeholder="Resolution reason..."
											/>
										</div>
										<div class="flex flex-wrap gap-2">
											<Button
												size="sm"
												variant="default"
												onclick={() => handleResolveConflict(conflict.id, 'resolved_priority')}
											>
												Resolve by Priority
											</Button>
											<Button
												size="sm"
												variant="secondary"
												onclick={() => handleResolveConflict(conflict.id, 'resolved_manual')}
											>
												Resolve Manually
											</Button>
											<Button
												size="sm"
												variant="outline"
												onclick={() => handleResolveConflict(conflict.id, 'ignored')}
											>
												Ignore
											</Button>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
					{#if conflictsTotal > conflicts.length}
						<p class="mt-3 text-xs text-muted-foreground">
							Showing {conflicts.length} of {conflictsTotal} conflicts.
						</p>
					{/if}
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- ========================== -->
	<!-- Simulation Tab             -->
	<!-- ========================== -->
	<TabsContent value="simulation">
		<div class="space-y-6">
			<!-- Simulation form -->
			<Card>
				<CardHeader>
					<h2 class="text-xl font-semibold">Simulate Changes</h2>
					<p class="text-sm text-muted-foreground">Preview the impact of changes before applying them.</p>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-1">
								<Label for="simulation_type">Simulation Type</Label>
								<select
									id="simulation_type"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									bind:value={simulationType}
								>
									{#each SIMULATION_TYPES as st}
										<option value={st}>{st.replace(/_/g, ' ')}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-1">
								<Label for="simulation_limit">Limit</Label>
								<Input
									id="simulation_limit"
									type="number"
									min="1"
									max="1000"
									bind:value={simulationLimit}
								/>
							</div>
						</div>

						{#if simulationType === 'criteria_change'}
							<div class="space-y-1">
								<Label for="simulation_criteria">Criteria Changes (JSON array)</Label>
								<textarea
									id="simulation_criteria"
									class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									bind:value={simulationCriteriaChanges}
									placeholder={'[{"field": "risk_level", "operator": "eq", "value": "critical"}]'}
								></textarea>
							</div>
						{/if}

						<Button disabled={simulationLoading} onclick={handleSimulate}>
							<Play class="mr-1 h-3 w-3" />
							{simulationLoading ? 'Simulating...' : 'Run Simulation'}
						</Button>
					</div>
				</CardContent>
			</Card>

			<!-- Simulation results -->
			{#if simulationResult}
				<Card>
					<CardHeader>
						<h2 class="text-xl font-semibold">Simulation Results</h2>
					</CardHeader>
					<CardContent>
						<!-- Summary -->
						<div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
							<div class="rounded-md border p-2 text-center">
								<p class="text-lg font-bold">{simulationResult.summary.total_roles_affected}</p>
								<p class="text-xs text-muted-foreground">Roles Affected</p>
							</div>
							<div class="rounded-md border p-2 text-center">
								<p class="text-lg font-bold text-green-600">{simulationResult.summary.roles_gaining_inheritance}</p>
								<p class="text-xs text-muted-foreground">Gaining</p>
							</div>
							<div class="rounded-md border p-2 text-center">
								<p class="text-lg font-bold text-red-600">{simulationResult.summary.roles_losing_inheritance}</p>
								<p class="text-xs text-muted-foreground">Losing</p>
							</div>
							<div class="rounded-md border p-2 text-center">
								<p class="text-lg font-bold">{simulationResult.summary.new_conflicts}</p>
								<p class="text-xs text-muted-foreground">New Conflicts</p>
							</div>
							<div class="rounded-md border p-2 text-center">
								<p class="text-lg font-bold">{simulationResult.summary.resolved_conflicts}</p>
								<p class="text-xs text-muted-foreground">Resolved Conflicts</p>
							</div>
						</div>

						<!-- Safety indicator -->
						{#if simulationResult.summary.is_safe}
							<Alert class="mb-4">
								<CheckCircle class="h-4 w-4" />
								<AlertDescription>This change is safe to apply.</AlertDescription>
							</Alert>
						{:else}
							<Alert variant="destructive" class="mb-4">
								<AlertTriangle class="h-4 w-4" />
								<AlertDescription>
									This change may cause issues.
									{#if simulationResult.summary.warnings.length > 0}
										<ul class="mt-1 list-inside list-disc">
											{#each simulationResult.summary.warnings as warning}
												<li>{warning}</li>
											{/each}
										</ul>
									{/if}
								</AlertDescription>
							</Alert>
						{/if}

						<!-- Roles to add -->
						{#if simulationResult.roles_to_add.length > 0}
							<div class="mb-4">
								<h3 class="mb-2 font-medium text-green-600">Roles Gaining Inheritance ({simulationResult.roles_to_add.length})</h3>
								<div class="space-y-1">
									{#each simulationResult.roles_to_add as role}
										<div class="rounded bg-green-50 p-2 text-sm dark:bg-green-950/20">
											<span class="font-medium">{role.role_name}</span>
											{#if role.entitlements_affected.length > 0}
												<span class="ml-2 text-xs text-muted-foreground">+{role.entitlements_affected.length} entitlements</span>
											{/if}
											{#if role.constraints_affected.length > 0}
												<span class="ml-2 text-xs text-muted-foreground">+{role.constraints_affected.length} constraints</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Roles to remove -->
						{#if simulationResult.roles_to_remove.length > 0}
							<div class="mb-4">
								<h3 class="mb-2 font-medium text-red-600">Roles Losing Inheritance ({simulationResult.roles_to_remove.length})</h3>
								<div class="space-y-1">
									{#each simulationResult.roles_to_remove as role}
										<div class="rounded bg-red-50 p-2 text-sm dark:bg-red-950/20">
											<span class="font-medium">{role.role_name}</span>
											{#if role.entitlements_affected.length > 0}
												<span class="ml-2 text-xs text-muted-foreground">-{role.entitlements_affected.length} entitlements</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Potential conflicts -->
						{#if simulationResult.potential_conflicts.length > 0}
							<div class="mb-4">
								<h3 class="mb-2 font-medium">Potential Conflicts ({simulationResult.potential_conflicts.length})</h3>
								<div class="space-y-2">
									{#each simulationResult.potential_conflicts as pc}
										<div class="rounded-md border border-yellow-300 p-2 text-sm dark:border-yellow-700">
											<div class="flex items-center gap-2">
												<AlertTriangle class="h-3 w-3 text-yellow-600" />
												<span>{pc.meta_role_a_name} vs {pc.meta_role_b_name}</span>
												<Badge variant="outline" class="text-xs">{pc.conflict_type.replace(/_/g, ' ')}</Badge>
											</div>
											<p class="mt-1 text-xs text-muted-foreground">Affected: {pc.affected_role_name}</p>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}

			<!-- Cascade section -->
			<Card>
				<CardHeader>
					<h2 class="text-xl font-semibold">Cascade Changes</h2>
					<p class="text-sm text-muted-foreground">Apply inheritance changes to all matching roles.</p>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="flex items-center gap-2">
							<input
								id="cascade_dry_run"
								type="checkbox"
								class="h-4 w-4 rounded border-input"
								bind:checked={cascadeDryRun}
							/>
							<Label for="cascade_dry_run">Dry run (preview only, no changes applied)</Label>
						</div>

						<Button
							disabled={cascadeLoading}
							variant={cascadeDryRun ? 'default' : 'destructive'}
							onclick={handleCascade}
						>
							<Play class="mr-1 h-3 w-3" />
							{cascadeLoading ? 'Processing...' : cascadeDryRun ? 'Run Dry Cascade' : 'Apply Cascade'}
						</Button>

						{#if !cascadeDryRun}
							<p class="text-xs text-destructive">Warning: This will apply changes to all matching roles.</p>
						{/if}
					</div>

					<!-- Cascade results -->
					{#if cascadeResult}
						<Separator class="my-4" />
						<div class="space-y-3">
							<h3 class="font-medium">Cascade Results</h3>
							<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
								<div class="rounded-md border p-2 text-center">
									<p class="text-lg font-bold">{cascadeResult.processed_count}</p>
									<p class="text-xs text-muted-foreground">Processed</p>
								</div>
								<div class="rounded-md border p-2 text-center">
									<p class="text-lg font-bold">{cascadeResult.remaining_count}</p>
									<p class="text-xs text-muted-foreground">Remaining</p>
								</div>
								<div class="rounded-md border p-2 text-center">
									<p class="text-lg font-bold text-green-600">{cascadeResult.success_count}</p>
									<p class="text-xs text-muted-foreground">Succeeded</p>
								</div>
								<div class="rounded-md border p-2 text-center">
									<p class="text-lg font-bold text-red-600">{cascadeResult.failure_count}</p>
									<p class="text-xs text-muted-foreground">Failed</p>
								</div>
							</div>

							{#if cascadeResult.in_progress}
								<Badge variant="secondary">In Progress</Badge>
							{:else if cascadeResult.completed_at}
								<p class="text-xs text-muted-foreground">Completed: {formatDate(cascadeResult.completed_at)}</p>
							{/if}

							{#if cascadeResult.failures && cascadeResult.failures.length > 0}
								<div class="mt-2">
									<h4 class="text-sm font-medium text-destructive">Failures</h4>
									<div class="mt-1 space-y-1">
										{#each cascadeResult.failures as failure}
											<div class="rounded bg-red-50 p-2 text-xs dark:bg-red-950/20">
												<span class="font-medium">Role: {failure.role_id}</span>
												<span class="ml-2 text-destructive">{failure.error}</span>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>
	</TabsContent>

	<!-- ========================== -->
	<!-- Events Tab                 -->
	<!-- ========================== -->
	<TabsContent value="events">
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Events ({eventsTotal})</h2>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							eventsLoaded = false;
							loadEvents();
						}}
					>
						<RefreshCw class="mr-1 h-3 w-3" />
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<!-- Filters -->
				<div class="mb-4 flex flex-wrap items-end gap-3">
					<div class="space-y-1">
						<Label for="event_type_filter">Type</Label>
						<select
							id="event_type_filter"
							class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
							bind:value={eventTypeFilter}
							onchange={() => {
								eventsLoaded = false;
								loadEvents();
							}}
						>
							<option value="">All</option>
							{#each EVENT_TYPES as et}
								<option value={et}>{et.replace(/_/g, ' ')}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-1">
						<Label for="event_from">From</Label>
						<input
							id="event_from"
							type="date"
							class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
							bind:value={eventFromDate}
							onchange={() => {
								eventsLoaded = false;
								loadEvents();
							}}
						/>
					</div>
					<div class="space-y-1">
						<Label for="event_to">To</Label>
						<input
							id="event_to"
							type="date"
							class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
							bind:value={eventToDate}
							onchange={() => {
								eventsLoaded = false;
								loadEvents();
							}}
						/>
					</div>
				</div>

				<!-- Event stats summary -->
				{#if eventStats}
					<div class="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
						<div class="rounded-md border p-2 text-center">
							<p class="text-sm font-bold">{eventStats.total}</p>
							<p class="text-[10px] text-muted-foreground">Total</p>
						</div>
						<div class="rounded-md border p-2 text-center">
							<p class="text-sm font-bold">{eventStats.created}</p>
							<p class="text-[10px] text-muted-foreground">Created</p>
						</div>
						<div class="rounded-md border p-2 text-center">
							<p class="text-sm font-bold">{eventStats.updated}</p>
							<p class="text-[10px] text-muted-foreground">Updated</p>
						</div>
						<div class="rounded-md border p-2 text-center">
							<p class="text-sm font-bold">{eventStats.inheritance_applied}</p>
							<p class="text-[10px] text-muted-foreground">Inherited</p>
						</div>
						<div class="rounded-md border p-2 text-center">
							<p class="text-sm font-bold">{eventStats.conflict_detected}</p>
							<p class="text-[10px] text-muted-foreground">Conflicts</p>
						</div>
						<div class="rounded-md border p-2 text-center">
							<p class="text-sm font-bold">{eventStats.cascade_completed}</p>
							<p class="text-[10px] text-muted-foreground">Cascades</p>
						</div>
					</div>
				{/if}

				{#if eventsLoading}
					<div class="space-y-3">
						{#each [1, 2, 3] as _}
							<div class="h-10 animate-pulse rounded bg-muted"></div>
						{/each}
					</div>
				{:else if events.length === 0}
					<p class="text-sm text-muted-foreground">No events recorded.</p>
				{:else}
					<div class="space-y-2">
						{#each events as event (event.id)}
							<div class="rounded-md border p-3">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<Badge variant={eventTypeBadgeVariant(event.event_type)}>
											{event.event_type.replace(/_/g, ' ')}
										</Badge>
										{#if event.actor_id}
											<span class="text-xs text-muted-foreground">by {event.actor_id}</span>
										{/if}
									</div>
									<div class="flex items-center gap-2">
										<span class="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
										{#if event.changes || event.affected_roles || event.metadata}
											<Button
												variant="ghost"
												size="sm"
												onclick={() => toggleEventExpand(event.id)}
											>
												{expandedEventIds.has(event.id) ? 'Hide' : 'Details'}
											</Button>
										{/if}
									</div>
								</div>

								{#if expandedEventIds.has(event.id)}
									<div class="mt-2 space-y-2">
										{#if event.changes}
											<div>
												<p class="text-xs font-medium">Changes:</p>
												<pre class="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">{formatJson(event.changes)}</pre>
											</div>
										{/if}
										{#if event.affected_roles}
											<div>
												<p class="text-xs font-medium">Affected Roles:</p>
												<pre class="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">{formatJson(event.affected_roles)}</pre>
											</div>
										{/if}
										{#if event.metadata}
											<div>
												<p class="text-xs font-medium">Metadata:</p>
												<pre class="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">{formatJson(event.metadata)}</pre>
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
					{#if eventsTotal > events.length}
						<p class="mt-3 text-xs text-muted-foreground">
							Showing {events.length} of {eventsTotal} events.
						</p>
					{/if}
				{/if}
			</CardContent>
		</Card>
	</TabsContent>
</Tabs>
