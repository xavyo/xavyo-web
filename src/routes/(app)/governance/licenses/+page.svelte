<script lang="ts">
	import type {
		LicensePool,
		LicenseAssignment,
		LicenseAssignmentListResponse,
		LicenseDashboardResponse,
		LicenseRecommendation,
		ExpiringLicensesResponse,
		ReclamationRule,
		ReclamationRuleListResponse,
		LicenseIncompatibility,
		LicenseIncompatibilityListResponse,
		LicenseEntitlementLink,
		LicenseEntitlementLinkListResponse,
		ComplianceReport,
		LicenseAuditEntry,
		LicenseAuditTrailResponse
	} from '$lib/api/types';
	import {
		fetchLicensePools,
		fetchLicenseAssignments,
		deallocateAssignmentClient,
		fetchLicenseDashboard,
		fetchLicenseRecommendations,
		fetchExpiringPools,
		fetchReclamationRules,
		deleteRuleClient,
		fetchLicenseIncompatibilities,
		deleteIncompatibilityClient,
		fetchEntitlementLinks,
		deleteEntitlementLinkClient,
		toggleEntitlementLinkClient,
		generateComplianceReportClient,
		fetchLicenseAuditTrail,
		deletePoolClient,
		archivePoolClient
	} from '$lib/api/licenses-client';
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tabs = [
		{ id: 'pools', label: 'Pools' },
		{ id: 'assignments', label: 'Assignments' },
		{ id: 'analytics', label: 'Analytics' },
		{ id: 'reclamation-rules', label: 'Reclamation Rules' },
		{ id: 'incompatibilities', label: 'Incompatibilities' },
		{ id: 'entitlement-links', label: 'Entitlement Links' },
		{ id: 'compliance', label: 'Compliance' }
	];

	// Read initial tab from URL
	let activeTab = $state($page.url.searchParams.get('tab') || 'pools');

	// Server-loaded pools data
	let pools = $derived(data.pools);

	// Pool name lookup from server-loaded data
	let poolNameMap = $derived(
		new Map(pools.items.map((p: LicensePool) => [p.id, p.name]))
	);

	function resolvePoolName(poolId: string): string {
		return poolNameMap.get(poolId) ?? poolId.slice(0, 8);
	}

	// --- Assignments tab ---
	let assignments: LicenseAssignment[] = $state([]);
	let assignmentsTotal = $state(0);
	let assignmentsLoaded = $state(false);
	let assignmentsLoading = $state(false);
	let assignPoolFilter = $state('');
	let assignStatusFilter = $state('');

	// --- Analytics tab ---
	let dashboard: LicenseDashboardResponse | null = $state(null);
	let recommendations: LicenseRecommendation[] = $state([]);
	let expiringData: ExpiringLicensesResponse | null = $state(null);
	let analyticsLoaded = $state(false);
	let analyticsLoading = $state(false);

	// --- Reclamation Rules tab ---
	let rules: ReclamationRule[] = $state([]);
	let rulesTotal = $state(0);
	let rulesLoaded = $state(false);
	let rulesLoading = $state(false);

	// --- Incompatibilities tab ---
	let incompatibilities: LicenseIncompatibility[] = $state([]);
	let incompatTotal = $state(0);
	let incompatLoaded = $state(false);
	let incompatLoading = $state(false);

	// --- Entitlement Links tab ---
	let links: LicenseEntitlementLink[] = $state([]);
	let linksTotal = $state(0);
	let linksLoaded = $state(false);
	let linksLoading = $state(false);

	// --- Compliance tab ---
	let complianceReport: ComplianceReport | null = $state(null);
	let complianceLoading = $state(false);
	let auditTrail: LicenseAuditEntry[] = $state([]);
	let auditTotal = $state(0);
	let auditLoaded = $state(false);
	let auditLoading = $state(false);
	let auditPoolFilter = $state('');
	let auditActionFilter = $state('');
	let compVendorFilter = $state('');
	let compFromDate = $state('');
	let compToDate = $state('');

	// Delete confirmation
	let showDeleteDialog = $state(false);
	let deleteTarget: { id: string; name: string; type: string } | null = $state(null);

	// --- Lazy-load on tab switch ---
	$effect(() => {
		if (activeTab === 'assignments' && !assignmentsLoaded && !assignmentsLoading) {
			loadAssignments();
		}
	});

	$effect(() => {
		if (activeTab === 'analytics' && !analyticsLoaded && !analyticsLoading) {
			loadAnalytics();
		}
	});

	$effect(() => {
		if (activeTab === 'reclamation-rules' && !rulesLoaded && !rulesLoading) {
			loadRules();
		}
	});

	$effect(() => {
		if (activeTab === 'incompatibilities' && !incompatLoaded && !incompatLoading) {
			loadIncompatibilities();
		}
	});

	$effect(() => {
		if (activeTab === 'entitlement-links' && !linksLoaded && !linksLoading) {
			loadLinks();
		}
	});

	$effect(() => {
		if (activeTab === 'compliance' && !auditLoaded && !auditLoading) {
			loadAuditTrail();
		}
	});

	// --- Data loaders ---

	async function loadAssignments() {
		assignmentsLoading = true;
		try {
			const params: Record<string, string> = {};
			if (assignPoolFilter) params.license_pool_id = assignPoolFilter;
			if (assignStatusFilter) params.status = assignStatusFilter;
			const res: LicenseAssignmentListResponse = await fetchLicenseAssignments(params);
			assignments = res.items;
			assignmentsTotal = res.total;
			assignmentsLoaded = true;
		} catch {
			addToast('error', 'Failed to load assignments');
		} finally {
			assignmentsLoading = false;
		}
	}

	async function loadAnalytics() {
		analyticsLoading = true;
		try {
			const [dash, recs, expiring] = await Promise.all([
				fetchLicenseDashboard(),
				fetchLicenseRecommendations(),
				fetchExpiringPools()
			]);
			dashboard = dash;
			recommendations = recs;
			expiringData = expiring;
			analyticsLoaded = true;
		} catch {
			addToast('error', 'Failed to load analytics');
		} finally {
			analyticsLoading = false;
		}
	}

	async function loadRules() {
		rulesLoading = true;
		try {
			const res: ReclamationRuleListResponse = await fetchReclamationRules({});
			rules = res.items;
			rulesTotal = res.total;
			rulesLoaded = true;
		} catch {
			addToast('error', 'Failed to load reclamation rules');
		} finally {
			rulesLoading = false;
		}
	}

	async function loadIncompatibilities() {
		incompatLoading = true;
		try {
			const res: LicenseIncompatibilityListResponse = await fetchLicenseIncompatibilities({});
			incompatibilities = res.items;
			incompatTotal = res.total;
			incompatLoaded = true;
		} catch {
			addToast('error', 'Failed to load incompatibilities');
		} finally {
			incompatLoading = false;
		}
	}

	async function loadLinks() {
		linksLoading = true;
		try {
			const res: LicenseEntitlementLinkListResponse = await fetchEntitlementLinks({});
			links = res.items;
			linksTotal = res.total;
			linksLoaded = true;
		} catch {
			addToast('error', 'Failed to load entitlement links');
		} finally {
			linksLoading = false;
		}
	}

	async function loadAuditTrail() {
		auditLoading = true;
		try {
			const params: Record<string, string> = {};
			if (auditPoolFilter) params.pool_id = auditPoolFilter;
			if (auditActionFilter) params.action = auditActionFilter;
			const res: LicenseAuditTrailResponse = await fetchLicenseAuditTrail(params);
			auditTrail = res.items;
			auditTotal = res.total;
			auditLoaded = true;
		} catch {
			addToast('error', 'Failed to load audit trail');
		} finally {
			auditLoading = false;
		}
	}

	// --- Actions ---

	async function handleDeallocate(id: string) {
		try {
			await deallocateAssignmentClient(id);
			assignments = assignments.filter((a) => a.id !== id);
			addToast('success', 'License deallocated');
		} catch {
			addToast('error', 'Failed to deallocate');
		}
	}

	async function handleDeletePool(id: string) {
		try {
			await deletePoolClient(id);
			addToast('success', 'Pool deleted');
			// Reload pools via page refresh
			window.location.href = '/governance/licenses';
		} catch {
			addToast('error', 'Failed to delete pool');
		}
	}

	async function handleArchivePool(id: string) {
		try {
			await archivePoolClient(id);
			addToast('success', 'Pool archived');
			window.location.href = '/governance/licenses';
		} catch {
			addToast('error', 'Failed to archive pool');
		}
	}

	async function handleDeleteRule(id: string) {
		try {
			await deleteRuleClient(id);
			rules = rules.filter((r) => r.id !== id);
			addToast('success', 'Rule deleted');
		} catch {
			addToast('error', 'Failed to delete rule');
		}
	}

	async function handleDeleteIncompat(id: string) {
		try {
			await deleteIncompatibilityClient(id);
			incompatibilities = incompatibilities.filter((i) => i.id !== id);
			addToast('success', 'Incompatibility deleted');
		} catch {
			addToast('error', 'Failed to delete');
		}
	}

	async function handleDeleteLink(id: string) {
		try {
			await deleteEntitlementLinkClient(id);
			links = links.filter((l) => l.id !== id);
			addToast('success', 'Link deleted');
		} catch {
			addToast('error', 'Failed to delete');
		}
	}

	async function handleToggleLink(id: string, enabled: boolean) {
		try {
			const updated = await toggleEntitlementLinkClient(id, enabled);
			links = links.map((l) => (l.id === id ? updated : l));
			addToast('success', enabled ? 'Link enabled' : 'Link disabled');
		} catch {
			addToast('error', 'Failed to toggle link');
		}
	}

	async function handleGenerateReport() {
		complianceLoading = true;
		try {
			const body: Record<string, string> = {};
			if (compVendorFilter) body.vendor = compVendorFilter;
			if (compFromDate) body.from_date = compFromDate;
			if (compToDate) body.to_date = compToDate;
			complianceReport = await generateComplianceReportClient(
				Object.keys(body).length > 0 ? body : undefined
			);
			addToast('success', 'Report generated');
		} catch {
			addToast('error', 'Failed to generate report');
		} finally {
			complianceLoading = false;
		}
	}

	function confirmDelete(id: string, name: string, type: string) {
		deleteTarget = { id, name, type };
		showDeleteDialog = true;
	}

	async function executeDelete() {
		if (!deleteTarget) return;
		const { id, type } = deleteTarget;
		showDeleteDialog = false;
		if (type === 'pool') await handleDeletePool(id);
		else if (type === 'rule') await handleDeleteRule(id);
		else if (type === 'incompatibility') await handleDeleteIncompat(id);
		else if (type === 'link') await handleDeleteLink(id);
		deleteTarget = null;
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'expired':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'archived':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
			case 'reclaimed':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'released':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
		}
	}

	function displayLabel(value: string): string {
		const labels: Record<string, string> = {
			active: 'Active',
			expired: 'Expired',
			archived: 'Archived',
			reclaimed: 'Reclaimed',
			released: 'Released',
			manual: 'Manual',
			automatic: 'Automatic',
			entitlement: 'Entitlement',
			inactivity: 'Inactivity',
			lifecycle_state: 'Lifecycle State',
			named: 'Named',
			concurrent: 'Concurrent',
			monthly: 'Monthly',
			annual: 'Annual',
			perpetual: 'Perpetual',
			block_new: 'Block New',
			revoke_all: 'Revoke All',
			warn_only: 'Warn Only',
			underutilized: 'Underutilized',
			high_utilization: 'High Utilization',
			expiring_soon: 'Expiring Soon',
			reclaim_opportunity: 'Reclaim Opportunity'
		};
		return labels[value] ?? value;
	}

	function utilizationColor(pct: number): string {
		if (pct > 90) return 'text-red-600 dark:text-red-400';
		if (pct > 70) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-green-600 dark:text-green-400';
	}

	function formatDate(d: string | null): string {
		if (!d) return '\u2014';
		return new Date(d).toLocaleDateString();
	}

	function formatDateTime(d: string | null): string {
		if (!d) return '\u2014';
		return new Date(d).toLocaleString();
	}
</script>

<PageHeader
	title="License Management"
	description="Manage software license pools, assignments, reclamation rules, and compliance"
/>

<div class="-mb-px flex gap-4 overflow-x-auto border-b border-border" role="tablist" aria-label="License Management tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			id="tab-{tab.id}"
			class="whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	<!-- ===== POOLS TAB ===== -->
	{#if activeTab === 'pools'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{pools.total} pool{pools.total !== 1 ? 's' : ''}</p>
			<a
				href="/governance/licenses/pools/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create pool
			</a>
		</div>

		{#if pools.items.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No license pools yet.</p>
					<a href="/governance/licenses/pools/create" class="mt-2 inline-block text-sm text-primary hover:underline">
						Create your first pool
					</a>
				</CardContent>
			</Card>
		{:else}
			<div class="overflow-x-auto rounded-md border border-border">
				<table class="w-full text-sm">
					<thead class="border-b bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Vendor</th>
							<th class="px-4 py-3 text-right font-medium">Capacity</th>
							<th class="px-4 py-3 text-right font-medium">Utilization</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Expires</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each pools.items as pool}
							<tr class="border-b last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">
									<a href="/governance/licenses/pools/{pool.id}" class="font-medium text-primary hover:underline">
										{pool.name}
									</a>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{pool.vendor}</td>
								<td class="px-4 py-3 text-right">{pool.allocated_count}/{pool.total_capacity}</td>
								<td class="px-4 py-3 text-right">
									<span class={utilizationColor(Number(pool.utilization_percent))}>
										{Number(pool.utilization_percent).toFixed(1)}%
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {statusBadgeClass(pool.status)}">
										{displayLabel(pool.status)}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(pool.expiration_date)}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex justify-end gap-1">
										{#if pool.status === 'active'}
											<button
												class="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
												onclick={() => handleArchivePool(pool.id)}
											>
												Archive
											</button>
										{/if}
										<button
											class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
											onclick={() => confirmDelete(pool.id, pool.name, 'pool')}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	<!-- ===== ASSIGNMENTS TAB ===== -->
	{:else if activeTab === 'assignments'}
		<div class="mb-4 flex items-center justify-between">
			<div class="flex gap-2">
				<a
					href="/governance/licenses/assignments/assign"
					class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
				>
					Assign license
				</a>
				<a
					href="/governance/licenses/assignments/bulk"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Bulk operations
				</a>
			</div>
		</div>

		{#if assignmentsLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else if assignments.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No license assignments yet.</p>
				</CardContent>
			</Card>
		{:else}
			<div class="overflow-x-auto rounded-md border border-border">
				<table class="w-full text-sm">
					<thead class="border-b bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Pool</th>
							<th class="px-4 py-3 text-left font-medium">User</th>
							<th class="px-4 py-3 text-left font-medium">Source</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Assigned</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each assignments as assignment}
							<tr class="border-b last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">{assignment.pool_name ?? resolvePoolName(assignment.license_pool_id)}</td>
								<td class="px-4 py-3">{assignment.user_email ?? assignment.user_id.slice(0, 8)}</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
										{displayLabel(assignment.source)}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {statusBadgeClass(assignment.status)}">
										{displayLabel(assignment.status)}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(assignment.assigned_at)}</td>
								<td class="px-4 py-3 text-right">
									{#if assignment.status === 'active'}
										<button
											class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
											onclick={() => handleDeallocate(assignment.id)}
										>
											Deallocate
										</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	<!-- ===== ANALYTICS TAB ===== -->
	{:else if activeTab === 'analytics'}
		{#if analyticsLoading}
			<div class="animate-pulse space-y-3">
				<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
					{#each Array(4) as _}
						<div class="h-24 rounded bg-muted"></div>
					{/each}
				</div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else if dashboard}
			<!-- Summary Cards -->
			<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Total Pools</p>
						<p class="text-2xl font-bold">{dashboard.summary.total_pools}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Total Capacity</p>
						<p class="text-2xl font-bold">{dashboard.summary.total_capacity.toLocaleString()}</p>
						<p class="text-xs text-muted-foreground">{dashboard.summary.total_allocated.toLocaleString()} allocated</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Utilization</p>
						<p class="text-2xl font-bold {utilizationColor(Number(dashboard.summary.overall_utilization))}">
							{Number(dashboard.summary.overall_utilization).toFixed(1)}%
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Monthly Cost</p>
						<p class="text-2xl font-bold">${Number(dashboard.summary.total_monthly_cost).toFixed(2)}</p>
						{#if dashboard.summary.expiring_soon_count > 0}
							<p class="text-xs text-red-600 dark:text-red-400">{dashboard.summary.expiring_soon_count} expiring soon</p>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Per-Pool Stats -->
			{#if dashboard.pools.length > 0}
				<Card class="mb-6">
					<CardHeader>
						<h3 class="text-lg font-semibold">Pool Statistics</h3>
					</CardHeader>
					<CardContent>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/50">
									<tr>
										<th class="px-4 py-2 text-left font-medium">Pool</th>
										<th class="px-4 py-2 text-left font-medium">Vendor</th>
										<th class="px-4 py-2 text-right font-medium">Capacity</th>
										<th class="px-4 py-2 text-right font-medium">Allocated</th>
										<th class="px-4 py-2 text-right font-medium">Utilization</th>
										<th class="px-4 py-2 text-right font-medium">Monthly Cost</th>
									</tr>
								</thead>
								<tbody>
									{#each dashboard.pools as ps}
										<tr class="border-b last:border-0">
											<td class="px-4 py-2">{ps.name}</td>
											<td class="px-4 py-2 text-muted-foreground">{ps.vendor}</td>
											<td class="px-4 py-2 text-right">{ps.total_capacity}</td>
											<td class="px-4 py-2 text-right">{ps.allocated_count}</td>
											<td class="px-4 py-2 text-right {utilizationColor(Number(ps.utilization_percent))}">{Number(ps.utilization_percent).toFixed(1)}%</td>
											<td class="px-4 py-2 text-right">{ps.monthly_cost != null ? `$${Number(ps.monthly_cost).toFixed(2)}` : '\u2014'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			{/if}

			<!-- Vendor Cost Breakdown -->
			{#if dashboard.cost_by_vendor.length > 0}
				<Card class="mb-6">
					<CardHeader>
						<h3 class="text-lg font-semibold">Cost by Vendor</h3>
					</CardHeader>
					<CardContent>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/50">
									<tr>
										<th class="px-4 py-2 text-left font-medium">Vendor</th>
										<th class="px-4 py-2 text-right font-medium">Pools</th>
										<th class="px-4 py-2 text-right font-medium">Capacity</th>
										<th class="px-4 py-2 text-right font-medium">Allocated</th>
										<th class="px-4 py-2 text-right font-medium">Monthly Cost</th>
									</tr>
								</thead>
								<tbody>
									{#each dashboard.cost_by_vendor as vc}
										<tr class="border-b last:border-0">
											<td class="px-4 py-2 font-medium">{vc.vendor}</td>
											<td class="px-4 py-2 text-right">{vc.pool_count}</td>
											<td class="px-4 py-2 text-right">{vc.total_capacity}</td>
											<td class="px-4 py-2 text-right">{vc.allocated_count}</td>
											<td class="px-4 py-2 text-right">${Number(vc.monthly_cost).toFixed(2)} {vc.currency}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			{/if}

			<!-- Recommendations -->
			{#if recommendations.length > 0}
				<Card class="mb-6">
					<CardHeader>
						<h3 class="text-lg font-semibold">Recommendations</h3>
					</CardHeader>
					<CardContent>
						<div class="space-y-3">
							{#each recommendations as rec}
								<div class="flex items-start justify-between rounded-md border p-3">
									<div>
										<div class="flex items-center gap-2">
											<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium
												{rec.recommendation_type === 'underutilized' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
												 rec.recommendation_type === 'high_utilization' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
												 rec.recommendation_type === 'expiring_soon' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
												 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}">
												{displayLabel(rec.recommendation_type)}
											</span>
											<span class="font-medium">{rec.pool_name}</span>
										</div>
										<p class="mt-1 text-sm text-muted-foreground">{rec.description}</p>
									</div>
									{#if rec.potential_savings != null}
										<span class="whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
											Save ${Number(rec.potential_savings).toFixed(2)}{rec.currency ? ` ${rec.currency}` : ''}
										</span>
									{/if}
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			<!-- Expiring Pools -->
			{#if expiringData && expiringData.pools.length > 0}
				<Card>
					<CardHeader>
						<h3 class="text-lg font-semibold">Expiring Pools ({expiringData.total_expiring})</h3>
					</CardHeader>
					<CardContent>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/50">
									<tr>
										<th class="px-4 py-2 text-left font-medium">Pool</th>
										<th class="px-4 py-2 text-left font-medium">Vendor</th>
										<th class="px-4 py-2 text-left font-medium">Expires</th>
										<th class="px-4 py-2 text-right font-medium">Days Left</th>
										<th class="px-4 py-2 text-right font-medium">Allocated</th>
										<th class="px-4 py-2 text-left font-medium">Policy</th>
									</tr>
								</thead>
								<tbody>
									{#each expiringData.pools as ep}
										<tr class="border-b last:border-0">
											<td class="px-4 py-2">
												<a href="/governance/licenses/pools/{ep.id}" class="text-primary hover:underline">{ep.name}</a>
											</td>
											<td class="px-4 py-2 text-muted-foreground">{ep.vendor}</td>
											<td class="px-4 py-2">{formatDate(ep.expiration_date)}</td>
											<td class="px-4 py-2 text-right {ep.days_until_expiration <= 7 ? 'text-red-600 dark:text-red-400 font-medium' : ep.days_until_expiration <= 30 ? 'text-yellow-600 dark:text-yellow-400' : ''}">
												{ep.days_until_expiration}
											</td>
											<td class="px-4 py-2 text-right">{ep.allocated_count}/{ep.total_capacity}</td>
											<td class="px-4 py-2">{displayLabel(ep.expiration_policy)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			{/if}
		{:else}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No analytics data available.</p>
				</CardContent>
			</Card>
		{/if}

	<!-- ===== RECLAMATION RULES TAB ===== -->
	{:else if activeTab === 'reclamation-rules'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{rulesTotal} rule{rulesTotal !== 1 ? 's' : ''}</p>
			<a
				href="/governance/licenses/reclamation-rules/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create rule
			</a>
		</div>

		{#if rulesLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else if rules.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No reclamation rules yet.</p>
				</CardContent>
			</Card>
		{:else}
			<div class="overflow-x-auto rounded-md border border-border">
				<table class="w-full text-sm">
					<thead class="border-b bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Pool</th>
							<th class="px-4 py-3 text-left font-medium">Trigger</th>
							<th class="px-4 py-3 text-left font-medium">Threshold / State</th>
							<th class="px-4 py-3 text-right font-medium">Notify Before</th>
							<th class="px-4 py-3 text-left font-medium">Enabled</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each rules as rule}
							<tr class="border-b last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">{rule.pool_name ?? resolvePoolName(rule.license_pool_id)}</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {rule.trigger_type === 'inactivity' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}">
										{displayLabel(rule.trigger_type)}
									</span>
								</td>
								<td class="px-4 py-3">
									{#if rule.trigger_type === 'inactivity'}
										{rule.threshold_days ?? '\u2014'} days
									{:else}
										{rule.lifecycle_state ?? '\u2014'}
									{/if}
								</td>
								<td class="px-4 py-3 text-right">{rule.notification_days_before} days</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {rule.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}">
										{rule.enabled ? 'Yes' : 'No'}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(rule.created_at)}</td>
								<td class="px-4 py-3 text-right">
									<button
										class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
										onclick={() => confirmDelete(rule.id, rule.pool_name ?? 'Rule', 'rule')}
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	<!-- ===== INCOMPATIBILITIES TAB ===== -->
	{:else if activeTab === 'incompatibilities'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{incompatTotal} incompatibilit{incompatTotal !== 1 ? 'ies' : 'y'}</p>
			<a
				href="/governance/licenses/incompatibilities/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create incompatibility
			</a>
		</div>

		{#if incompatLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else if incompatibilities.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No incompatibility rules yet.</p>
				</CardContent>
			</Card>
		{:else}
			<div class="overflow-x-auto rounded-md border border-border">
				<table class="w-full text-sm">
					<thead class="border-b bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Pool A</th>
							<th class="px-4 py-3 text-left font-medium">Pool B</th>
							<th class="px-4 py-3 text-left font-medium">Reason</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each incompatibilities as incompat}
							<tr class="border-b last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">
									<div>{incompat.pool_a_name ?? resolvePoolName(incompat.pool_a_id)}</div>
									{#if incompat.pool_a_vendor}
										<div class="text-xs text-muted-foreground">{incompat.pool_a_vendor}</div>
									{/if}
								</td>
								<td class="px-4 py-3">
									<div>{incompat.pool_b_name ?? resolvePoolName(incompat.pool_b_id)}</div>
									{#if incompat.pool_b_vendor}
										<div class="text-xs text-muted-foreground">{incompat.pool_b_vendor}</div>
									{/if}
								</td>
								<td class="px-4 py-3 max-w-xs truncate">{incompat.reason}</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(incompat.created_at)}</td>
								<td class="px-4 py-3 text-right">
									<button
										class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
										onclick={() => confirmDelete(incompat.id, `${incompat.pool_a_name ?? 'Pool A'} / ${incompat.pool_b_name ?? 'Pool B'}`, 'incompatibility')}
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	<!-- ===== ENTITLEMENT LINKS TAB ===== -->
	{:else if activeTab === 'entitlement-links'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{linksTotal} link{linksTotal !== 1 ? 's' : ''}</p>
			<a
				href="/governance/licenses/entitlement-links/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
			>
				Create link
			</a>
		</div>

		{#if linksLoading}
			<div class="animate-pulse space-y-3">
				<div class="h-8 rounded bg-muted"></div>
				<div class="h-48 rounded bg-muted"></div>
			</div>
		{:else if links.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No entitlement links yet.</p>
				</CardContent>
			</Card>
		{:else}
			<div class="overflow-x-auto rounded-md border border-border">
				<table class="w-full text-sm">
					<thead class="border-b bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Pool</th>
							<th class="px-4 py-3 text-left font-medium">Entitlement</th>
							<th class="px-4 py-3 text-right font-medium">Priority</th>
							<th class="px-4 py-3 text-left font-medium">Enabled</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each links as link}
							<tr class="border-b last:border-0 hover:bg-muted/30">
								<td class="px-4 py-3">
									<div>{link.pool_name ?? resolvePoolName(link.license_pool_id)}</div>
									{#if link.pool_vendor}
										<div class="text-xs text-muted-foreground">{link.pool_vendor}</div>
									{/if}
								</td>
								<td class="px-4 py-3">{link.entitlement_name ?? link.entitlement_id.slice(0, 8)}</td>
								<td class="px-4 py-3 text-right">{link.priority}</td>
								<td class="px-4 py-3">
									<button
										class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {link.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}"
										onclick={() => handleToggleLink(link.id, !link.enabled)}
									>
										{link.enabled ? 'Enabled' : 'Disabled'}
									</button>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(link.created_at)}</td>
								<td class="px-4 py-3 text-right">
									<button
										class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
										onclick={() => confirmDelete(link.id, link.pool_name ?? 'Link', 'link')}
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	<!-- ===== COMPLIANCE TAB ===== -->
	{:else if activeTab === 'compliance'}
		<!-- Report Generation -->
		<Card class="mb-6">
			<CardHeader>
				<h3 class="text-lg font-semibold">Generate Compliance Report</h3>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap items-end gap-4">
					<div class="space-y-1">
						<Label for="comp-vendor">Vendor</Label>
						<Input
							id="comp-vendor"
							type="text"
							placeholder="Filter by vendor"
							class="w-48"
							value={compVendorFilter}
							oninput={(e: Event) => (compVendorFilter = (e.target as HTMLInputElement).value)}
						/>
					</div>
					<div class="space-y-1">
						<Label for="comp-from">From</Label>
						<Input
							id="comp-from"
							type="date"
							class="w-40"
							value={compFromDate}
							oninput={(e: Event) => (compFromDate = (e.target as HTMLInputElement).value)}
						/>
					</div>
					<div class="space-y-1">
						<Label for="comp-to">To</Label>
						<Input
							id="comp-to"
							type="date"
							class="w-40"
							value={compToDate}
							oninput={(e: Event) => (compToDate = (e.target as HTMLInputElement).value)}
						/>
					</div>
					<Button onclick={handleGenerateReport} disabled={complianceLoading}>
						{complianceLoading ? 'Generating...' : 'Generate report'}
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Report Display -->
		{#if complianceReport}
			<Card class="mb-6">
				<CardHeader>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">Compliance Report</h3>
						<span class="text-sm text-muted-foreground">Generated: {formatDateTime(complianceReport.generated_at)}</span>
					</div>
				</CardHeader>
				<CardContent>
					<!-- Summary -->
					<div class="mb-4 grid grid-cols-3 gap-4 md:grid-cols-6">
						<div class="text-center">
							<p class="text-2xl font-bold">{complianceReport.summary.total_pools_reviewed}</p>
							<p class="text-xs text-muted-foreground">Reviewed</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold text-green-600 dark:text-green-400">{complianceReport.summary.compliant_pools}</p>
							<p class="text-xs text-muted-foreground">Compliant</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold text-red-600 dark:text-red-400">{complianceReport.summary.non_compliant_pools}</p>
							<p class="text-xs text-muted-foreground">Non-Compliant</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold">{complianceReport.summary.total_capacity.toLocaleString()}</p>
							<p class="text-xs text-muted-foreground">Capacity</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold">{complianceReport.summary.total_allocated.toLocaleString()}</p>
							<p class="text-xs text-muted-foreground">Allocated</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold {utilizationColor(Number(complianceReport.summary.overall_utilization))}">{Number(complianceReport.summary.overall_utilization).toFixed(1)}%</p>
							<p class="text-xs text-muted-foreground">Utilization</p>
						</div>
					</div>

					<!-- Pool Entries -->
					{#if complianceReport.pools.length > 0}
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/50">
									<tr>
										<th class="px-4 py-2 text-left font-medium">Pool</th>
										<th class="px-4 py-2 text-left font-medium">Vendor</th>
										<th class="px-4 py-2 text-right font-medium">Capacity</th>
										<th class="px-4 py-2 text-right font-medium">Utilization</th>
										<th class="px-4 py-2 text-left font-medium">Compliant</th>
										<th class="px-4 py-2 text-left font-medium">Issues</th>
									</tr>
								</thead>
								<tbody>
									{#each complianceReport.pools as entry}
										<tr class="border-b last:border-0">
											<td class="px-4 py-2">{entry.pool_name}</td>
											<td class="px-4 py-2 text-muted-foreground">{entry.vendor}</td>
											<td class="px-4 py-2 text-right">{entry.allocated_count}/{entry.total_capacity}</td>
											<td class="px-4 py-2 text-right {utilizationColor(Number(entry.utilization_percent))}">{Number(entry.utilization_percent).toFixed(1)}%</td>
											<td class="px-4 py-2">
												{#if entry.is_compliant}
													<span class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">Yes</span>
												{:else}
													<span class="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">No</span>
												{/if}
											</td>
											<td class="px-4 py-2">
												{#if entry.issues.length > 0}
													<ul class="list-disc pl-4 text-xs text-red-600 dark:text-red-400">
														{#each entry.issues as issue}
															<li>{issue}</li>
														{/each}
													</ul>
												{:else}
													<span class="text-muted-foreground">\u2014</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}

		<!-- Audit Trail -->
		<Card>
			<CardHeader>
				<h3 class="text-lg font-semibold">Audit Trail</h3>
			</CardHeader>
			<CardContent>
				{#if auditLoading}
					<div class="animate-pulse space-y-3">
						<div class="h-8 rounded bg-muted"></div>
						<div class="h-48 rounded bg-muted"></div>
					</div>
				{:else if auditTrail.length === 0}
					<p class="py-8 text-center text-muted-foreground">No audit entries yet.</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead class="border-b bg-muted/50">
								<tr>
									<th class="px-4 py-2 text-left font-medium">Pool</th>
									<th class="px-4 py-2 text-left font-medium">User</th>
									<th class="px-4 py-2 text-left font-medium">Action</th>
									<th class="px-4 py-2 text-left font-medium">Actor</th>
									<th class="px-4 py-2 text-left font-medium">Timestamp</th>
								</tr>
							</thead>
							<tbody>
								{#each auditTrail as entry}
									<tr class="border-b last:border-0">
										<td class="px-4 py-2">{entry.pool_name ?? entry.pool_id?.slice(0, 8) ?? '\u2014'}</td>
										<td class="px-4 py-2">{entry.user_email ?? entry.user_id?.slice(0, 8) ?? '\u2014'}</td>
										<td class="px-4 py-2">
											<span class="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
												{entry.action}
											</span>
										</td>
										<td class="px-4 py-2">{entry.actor_email ?? entry.actor_id.slice(0, 8)}</td>
										<td class="px-4 py-2 text-muted-foreground">{formatDateTime(entry.created_at)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Delete</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>{deleteTarget?.name ?? 'this item'}</strong>? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={executeDelete}>Confirm delete</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
