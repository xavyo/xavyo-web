<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import { invalidateAll } from '$app/navigation';
	import { fetchBirthrightPolicies, fetchLifecycleEvents } from '$lib/api/birthright-client';
	import SimulationPanel from '$lib/components/birthright/simulation-panel.svelte';
	import EventTriggerDialog from '$lib/components/birthright/event-trigger-dialog.svelte';
	import type {
		BirthrightPolicy,
		BirthrightPolicyListResponse,
		LifecycleEvent,
		LifecycleEventListResponse
	} from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let policies = $derived(data.policies);
	let events = $derived(data.events);

	// --- Tab state ---
	const tabs = [
		{ id: 'policies', label: 'Policies' },
		{ id: 'events', label: 'Lifecycle Events' }
	] as const;

	let activeTab: string = $state('policies');

	// --- Policies tab state ---
	let policyStatusFilter: string = $state('');
	let policyData: BirthrightPolicy[] = $state([]);
	let policyTotal: number = $state(0);
	let policyPage: number = $state(0);
	let policyLoading: boolean = $state(false);
	let policyInitialized: boolean = $state(false);
	let showSimulation: boolean = $state(false);

	const policyPageSize = 20;
	let policyPageCount = $derived(Math.ceil(policyTotal / policyPageSize));

	const policyStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'archived', label: 'Archived' }
	];

	// --- Events tab state ---
	let eventTypeFilter: string = $state('');
	let eventProcessedFilter: string = $state('');
	let eventFromDate: string = $state('');
	let eventToDate: string = $state('');
	let eventData: LifecycleEvent[] = $state([]);
	let eventTotal: number = $state(0);
	let eventPage: number = $state(0);
	let eventLoading: boolean = $state(false);
	let eventInitialized: boolean = $state(false);
	let showTriggerDialog: boolean = $state(false);

	const eventPageSize = 20;
	let eventPageCount = $derived(Math.ceil(eventTotal / eventPageSize));

	const eventTypeOptions = [
		{ value: '', label: 'All types' },
		{ value: 'joiner', label: 'Joiner' },
		{ value: 'mover', label: 'Mover' },
		{ value: 'leaver', label: 'Leaver' }
	];

	const eventProcessedOptions = [
		{ value: '', label: 'All' },
		{ value: 'false', label: 'Pending' },
		{ value: 'true', label: 'Processed' }
	];

	// --- Badge helpers ---
	function policyStatusClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'inactive':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'archived':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
		}
	}

	function eventTypeBadgeClass(type: string): string {
		switch (type) {
			case 'joiner':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'mover':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
			case 'leaver':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
		}
	}

	function eventStatusLabel(event: LifecycleEvent): string {
		return event.processed_at ? 'processed' : 'pending';
	}

	function eventStatusClass(event: LifecycleEvent): string {
		return event.processed_at
			? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
			: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
	}

	function truncateId(id: string): string {
		return id.length > 8 ? id.substring(0, 8) + '...' : id;
	}

	// --- Policy fetching ---
	async function loadPolicies() {
		policyLoading = true;
		try {
			const result: BirthrightPolicyListResponse = await fetchBirthrightPolicies({
				status: policyStatusFilter || undefined,
				limit: policyPageSize,
				offset: policyPage * policyPageSize
			});
			policyData = result.items;
			policyTotal = result.total;
			policyInitialized = true;
		} catch {
			addToast('error', 'Failed to load birthright policies');
		} finally {
			policyLoading = false;
		}
	}

	// --- Events fetching ---
	async function loadEvents() {
		eventLoading = true;
		try {
			const result: LifecycleEventListResponse = await fetchLifecycleEvents({
				event_type: eventTypeFilter || undefined,
				processed: eventProcessedFilter !== '' ? eventProcessedFilter === 'true' : undefined,
				from: eventFromDate || undefined,
				to: eventToDate || undefined,
				limit: eventPageSize,
				offset: eventPage * eventPageSize
			});
			eventData = result.items;
			eventTotal = result.total;
			eventInitialized = true;
		} catch {
			addToast('error', 'Failed to load lifecycle events');
		} finally {
			eventLoading = false;
		}
	}

	// --- Reactive data fetching ---
	$effect(() => {
		if (activeTab === 'policies') {
			void policyStatusFilter;
			void policyPage;
			loadPolicies();
		}
	});

	$effect(() => {
		if (activeTab === 'events') {
			void eventTypeFilter;
			void eventProcessedFilter;
			void eventFromDate;
			void eventToDate;
			void eventPage;
			loadEvents();
		}
	});

	// --- Initialize from server data ---
	$effect(() => {
		if (policies.items.length > 0 && !policyInitialized && !policyLoading) {
			policyData = policies.items;
			policyTotal = policies.total;
		}
	});

	$effect(() => {
		if (events.items.length > 0 && !eventInitialized && !eventLoading) {
			eventData = events.items;
			eventTotal = events.total;
		}
	});

	// --- Trigger event callback ---
	async function handleTriggerSuccess() {
		showTriggerDialog = false;
		await invalidateAll();
		loadEvents();
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Birthright Access"
		description="Manage birthright policies and lifecycle events for automated entitlement provisioning"
	/>
</div>

<!-- Tab navigation -->
<div class="border-b border-border" role="tablist" aria-label="Birthright tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<!-- Tab panels -->
<div class="mt-4">
	{#if activeTab === 'policies'}
		<div role="tabpanel" aria-label="Policies">
			<!-- Policies toolbar -->
			<div class="mb-4 flex items-center justify-between">
				<div class="flex gap-3">
					<select
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						bind:value={policyStatusFilter}
						onchange={() => {
							policyPage = 0;
						}}
					>
						{#each policyStatusOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div class="flex gap-2">
					<button
						class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
						onclick={() => (showSimulation = !showSimulation)}
					>
						Simulate All
					</button>
					<a
						href="/governance/birthright/policies/create"
						class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
					>
						Create Policy
					</a>
				</div>
			</div>

			<!-- Simulation panel -->
			{#if showSimulation}
				<div class="mb-6 rounded-lg border border-border p-4">
					<SimulationPanel mode="all" />
				</div>
			{/if}

			<!-- Policies table -->
			{#if policyLoading}
				<div class="space-y-2">
					{#each Array(5) as _}
						<div class="h-12 animate-pulse rounded-lg bg-muted"></div>
					{/each}
				</div>
			{:else if policyData.length === 0}
				<EmptyState
					title="No birthright policies yet"
					description="Create your first policy to automate entitlement provisioning based on user attributes."
					icon="shield"
				/>
				<div class="flex justify-center pb-4">
					<a
						href="/governance/birthright/policies/create"
						class="text-sm font-medium text-primary hover:underline"
					>
						Create your first policy
					</a>
				</div>
			{:else}
				<div class="overflow-x-auto rounded-lg border border-border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Evaluation Mode</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Conditions</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Entitlements</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Grace Period</th>
							</tr>
						</thead>
						<tbody>
							{#each policyData as policy}
								<tr class="border-b border-border last:border-0 hover:bg-muted/30">
									<td class="px-4 py-3">
										<a
											href="/governance/birthright/policies/{policy.id}"
											class="font-medium text-primary hover:underline"
										>
											{policy.name}
										</a>
									</td>
									<td class="px-4 py-3">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {policyStatusClass(policy.status)}"
										>
											{policy.status}
										</span>
									</td>
									<td class="px-4 py-3">{policy.priority}</td>
									<td class="px-4 py-3 capitalize">
										{policy.evaluation_mode.replace('_', ' ')}
									</td>
									<td class="px-4 py-3">{policy.conditions.length}</td>
									<td class="px-4 py-3">{policy.entitlement_ids.length}</td>
									<td class="px-4 py-3">
										{policy.grace_period_days}d
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Policies pagination -->
				{#if policyPageCount > 1}
					<div class="mt-4 flex items-center justify-between">
						<p class="text-sm text-muted-foreground">
							Showing {policyPage * policyPageSize + 1} to {Math.min((policyPage + 1) * policyPageSize, policyTotal)} of {policyTotal}
						</p>
						<div class="flex gap-2">
							<button
								class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
								disabled={policyPage === 0}
								onclick={() => (policyPage = policyPage - 1)}
							>
								Previous
							</button>
							<button
								class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
								disabled={policyPage >= policyPageCount - 1}
								onclick={() => (policyPage = policyPage + 1)}
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{:else if activeTab === 'events'}
		<div role="tabpanel" aria-label="Lifecycle Events">
			<!-- Events toolbar -->
			<div class="mb-4 flex items-center justify-between">
				<div class="flex flex-wrap gap-3">
					<select
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						bind:value={eventTypeFilter}
						onchange={() => {
							eventPage = 0;
						}}
					>
						{#each eventTypeOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
					<select
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						bind:value={eventProcessedFilter}
						onchange={() => {
							eventPage = 0;
						}}
					>
						{#each eventProcessedOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
					<input
						type="date"
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						bind:value={eventFromDate}
						onchange={() => {
							eventPage = 0;
						}}
						placeholder="From date"
					/>
					<input
						type="date"
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						bind:value={eventToDate}
						onchange={() => {
							eventPage = 0;
						}}
						placeholder="To date"
					/>
				</div>
				<button
					class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
					onclick={() => (showTriggerDialog = true)}
				>
					Trigger Event
				</button>
			</div>

			<!-- Events table -->
			{#if eventLoading}
				<div class="space-y-2">
					{#each Array(5) as _}
						<div class="h-12 animate-pulse rounded-lg bg-muted"></div>
					{/each}
				</div>
			{:else if eventData.length === 0}
				<EmptyState
					title="No lifecycle events"
					description="Lifecycle events will appear here when joiner, mover, or leaver events are triggered."
					icon="activity"
				/>
			{:else}
				<div class="overflow-x-auto rounded-lg border border-border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">User ID</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Source</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Detail</th>
							</tr>
						</thead>
						<tbody>
							{#each eventData as event}
								<tr class="border-b border-border last:border-0 hover:bg-muted/30">
									<td class="px-4 py-3 font-mono text-xs">{truncateId(event.user_id)}</td>
									<td class="px-4 py-3">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {eventTypeBadgeClass(event.event_type)}"
										>
											{event.event_type}
										</span>
									</td>
									<td class="px-4 py-3">{event.source}</td>
									<td class="px-4 py-3">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {eventStatusClass(event)}"
										>
											{eventStatusLabel(event)}
										</span>
									</td>
									<td class="px-4 py-3">{new Date(event.created_at).toLocaleDateString()}</td>
									<td class="px-4 py-3">
										<a
											href="/governance/birthright/events/{event.id}"
											class="text-sm font-medium text-primary hover:underline"
										>
											View
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Events pagination -->
				{#if eventPageCount > 1}
					<div class="mt-4 flex items-center justify-between">
						<p class="text-sm text-muted-foreground">
							Showing {eventPage * eventPageSize + 1} to {Math.min((eventPage + 1) * eventPageSize, eventTotal)} of {eventTotal}
						</p>
						<div class="flex gap-2">
							<button
								class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
								disabled={eventPage === 0}
								onclick={() => (eventPage = eventPage - 1)}
							>
								Previous
							</button>
							<button
								class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
								disabled={eventPage >= eventPageCount - 1}
								onclick={() => (eventPage = eventPage + 1)}
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<!-- Event trigger dialog -->
<EventTriggerDialog
	bind:open={showTriggerDialog}
	onclose={() => (showTriggerDialog = false)}
	onsuccess={handleTriggerSuccess}
/>
