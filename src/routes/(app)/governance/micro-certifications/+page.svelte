<script lang="ts">
	import type {
		MicroCertification,
		MicroCertificationListResponse,
		MicroCertificationStats,
		TriggerRule,
		TriggerRuleListResponse
	} from '$lib/api/types';
	import {
		fetchMicroCertifications,
		fetchMyPendingCertifications,
		fetchMicroCertificationStats,
		fetchTriggerRules,
		bulkDecideMicroCertificationsClient
	} from '$lib/api/micro-certifications-client';
	import CertStatusBadge from '$lib/components/micro-certifications/cert-status-badge.svelte';
	import TriggerRuleBadge from '$lib/components/micro-certifications/trigger-rule-badge.svelte';
	import CertStatsCards from '$lib/components/micro-certifications/cert-stats-cards.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	const isAdmin = $derived(data.isAdmin);

	const tabs = $derived(
		isAdmin
			? [
					{ id: 'my-pending', label: 'My Pending' },
					{ id: 'all', label: 'All Certifications' },
					{ id: 'triggers', label: 'Trigger Rules' },
					{ id: 'statistics', label: 'Statistics' }
				]
			: [{ id: 'my-pending', label: 'My Pending' }]
	);

	let activeTab = $state('my-pending');

	// My Pending state
	let myPending = $derived(data.myPending);

	// All Certifications state
	// svelte-ignore state_referenced_locally
	let allCertifications: MicroCertificationListResponse = $state(data.allCertifications as MicroCertificationListResponse);
	let allLoading = $state(false);
	let statusFilter = $state('');
	let selectedIds: string[] = $state([]);

	// Trigger Rules state
	// svelte-ignore state_referenced_locally
	let triggerRules: TriggerRuleListResponse = $state(data.triggerRules as TriggerRuleListResponse);
	let triggersLoading = $state(false);

	// Stats state
	// svelte-ignore state_referenced_locally
	let stats: MicroCertificationStats | null = $state(data.stats);
	let statsLoading = $state(false);

	// Bulk operations
	let bulkDecision = $state<'approve' | 'revoke'>('approve');
	let bulkComment = $state('');
	let bulkSubmitting = $state(false);

	async function loadAllCertifications() {
		allLoading = true;
		try {
			const params: Record<string, string | number | boolean | undefined> = { limit: 20, offset: 0 };
			if (statusFilter) params.status = statusFilter;
			allCertifications = await fetchMicroCertifications(params);
		} catch {
			addToast('error', 'Failed to load certifications');
		} finally {
			allLoading = false;
		}
	}

	async function loadTriggerRules() {
		triggersLoading = true;
		try {
			triggerRules = await fetchTriggerRules({ limit: 100 });
		} catch {
			addToast('error', 'Failed to load trigger rules');
		} finally {
			triggersLoading = false;
		}
	}

	async function loadStats() {
		statsLoading = true;
		try {
			stats = await fetchMicroCertificationStats();
		} catch {
			addToast('error', 'Failed to load statistics');
		} finally {
			statsLoading = false;
		}
	}

	function handleTabChange(tabId: string) {
		activeTab = tabId;
		if (tabId === 'all') loadAllCertifications();
		if (tabId === 'triggers') loadTriggerRules();
		if (tabId === 'statistics') loadStats();
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((s) => s !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function toggleSelectAll() {
		const pendingItems = allCertifications.items.filter((c) => c.status === 'pending');
		if (selectedIds.length === pendingItems.length) {
			selectedIds = [];
		} else {
			selectedIds = pendingItems.map((c) => c.id);
		}
	}

	async function handleBulkDecide() {
		if (selectedIds.length === 0) return;
		bulkSubmitting = true;
		try {
			const result = await bulkDecideMicroCertificationsClient({
				certification_ids: selectedIds,
				decision: bulkDecision,
				comment: bulkComment || undefined
			});
			addToast('success', `Bulk ${bulkDecision}: ${result.success_count} succeeded, ${result.failure_count} failed`);
			selectedIds = [];
			bulkComment = '';
			loadAllCertifications();
			loadStats();
		} catch {
			addToast('error', 'Bulk operation failed');
		} finally {
			bulkSubmitting = false;
		}
	}

	const reviewerTypeLabels: Record<string, string> = {
		user_manager: 'User Manager',
		entitlement_owner: 'Entitlement Owner',
		application_owner: 'Application Owner',
		specific_user: 'Specific User'
	};

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		try {
			return new Date(dateStr).toLocaleDateString();
		} catch {
			return dateStr;
		}
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Micro Certifications</h1>
			<p class="text-sm text-muted-foreground">
				Event-driven access certification reviews for continuous compliance.
			</p>
		</div>
		{#if isAdmin}
			<div class="flex gap-2">
				<a href="/governance/micro-certifications/trigger">
					<Button variant="outline" size="sm">Trigger Certification</Button>
				</a>
				<a href="/governance/micro-certifications/triggers/create">
					<Button size="sm">Create Trigger Rule</Button>
				</a>
			</div>
		{/if}
	</div>

	<div class="border-b border-border">
		<nav class="-mb-px flex space-x-8" aria-label="Tabs">
			{#each tabs as tab}
				<button
					type="button"
					class="whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
						? 'border-primary text-primary'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
					onclick={() => handleTabChange(tab.id)}
					data-testid="tab-{tab.id}"
				>
					{tab.label}
					{#if tab.id === 'my-pending' && myPending.total > 0}
						<span class="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{myPending.total}</span>
					{/if}
				</button>
			{/each}
		</nav>
	</div>

	<!-- My Pending Tab -->
	{#if activeTab === 'my-pending'}
		<div data-testid="my-pending-tab">
			{#if myPending.items.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-lg font-medium text-muted-foreground">No pending certifications</p>
					<p class="mt-1 text-sm text-muted-foreground">You have no micro certifications awaiting your review.</p>
				</div>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-4 py-3 text-left font-medium">User</th>
								<th class="px-4 py-3 text-left font-medium">Entitlement</th>
								<th class="px-4 py-3 text-left font-medium">Status</th>
								<th class="px-4 py-3 text-left font-medium">Deadline</th>
								<th class="px-4 py-3 text-left font-medium">Flags</th>
								<th class="px-4 py-3 text-left font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each myPending.items as cert (cert.id)}
								<tr class="border-b hover:bg-muted/30">
									<td class="px-4 py-3 font-mono text-xs">{cert.user_id.slice(0, 8)}...</td>
									<td class="px-4 py-3 font-mono text-xs">{cert.entitlement_id.slice(0, 8)}...</td>
									<td class="px-4 py-3"><CertStatusBadge status={cert.status} size="sm" /></td>
									<td class="px-4 py-3 text-xs">{formatDate(cert.to_date)}</td>
									<td class="px-4 py-3">
										{#if cert.escalated}
											<span class="text-xs text-orange-600 dark:text-orange-400">Escalated</span>
										{/if}
										{#if cert.past_deadline}
											<span class="text-xs text-red-600 dark:text-red-400">Overdue</span>
										{/if}
									</td>
									<td class="px-4 py-3">
										<a href="/governance/micro-certifications/{cert.id}" class="text-xs text-primary hover:underline">
											Review
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- All Certifications Tab (Admin) -->
	{#if activeTab === 'all' && isAdmin}
		<div data-testid="all-certifications-tab">
			<div class="mb-4 flex items-center gap-4">
				<select
					class="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
					bind:value={statusFilter}
					onchange={() => loadAllCertifications()}
				>
					<option value="">All Statuses</option>
					<option value="pending">Pending</option>
					<option value="approved">Approved</option>
					<option value="revoked">Revoked</option>
					<option value="auto_revoked">Auto-Revoked</option>
					<option value="flagged_for_review">Flagged for Review</option>
					<option value="skipped">Skipped</option>
					<option value="expired">Expired</option>
				</select>

				{#if selectedIds.length > 0}
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">{selectedIds.length} selected</span>
						<select
							class="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
							bind:value={bulkDecision}
						>
							<option value="approve">Approve</option>
							<option value="revoke">Revoke</option>
						</select>
						<input
							type="text"
							class="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
							placeholder="Comment..."
							bind:value={bulkComment}
						/>
						<Button size="sm" onclick={handleBulkDecide} disabled={bulkSubmitting}>
							{bulkSubmitting ? 'Processing...' : `Bulk ${bulkDecision}`}
						</Button>
					</div>
				{/if}
			</div>

			{#if allLoading}
				<p class="py-8 text-center text-sm text-muted-foreground">Loading...</p>
			{:else if allCertifications.items.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-lg font-medium text-muted-foreground">No certifications found</p>
				</div>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-4 py-3">
									<input type="checkbox" onchange={toggleSelectAll} />
								</th>
								<th class="px-4 py-3 text-left font-medium">User</th>
								<th class="px-4 py-3 text-left font-medium">Entitlement</th>
								<th class="px-4 py-3 text-left font-medium">Reviewer</th>
								<th class="px-4 py-3 text-left font-medium">Status</th>
								<th class="px-4 py-3 text-left font-medium">Created</th>
								<th class="px-4 py-3 text-left font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each allCertifications.items as cert (cert.id)}
								<tr class="border-b hover:bg-muted/30">
									<td class="px-4 py-3">
										{#if cert.status === 'pending'}
											<input
												type="checkbox"
												checked={selectedIds.includes(cert.id)}
												onchange={() => toggleSelect(cert.id)}
											/>
										{/if}
									</td>
									<td class="px-4 py-3 font-mono text-xs">{cert.user_id.slice(0, 8)}...</td>
									<td class="px-4 py-3 font-mono text-xs">{cert.entitlement_id.slice(0, 8)}...</td>
									<td class="px-4 py-3 font-mono text-xs">{cert.reviewer_id.slice(0, 8)}...</td>
									<td class="px-4 py-3"><CertStatusBadge status={cert.status} size="sm" /></td>
									<td class="px-4 py-3 text-xs">{formatDate(cert.created_at)}</td>
									<td class="px-4 py-3">
										<a href="/governance/micro-certifications/{cert.id}" class="text-xs text-primary hover:underline">
											View
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Trigger Rules Tab (Admin) -->
	{#if activeTab === 'triggers' && isAdmin}
		<div data-testid="trigger-rules-tab">
			{#if triggersLoading}
				<p class="py-8 text-center text-sm text-muted-foreground">Loading...</p>
			{:else if triggerRules.items.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-lg font-medium text-muted-foreground">No trigger rules</p>
					<p class="mt-1 text-sm text-muted-foreground">Create trigger rules to automate certification generation.</p>
					<a href="/governance/micro-certifications/triggers/create" class="mt-4">
						<Button>Create trigger rule</Button>
					</a>
				</div>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-4 py-3 text-left font-medium">Name</th>
								<th class="px-4 py-3 text-left font-medium">Trigger Type</th>
								<th class="px-4 py-3 text-left font-medium">Scope</th>
								<th class="px-4 py-3 text-left font-medium">Reviewer</th>
								<th class="px-4 py-3 text-left font-medium">Status</th>
								<th class="px-4 py-3 text-left font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each triggerRules.items as rule (rule.id)}
								<tr class="border-b hover:bg-muted/30">
									<td class="px-4 py-3">
										<span class="font-medium">{rule.name}</span>
										{#if rule.is_default}
											<span class="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">Default</span>
										{/if}
									</td>
									<td class="px-4 py-3"><TriggerRuleBadge type="trigger" value={rule.trigger_type} /></td>
									<td class="px-4 py-3"><TriggerRuleBadge type="scope" value={rule.scope_type} /></td>
									<td class="px-4 py-3 text-xs">{reviewerTypeLabels[rule.reviewer_type] ?? rule.reviewer_type}</td>
									<td class="px-4 py-3">
										{#if rule.is_active}
											<span class="text-xs text-green-600 dark:text-green-400">Active</span>
										{:else}
											<span class="text-xs text-gray-500">Inactive</span>
										{/if}
									</td>
									<td class="px-4 py-3">
										<a href="/governance/micro-certifications/triggers/{rule.id}" class="text-xs text-primary hover:underline">
											View
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Statistics Tab (Admin) -->
	{#if activeTab === 'statistics' && isAdmin}
		<div data-testid="statistics-tab">
			{#if statsLoading}
				<p class="py-8 text-center text-sm text-muted-foreground">Loading statistics...</p>
			{:else if stats}
				<CertStatsCards {stats} />
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-lg font-medium text-muted-foreground">Statistics unavailable</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
