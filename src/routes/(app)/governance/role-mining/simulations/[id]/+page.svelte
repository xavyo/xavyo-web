<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SimulationStatusBadge from '$lib/components/role-mining/simulation-status-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import {
		executeSimulationClient,
		applySimulationClient,
		cancelSimulationClient
	} from '$lib/api/role-mining-client';
	import {
		Play,
		CheckCircle,
		XCircle,
		Users,
		ShieldPlus,
		ShieldMinus
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let simulation = $derived(data.simulation);

	let actionLoading = $state(false);

	const isDraft = $derived(simulation.status === 'draft');
	const isExecuted = $derived(simulation.status === 'executed');
	const isApplied = $derived(simulation.status === 'applied');
	const isCancelled = $derived(simulation.status === 'cancelled');
	const isReadOnly = $derived(isApplied || isCancelled);

	const scenarioTypeLabels: Record<string, string> = {
		add_entitlement: 'Add Entitlement',
		remove_entitlement: 'Remove Entitlement',
		add_role: 'Add Role',
		remove_role: 'Remove Role',
		modify_role: 'Modify Role'
	};

	function formatDate(val: string | null): string {
		if (!val) return '--';
		const d = new Date(val);
		if (isNaN(d.getTime())) return '--';
		return d.toLocaleString();
	}

	function formatJson(val: unknown): string {
		if (val === null || val === undefined) return 'None';
		try {
			return JSON.stringify(val, null, 2);
		} catch {
			return String(val);
		}
	}

	async function handleExecute() {
		actionLoading = true;
		try {
			await executeSimulationClient(simulation.id);
			addToast('success', 'Simulation executed successfully');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to execute simulation');
		} finally {
			actionLoading = false;
		}
	}

	async function handleApply() {
		actionLoading = true;
		try {
			await applySimulationClient(simulation.id);
			addToast('success', 'Simulation applied successfully');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to apply simulation');
		} finally {
			actionLoading = false;
		}
	}

	async function handleCancel() {
		actionLoading = true;
		try {
			await cancelSimulationClient(simulation.id);
			addToast('success', 'Simulation cancelled');
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to cancel simulation');
		} finally {
			actionLoading = false;
		}
	}
</script>

<div class="flex items-center gap-2 mb-2">
	<a
		href="/governance/role-mining?tab=simulations"
		class="text-sm text-muted-foreground hover:underline">&larr; Back to Simulations</a
	>
</div>

<PageHeader title={simulation.name} />

<!-- Simulation Info -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-lg font-semibold">Simulation Information</h2>
	</CardHeader>
	<CardContent>
		<div class="flex flex-wrap gap-6 text-sm">
			<div>
				<span class="text-muted-foreground">Status</span>
				<div class="mt-1">
					<SimulationStatusBadge status={simulation.status} />
				</div>
			</div>
			<div>
				<span class="text-muted-foreground">Scenario Type</span>
				<p class="mt-1 font-medium">
					{scenarioTypeLabels[simulation.scenario_type] ?? simulation.scenario_type}
				</p>
			</div>
			{#if simulation.target_role_id}
				<div>
					<span class="text-muted-foreground">Target Role ID</span>
					<p class="mt-1 font-mono text-xs font-medium">{simulation.target_role_id}</p>
				</div>
			{/if}
			<div>
				<span class="text-muted-foreground">Created</span>
				<p class="mt-1 font-medium">{formatDate(simulation.created_at)}</p>
			</div>
			<div>
				<span class="text-muted-foreground">Created By</span>
				<p class="mt-1 font-mono text-xs font-medium">{simulation.created_by}</p>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Changes -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-lg font-semibold">Changes</h2>
	</CardHeader>
	<CardContent>
		{#if simulation.changes && Object.keys(simulation.changes).length > 0}
			<dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
				{#if simulation.changes.change_type}
					<div>
						<dt class="text-muted-foreground">Change Type</dt>
						<dd class="mt-0.5 font-medium">{simulation.changes.change_type}</dd>
					</div>
				{/if}
				{#if simulation.changes.role_id}
					<div>
						<dt class="text-muted-foreground">Role ID</dt>
						<dd class="mt-0.5 font-mono text-xs font-medium">{simulation.changes.role_id}</dd>
					</div>
				{/if}
				{#if simulation.changes.entitlement_id}
					<div>
						<dt class="text-muted-foreground">Entitlement ID</dt>
						<dd class="mt-0.5 font-mono text-xs font-medium">
							{simulation.changes.entitlement_id}
						</dd>
					</div>
				{/if}
				{#if simulation.changes.entitlement_ids && simulation.changes.entitlement_ids.length > 0}
					<div class="sm:col-span-2">
						<dt class="text-muted-foreground">Entitlement IDs</dt>
						<dd class="mt-0.5">
							<div class="flex flex-wrap gap-1">
								{#each simulation.changes.entitlement_ids as eid}
									<span
										class="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800"
										>{eid}</span
									>
								{/each}
							</div>
						</dd>
					</div>
				{/if}
				{#if simulation.changes.user_ids && simulation.changes.user_ids.length > 0}
					<div class="sm:col-span-2">
						<dt class="text-muted-foreground">User IDs</dt>
						<dd class="mt-0.5">
							<div class="flex flex-wrap gap-1">
								{#each simulation.changes.user_ids as uid}
									<span
										class="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800"
										>{uid}</span
									>
								{/each}
							</div>
						</dd>
					</div>
				{/if}
				{#if simulation.changes.role_name}
					<div>
						<dt class="text-muted-foreground">Role Name</dt>
						<dd class="mt-0.5 font-medium">{simulation.changes.role_name}</dd>
					</div>
				{/if}
				{#if simulation.changes.role_description}
					<div>
						<dt class="text-muted-foreground">Role Description</dt>
						<dd class="mt-0.5 font-medium">{simulation.changes.role_description}</dd>
					</div>
				{/if}
			</dl>
		{:else}
			<p class="text-sm text-muted-foreground">No changes defined.</p>
		{/if}
	</CardContent>
</Card>

<!-- Impact (executed or applied) -->
{#if isExecuted || isApplied}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-lg font-semibold">Impact Analysis</h2>
		</CardHeader>
		<CardContent>
			<div class="mb-4 flex items-center gap-2 text-sm">
				<Users class="h-4 w-4 text-muted-foreground" />
				<span class="text-muted-foreground">Affected Users:</span>
				<span class="font-bold">{simulation.affected_users?.length ?? 0}</span>
			</div>

			{#if simulation.affected_users && simulation.affected_users.length > 0}
				<div class="mb-4">
					<p class="mb-1 text-xs font-medium text-muted-foreground">User IDs</p>
					<div class="flex flex-wrap gap-1">
						{#each simulation.affected_users.slice(0, 20) as uid}
							<span
								class="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800"
								>{uid}</span
							>
						{/each}
						{#if simulation.affected_users.length > 20}
							<span class="text-xs text-muted-foreground"
								>...and {simulation.affected_users.length - 20} more</span
							>
						{/if}
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<div class="mb-2 flex items-center gap-1.5">
						<ShieldPlus class="h-4 w-4 text-green-600 dark:text-green-400" />
						<h3 class="text-sm font-semibold">Access Gained</h3>
					</div>
					<pre
						class="max-h-60 overflow-auto rounded-md border bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-900">{formatJson(
							simulation.access_gained
						)}</pre>
				</div>
				<div>
					<div class="mb-2 flex items-center gap-1.5">
						<ShieldMinus class="h-4 w-4 text-red-600 dark:text-red-400" />
						<h3 class="text-sm font-semibold">Access Lost</h3>
					</div>
					<pre
						class="max-h-60 overflow-auto rounded-md border bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-900">{formatJson(
							simulation.access_lost
						)}</pre>
				</div>
			</div>
		</CardContent>
	</Card>
{/if}

<!-- Applied Info -->
{#if isApplied}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-lg font-semibold">Applied Information</h2>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-6 text-sm">
				<div>
					<span class="text-muted-foreground">Applied By</span>
					<p class="mt-1 font-mono text-xs font-medium">
						{simulation.applied_by ?? '--'}
					</p>
				</div>
				<div>
					<span class="text-muted-foreground">Applied At</span>
					<p class="mt-1 font-medium">{formatDate(simulation.applied_at)}</p>
				</div>
			</div>
		</CardContent>
	</Card>
{/if}

<!-- Actions -->
{#if !isReadOnly}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-lg font-semibold">Actions</h2>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-2">
				{#if isDraft}
					<Button variant="default" disabled={actionLoading} onclick={handleExecute}>
						<Play class="mr-1.5 h-4 w-4" />
						Execute
					</Button>
					<Button variant="destructive" disabled={actionLoading} onclick={handleCancel}>
						<XCircle class="mr-1.5 h-4 w-4" />
						Cancel
					</Button>
				{/if}

				{#if isExecuted}
					<Button variant="default" disabled={actionLoading} onclick={handleApply}>
						<CheckCircle class="mr-1.5 h-4 w-4" />
						Apply
					</Button>
					<Button variant="destructive" disabled={actionLoading} onclick={handleCancel}>
						<XCircle class="mr-1.5 h-4 w-4" />
						Cancel
					</Button>
				{/if}
			</div>
		</CardContent>
	</Card>
{/if}
