<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import RiskSummaryCard from '$lib/components/governance/risk-summary-card.svelte';
	import SodViolationList from '$lib/components/governance/sod-violation-list.svelte';
	import type {
		EntitlementResponse,
		EntitlementListResponse,
		AccessRequestResponse,
		AccessRequestListResponse,
		SodRuleResponse,
		SodRuleListResponse,
		SodViolationResponse,
		SodViolationListResponse,
		CertificationCampaignResponse,
		CertificationCampaignListResponse,
		RiskScoreResponse,
		RiskScoreListResponse,
		RiskScoreSummary
	} from '$lib/api/types';
	import EntitlementNameLink from './entitlement-name-link.svelte';
	import AccessRequestLink from './access-request-link.svelte';
	import SodRuleLink from './sod-rule-link.svelte';
	import CampaignLink from './campaign-link.svelte';
	import RiskLevelBadge from './risk-level-badge.svelte';
	import ClassificationBadge from './classification-badge.svelte';
	import StatusBadge from './status-badge.svelte';

	// Tabs
	const tabs = [
		{ id: 'entitlements', label: 'Entitlements' },
		{ id: 'access-requests', label: 'Access Requests' },
		{ id: 'sod', label: 'SoD Rules' },
		{ id: 'certifications', label: 'Certifications' },
		{ id: 'risk', label: 'Risk' }
	];

	let activeTab: string = $state('entitlements');

	// === Entitlements tab ===
	const entColumnHelper = createColumnHelper<EntitlementResponse>();
	const entColumns = [
		entColumnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(EntitlementNameLink, { name: info.getValue(), id: info.row.original.id })
		}),
		entColumnHelper.accessor('risk_level', {
			header: 'Risk Level',
			cell: (info) => renderComponent(RiskLevelBadge, { level: info.getValue() })
		}),
		entColumnHelper.accessor('data_protection_classification', {
			header: 'Classification',
			cell: (info) => renderComponent(ClassificationBadge, { classification: info.getValue() })
		}),
		entColumnHelper.accessor('status', {
			header: 'Status',
			cell: (info) => renderComponent(StatusBadge, { status: info.getValue() })
		}),
		entColumnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<EntitlementResponse>[];

	let entData: EntitlementResponse[] = $state([]);
	let entPageCount: number = $state(0);
	let entPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let entLoading: boolean = $state(false);
	let riskLevelFilter: string = $state('');
	let classificationFilter: string = $state('');
	let entHasFilters = $derived(riskLevelFilter !== '' || classificationFilter !== '');

	const riskLevelOptions = [
		{ value: '', label: 'All risk levels' },
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
		{ value: 'critical', label: 'Critical' }
	];
	const classificationOptions = [
		{ value: '', label: 'All classifications' },
		{ value: 'none', label: 'None' },
		{ value: 'personal', label: 'Personal Data' },
		{ value: 'sensitive', label: 'Sensitive Data' },
		{ value: 'special_category', label: 'Special Category' }
	];

	async function fetchEntitlements() {
		entLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(entPagination.pageIndex * entPagination.pageSize),
				limit: String(entPagination.pageSize)
			});
			if (riskLevelFilter) params.set('risk_level', riskLevelFilter);
			if (classificationFilter) params.set('classification', classificationFilter);
			const response = await fetch(`/api/governance/entitlements?${params}`);
			if (!response.ok) throw new Error('Failed to fetch');
			const result: EntitlementListResponse = await response.json();
			entData = result.items;
			entPageCount = Math.ceil(result.total / entPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load entitlements');
		} finally {
			entLoading = false;
		}
	}

	function handleEntPaginationChange(updater: Updater<PaginationState>) {
		entPagination = typeof updater === 'function' ? updater(entPagination) : updater;
	}

	// === Access Requests tab ===
	const arColumnHelper = createColumnHelper<AccessRequestResponse>();
	const arColumns = [
		arColumnHelper.accessor('id', {
			header: 'Request',
			cell: (info) =>
				renderComponent(AccessRequestLink, { id: info.getValue() })
		}),
		arColumnHelper.accessor('entitlement_id', {
			header: 'Entitlement',
			cell: (info) => {
				const val = info.getValue();
				return val.substring(0, 8) + '...';
			}
		}),
		arColumnHelper.accessor('status', {
			header: 'Status',
			cell: (info) => renderComponent(StatusBadge, { status: info.getValue() })
		}),
		arColumnHelper.accessor('justification', {
			header: 'Justification',
			cell: (info) => {
				const val = info.getValue();
				return val.length > 50 ? val.substring(0, 50) + '...' : val;
			}
		}),
		arColumnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<AccessRequestResponse>[];

	let arData: AccessRequestResponse[] = $state([]);
	let arPageCount: number = $state(0);
	let arPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let arLoading: boolean = $state(false);
	let arStatusFilter: string = $state('');

	const arStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'pending_approval', label: 'Pending Approval' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'rejected', label: 'Rejected' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	async function fetchAccessRequests() {
		arLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(arPagination.pageIndex * arPagination.pageSize),
				limit: String(arPagination.pageSize)
			});
			if (arStatusFilter) params.set('status', arStatusFilter);
			const response = await fetch(`/api/governance/access-requests?${params}`);
			if (!response.ok) throw new Error('Failed to fetch');
			const result: AccessRequestListResponse = await response.json();
			arData = result.items;
			arPageCount = Math.ceil(result.total / arPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load access requests');
		} finally {
			arLoading = false;
		}
	}

	function handleArPaginationChange(updater: Updater<PaginationState>) {
		arPagination = typeof updater === 'function' ? updater(arPagination) : updater;
	}

	// === SoD tab ===
	const sodColumnHelper = createColumnHelper<SodRuleResponse>();
	const sodColumns = [
		sodColumnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(SodRuleLink, { name: info.getValue(), id: info.row.original.id })
		}),
		sodColumnHelper.accessor('severity', {
			header: 'Severity',
			cell: (info) => renderComponent(RiskLevelBadge, { level: info.getValue() })
		}),
		sodColumnHelper.accessor('status', {
			header: 'Status',
			cell: (info) => renderComponent(StatusBadge, { status: info.getValue() })
		}),
		sodColumnHelper.accessor('first_entitlement_id', {
			header: 'First Entitlement',
			cell: (info) => info.getValue().substring(0, 8) + '...'
		}),
		sodColumnHelper.accessor('second_entitlement_id', {
			header: 'Second Entitlement',
			cell: (info) => info.getValue().substring(0, 8) + '...'
		})
	] as ColumnDef<SodRuleResponse>[];

	let sodData: SodRuleResponse[] = $state([]);
	let sodPageCount: number = $state(0);
	let sodPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let sodLoading: boolean = $state(false);
	let sodSeverityFilter: string = $state('');

	let sodSubTab: string = $state('rules');
	let violations: SodViolationResponse[] = $state([]);
	let violationsLoading: boolean = $state(false);

	async function fetchSodRules() {
		sodLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(sodPagination.pageIndex * sodPagination.pageSize),
				limit: String(sodPagination.pageSize)
			});
			if (sodSeverityFilter) params.set('severity', sodSeverityFilter);
			const response = await fetch(`/api/governance/sod-rules?${params}`);
			if (!response.ok) throw new Error('Failed to fetch');
			const result: SodRuleListResponse = await response.json();
			sodData = result.items;
			sodPageCount = Math.ceil(result.total / sodPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load SoD rules');
		} finally {
			sodLoading = false;
		}
	}

	async function fetchViolations() {
		violationsLoading = true;
		try {
			const response = await fetch('/api/governance/sod-violations?limit=100');
			if (!response.ok) throw new Error('Failed to fetch');
			const result: SodViolationListResponse = await response.json();
			violations = result.items;
		} catch {
			addToast('error', 'Failed to load SoD violations');
		} finally {
			violationsLoading = false;
		}
	}

	function handleSodPaginationChange(updater: Updater<PaginationState>) {
		sodPagination = typeof updater === 'function' ? updater(sodPagination) : updater;
	}

	// === Certifications tab ===
	const campColumnHelper = createColumnHelper<CertificationCampaignResponse>();
	const campColumns = [
		campColumnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(CampaignLink, { name: info.getValue(), id: info.row.original.id })
		}),
		campColumnHelper.accessor('status', {
			header: 'Status',
			cell: (info) => renderComponent(StatusBadge, { status: info.getValue() })
		}),
		campColumnHelper.accessor('scope_type', {
			header: 'Scope',
			cell: (info) => {
				const labels: Record<string, string> = {
					all_users: 'All Users',
					department: 'Department',
					application: 'Application',
					entitlement: 'Entitlement'
				};
				return labels[info.getValue()] ?? info.getValue();
			}
		}),
		campColumnHelper.accessor('deadline', {
			header: 'Deadline',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		}),
		campColumnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<CertificationCampaignResponse>[];

	let campData: CertificationCampaignResponse[] = $state([]);
	let campPageCount: number = $state(0);
	let campPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let campLoading: boolean = $state(false);
	let campStatusFilter: string = $state('');

	const campStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'active', label: 'Active' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' },
		{ value: 'overdue', label: 'Overdue' }
	];

	async function fetchCampaigns() {
		campLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(campPagination.pageIndex * campPagination.pageSize),
				limit: String(campPagination.pageSize)
			});
			if (campStatusFilter) params.set('status', campStatusFilter);
			const response = await fetch(`/api/governance/certification-campaigns?${params}`);
			if (!response.ok) throw new Error('Failed to fetch');
			const result: CertificationCampaignListResponse = await response.json();
			campData = result.items;
			campPageCount = Math.ceil(result.total / campPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load campaigns');
		} finally {
			campLoading = false;
		}
	}

	function handleCampPaginationChange(updater: Updater<PaginationState>) {
		campPagination = typeof updater === 'function' ? updater(campPagination) : updater;
	}

	// === Risk tab ===
	const riskColumnHelper = createColumnHelper<RiskScoreResponse>();
	const riskColumns = [
		riskColumnHelper.accessor('user_id', {
			header: 'User',
			cell: (info) => info.getValue().substring(0, 8) + '...'
		}),
		riskColumnHelper.accessor('total_score', {
			header: 'Score',
			cell: (info) => String(info.getValue())
		}),
		riskColumnHelper.accessor('risk_level', {
			header: 'Risk Level',
			cell: (info) => renderComponent(RiskLevelBadge, { level: info.getValue() })
		}),
		riskColumnHelper.accessor('calculated_at', {
			header: 'Calculated',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<RiskScoreResponse>[];

	let riskData: RiskScoreResponse[] = $state([]);
	let riskPageCount: number = $state(0);
	let riskPagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let riskLoading: boolean = $state(false);
	let riskSummary: RiskScoreSummary | null = $state(null);
	let riskSummaryLoading: boolean = $state(false);

	async function fetchRiskScores() {
		riskLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(riskPagination.pageIndex * riskPagination.pageSize),
				limit: String(riskPagination.pageSize),
				sort_by: 'score_desc'
			});
			const response = await fetch(`/api/governance/risk/scores?${params}`);
			if (!response.ok) throw new Error('Failed to fetch');
			const result: RiskScoreListResponse = await response.json();
			riskData = result.items;
			riskPageCount = Math.ceil(result.total / riskPagination.pageSize);
		} catch {
			addToast('error', 'Failed to load risk scores');
		} finally {
			riskLoading = false;
		}
	}

	async function fetchRiskSummary() {
		riskSummaryLoading = true;
		try {
			const response = await fetch('/api/governance/risk/scores/summary');
			if (!response.ok) throw new Error('Failed to fetch');
			riskSummary = await response.json();
		} catch {
			addToast('error', 'Failed to load risk summary');
		} finally {
			riskSummaryLoading = false;
		}
	}

	function handleRiskPaginationChange(updater: Updater<PaginationState>) {
		riskPagination = typeof updater === 'function' ? updater(riskPagination) : updater;
	}

	// === Reactive data fetching ===
	$effect(() => {
		if (activeTab === 'entitlements') {
			void entPagination;
			void riskLevelFilter;
			void classificationFilter;
			fetchEntitlements();
		}
	});

	$effect(() => {
		if (activeTab === 'access-requests') {
			void arPagination;
			void arStatusFilter;
			fetchAccessRequests();
		}
	});

	$effect(() => {
		if (activeTab === 'sod' && sodSubTab === 'rules') {
			void sodPagination;
			void sodSeverityFilter;
			fetchSodRules();
		}
	});

	$effect(() => {
		if (activeTab === 'sod' && sodSubTab === 'violations') {
			fetchViolations();
		}
	});

	$effect(() => {
		if (activeTab === 'certifications') {
			void campPagination;
			void campStatusFilter;
			fetchCampaigns();
		}
	});

	$effect(() => {
		if (activeTab === 'risk') {
			void riskPagination;
			fetchRiskScores();
			fetchRiskSummary();
		}
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Governance"
		description="Manage entitlements, access requests, SoD rules, certifications, and risk"
	/>
</div>

<!-- Tab navigation -->
<div class="border-b border-border">
	<nav class="-mb-px flex gap-4" aria-label="Tabs">
		{#each tabs as tab}
			<button
				class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</nav>
</div>

<!-- Tab content -->
<div class="mt-4">
	{#if activeTab === 'entitlements'}
		<div class="mb-4 flex items-center justify-between">
			<div class="flex gap-3">
				<select
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					bind:value={riskLevelFilter}
					onchange={() => { entPagination = { ...entPagination, pageIndex: 0 }; }}
				>
					{#each riskLevelOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
				<select
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					bind:value={classificationFilter}
					onchange={() => { entPagination = { ...entPagination, pageIndex: 0 }; }}
				>
					{#each classificationOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<a
				href="/governance/entitlements/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create Entitlement
			</a>
		</div>

		{#snippet entEmptyState()}
			{#if entHasFilters}
				<EmptyState title="No entitlements match your filters" description="Try adjusting your filter criteria." icon="🔍" />
				<div class="flex justify-center pb-4">
					<button onclick={() => { riskLevelFilter = ''; classificationFilter = ''; }} class="text-sm font-medium text-primary hover:underline">Clear filters</button>
				</div>
			{:else}
				<EmptyState title="No entitlements yet" description="Create your first entitlement to define access rights." icon="🛡️" />
			{/if}
		{/snippet}

		<DataTable columns={entColumns} data={entData} pageCount={entPageCount} pagination={entPagination} onPaginationChange={handleEntPaginationChange} isLoading={entLoading} emptyState={entEmptyState} />

	{:else if activeTab === 'access-requests'}
		<div class="mb-4 flex items-center justify-between">
			<div class="flex gap-3">
				<select
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					bind:value={arStatusFilter}
					onchange={() => { arPagination = { ...arPagination, pageIndex: 0 }; }}
				>
					{#each arStatusOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</div>

		{#snippet arEmptyState()}
			<EmptyState title="No access requests" description="Access requests from users will appear here." icon="📋" />
		{/snippet}

		<DataTable columns={arColumns} data={arData} pageCount={arPageCount} pagination={arPagination} onPaginationChange={handleArPaginationChange} isLoading={arLoading} emptyState={arEmptyState} />

	{:else if activeTab === 'sod'}
		<div class="mb-4 flex items-center justify-between">
			<div class="flex gap-3">
				<button
					class="rounded-md px-3 py-1.5 text-sm font-medium {sodSubTab === 'rules' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}"
					onclick={() => (sodSubTab = 'rules')}
				>
					Rules
				</button>
				<button
					class="rounded-md px-3 py-1.5 text-sm font-medium {sodSubTab === 'violations' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}"
					onclick={() => (sodSubTab = 'violations')}
				>
					Violations
				</button>
				{#if sodSubTab === 'rules'}
					<select
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						bind:value={sodSeverityFilter}
						onchange={() => { sodPagination = { ...sodPagination, pageIndex: 0 }; }}
					>
						{#each riskLevelOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				{/if}
			</div>
			{#if sodSubTab === 'rules'}
				<a
					href="/governance/sod/create"
					class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
				>
					Create SoD Rule
				</a>
			{/if}
		</div>

		{#if sodSubTab === 'rules'}
			{#snippet sodEmptyState()}
				<EmptyState title="No SoD rules yet" description="Create rules to define incompatible entitlement pairs." icon="⚖️" />
			{/snippet}
			<DataTable columns={sodColumns} data={sodData} pageCount={sodPageCount} pagination={sodPagination} onPaginationChange={handleSodPaginationChange} isLoading={sodLoading} emptyState={sodEmptyState} />
		{:else}
			<SodViolationList {violations} isLoading={violationsLoading} />
		{/if}

	{:else if activeTab === 'certifications'}
		<div class="mb-4 flex items-center justify-between">
			<div class="flex gap-3">
				<select
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					bind:value={campStatusFilter}
					onchange={() => { campPagination = { ...campPagination, pageIndex: 0 }; }}
				>
					{#each campStatusOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<a
				href="/governance/certifications/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create Campaign
			</a>
		</div>

		{#snippet campEmptyState()}
			<EmptyState title="No certification campaigns" description="Create a campaign to review user access." icon="📝" />
		{/snippet}

		<DataTable columns={campColumns} data={campData} pageCount={campPageCount} pagination={campPagination} onPaginationChange={handleCampPaginationChange} isLoading={campLoading} emptyState={campEmptyState} />

	{:else if activeTab === 'risk'}
		{#if riskSummary}
			<div class="mb-6">
				<RiskSummaryCard summary={riskSummary} />
			</div>
		{:else if riskSummaryLoading}
			<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
				{#each Array(4) as _}
					<div class="h-24 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
		{/if}

		<h3 class="mb-3 text-lg font-semibold">Top Risk Users</h3>

		{#snippet riskEmptyState()}
			<EmptyState title="No risk scores" description="Risk scores will appear when users have entitlements." icon="📊" />
		{/snippet}

		<DataTable columns={riskColumns} data={riskData} pageCount={riskPageCount} pagination={riskPagination} onPaginationChange={handleRiskPaginationChange} isLoading={riskLoading} emptyState={riskEmptyState} />
	{/if}
</div>
