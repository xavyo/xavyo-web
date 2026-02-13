<script lang="ts">
	import type { SlaPolicy, TicketingConfig, BulkAction, FailedOperation, BulkStateOperation, ScheduledTransition } from '$lib/api/types';
	import {
		fetchSlaPolicies,
		fetchTicketingConfigs,
		fetchBulkActions,
		fetchFailedOperations,
		fetchScheduledTransitions,
		fetchBulkStateOperations,
		processFailedOperationRetries,
		cancelScheduledTransition,
		cancelBulkStateOperation
	} from '$lib/api/governance-operations-client';
	import { addToast } from '$lib/stores/toast.svelte';
	import SlaStatusBadge from '$lib/components/operations/sla-status-badge.svelte';
	import TicketingTypeBadge from '$lib/components/operations/ticketing-type-badge.svelte';
	import BulkActionStatusBadge from '$lib/components/operations/bulk-action-status-badge.svelte';
	import FailedOpStatusBadge from '$lib/components/operations/failed-op-status-badge.svelte';
	import BulkStateStatusBadge from '$lib/components/operations/bulk-state-status-badge.svelte';
	import ScheduledStatusBadge from '$lib/components/operations/scheduled-status-badge.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';

	const tabs = [
		{ id: 'sla', label: 'SLA Policies' },
		{ id: 'ticketing', label: 'Ticketing' },
		{ id: 'bulk-actions', label: 'Bulk Actions' },
		{ id: 'failed-ops', label: 'Failed Operations' },
		{ id: 'bulk-state', label: 'Bulk State' },
		{ id: 'scheduled', label: 'Scheduled' }
	];

	let activeTab: string = $state('sla');

	// --- SLA Policies state ---
	let slaPolicies: SlaPolicy[] = $state([]);
	let slaLoading: boolean = $state(false);
	let slaStatusFilter: string = $state('');

	// --- Ticketing state ---
	let ticketingConfigs: TicketingConfig[] = $state([]);
	let ticketingLoading: boolean = $state(false);

	// --- Bulk Actions state ---
	let bulkActions: BulkAction[] = $state([]);
	let bulkActionsLoading: boolean = $state(false);
	let bulkActionStatusFilter: string = $state('');
	let bulkActionTypeFilter: string = $state('');

	// --- Failed Operations state ---
	let failedOps: FailedOperation[] = $state([]);
	let failedOpsLoading: boolean = $state(false);

	// --- Bulk State state ---
	let bulkStateOps: BulkStateOperation[] = $state([]);
	let bulkStateLoading: boolean = $state(false);

	// --- Scheduled Transitions state ---
	let scheduledTransitions: ScheduledTransition[] = $state([]);
	let scheduledLoading: boolean = $state(false);
	let scheduledStatusFilter: string = $state('');

	// --- Load functions ---

	async function loadSlaPolicies() {
		slaLoading = true;
		try {
			const params: Record<string, string | number> = { page_size: 100 };
			if (slaStatusFilter) params.status = slaStatusFilter;
			const result = await fetchSlaPolicies(params);
			slaPolicies = result.items;
		} catch {
			addToast('error', 'Failed to load SLA policies');
		} finally {
			slaLoading = false;
		}
	}

	async function loadTicketingConfigs() {
		ticketingLoading = true;
		try {
			const result = await fetchTicketingConfigs({ page_size: 100 });
			ticketingConfigs = result.items;
		} catch {
			addToast('error', 'Failed to load ticketing configurations');
		} finally {
			ticketingLoading = false;
		}
	}

	async function loadBulkActions() {
		bulkActionsLoading = true;
		try {
			const params: Record<string, string | number> = { page_size: 100 };
			if (bulkActionStatusFilter) params.status = bulkActionStatusFilter;
			if (bulkActionTypeFilter) params.action_type = bulkActionTypeFilter;
			const result = await fetchBulkActions(params);
			bulkActions = result.items;
		} catch {
			addToast('error', 'Failed to load bulk actions');
		} finally {
			bulkActionsLoading = false;
		}
	}

	async function loadFailedOps() {
		failedOpsLoading = true;
		try {
			const result = await fetchFailedOperations({ page_size: 100 });
			failedOps = result.items;
		} catch {
			addToast('error', 'Failed to load failed operations');
		} finally {
			failedOpsLoading = false;
		}
	}

	async function loadScheduledTransitions() {
		scheduledLoading = true;
		try {
			const params: Record<string, string | number> = { page_size: 100 };
			if (scheduledStatusFilter) params.status = scheduledStatusFilter;
			const result = await fetchScheduledTransitions(params);
			scheduledTransitions = result.items;
		} catch {
			addToast('error', 'Failed to load scheduled transitions');
		} finally {
			scheduledLoading = false;
		}
	}

	async function loadBulkStateOps() {
		bulkStateLoading = true;
		try {
			const result = await fetchBulkStateOperations({ page_size: 100 });
			bulkStateOps = result.items;
		} catch {
			addToast('error', 'Failed to load bulk state operations');
		} finally {
			bulkStateLoading = false;
		}
	}

	// --- Tab change handler ---

	function handleTabChange(tabId: string) {
		activeTab = tabId;
		if (tabId === 'sla') loadSlaPolicies();
		if (tabId === 'ticketing') loadTicketingConfigs();
		if (tabId === 'bulk-actions') loadBulkActions();
		if (tabId === 'failed-ops') loadFailedOps();
		if (tabId === 'bulk-state') loadBulkStateOps();
		if (tabId === 'scheduled') loadScheduledTransitions();
	}

	// --- Action handlers ---

	let processingRetries: boolean = $state(false);

	async function handleProcessRetries() {
		processingRetries = true;
		try {
			await processFailedOperationRetries();
			addToast('success', 'Failed operation retries processed');
			await loadFailedOps();
		} catch {
			addToast('error', 'Failed to process retries');
		} finally {
			processingRetries = false;
		}
	}

	async function handleCancelScheduledTransition(id: string) {
		try {
			await cancelScheduledTransition(id);
			addToast('success', 'Scheduled transition cancelled');
			await loadScheduledTransitions();
		} catch {
			addToast('error', 'Failed to cancel scheduled transition');
		}
	}

	async function handleCancelBulkStateOp(id: string) {
		try {
			await cancelBulkStateOperation(id);
			addToast('success', 'Bulk operation cancelled');
			await loadBulkStateOps();
		} catch {
			addToast('error', 'Failed to cancel bulk operation');
		}
	}

	// --- Filter change handlers ---

	function handleSlaStatusFilterChange(value: string) {
		slaStatusFilter = value;
		loadSlaPolicies();
	}

	function handleBulkActionStatusFilterChange(value: string) {
		bulkActionStatusFilter = value;
		loadBulkActions();
	}

	function handleBulkActionTypeFilterChange(value: string) {
		bulkActionTypeFilter = value;
		loadBulkActions();
	}

	function handleScheduledStatusFilterChange(value: string) {
		scheduledStatusFilter = value;
		loadScheduledTransitions();
	}

	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '--';
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return '--';
		return d.toLocaleString();
	}

	function truncate(text: string | null | undefined, maxLen: number): string {
		if (!text) return '--';
		return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
	}

	function formatActionType(value: string): string {
		const labels: Record<string, string> = {
			assign_role: 'Assign Role',
			revoke_role: 'Revoke Role',
			enable: 'Enable',
			disable: 'Disable',
			modify_attribute: 'Modify Attribute'
		};
		return labels[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function formatDuration(seconds: number): string {
		if (seconds >= 86400) return `${Math.round(seconds / 86400)}d`;
		if (seconds >= 3600) return `${Math.round(seconds / 3600)}h`;
		return `${Math.round(seconds / 60)}m`;
	}

	// Load initial tab data
	$effect(() => {
		loadSlaPolicies();
	});
</script>

<div class="space-y-6 p-6">
	<PageHeader
		title="Governance Operations"
		description="Manage SLA policies, ticketing integrations, bulk actions, failed operations, and scheduled transitions."
	/>

	<div class="border-b border-border">
		<nav class="-mb-px flex space-x-8" aria-label="Tabs">
			{#each tabs as tab}
				<button
					type="button"
					class="whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
						? 'border-primary text-primary'
						: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
					onclick={() => handleTabChange(tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<div>
		<!-- SLA Policies Tab -->
		{#if activeTab === 'sla'}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<select
							class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
							value={slaStatusFilter}
							onchange={(e) => handleSlaStatusFilterChange(e.currentTarget.value)}
						>
							<option value="">All Statuses</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>
					<a href="/governance/operations/sla/create" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90">Create SLA Policy</a>
				</div>

				{#if slaLoading}
					<p class="py-8 text-center text-sm text-muted-foreground">Loading SLA policies...</p>
				{:else if slaPolicies.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">No SLA policies found</p>
				{:else}
					<div class="overflow-x-auto rounded-md border">
						<table class="min-w-full divide-y divide-border">
							<thead class="bg-muted/50">
								<tr>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Duration</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Warning %</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Breach Notify</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each slaPolicies as policy}
									<tr class="hover:bg-muted/30">
										<td class="px-4 py-3 text-sm">
											<a href="/governance/operations/sla/{policy.id}" class="font-medium text-primary hover:underline">
												{policy.name}
											</a>
											{#if policy.description}
												<p class="text-xs text-muted-foreground">{truncate(policy.description, 60)}</p>
											{/if}
										</td>
										<td class="px-4 py-3 text-sm">{policy.target_duration_human || formatDuration(policy.target_duration_seconds)}</td>
										<td class="px-4 py-3 text-sm">{policy.warning_threshold_percent}%</td>
										<td class="px-4 py-3 text-sm">
											{#if policy.breach_notification_enabled}
												<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">Yes</span>
											{:else}
												<span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">No</span>
											{/if}
										</td>
										<td class="px-4 py-3 text-sm">
											<SlaStatusBadge status={policy.is_active ? 'active' : 'inactive'} />
										</td>
										<td class="px-4 py-3 text-sm">
											<a href="/governance/operations/sla/{policy.id}" class="text-sm text-primary hover:underline">View</a>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

		<!-- Ticketing Tab -->
		{:else if activeTab === 'ticketing'}
			<div class="space-y-4">
				<div class="flex items-center justify-end">
					<a href="/governance/operations/ticketing/create" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90">Create Configuration</a>
				</div>

				{#if ticketingLoading}
					<p class="py-8 text-center text-sm text-muted-foreground">Loading ticketing configurations...</p>
				{:else if ticketingConfigs.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">No ticketing configurations found</p>
				{:else}
					<div class="overflow-x-auto rounded-md border">
						<table class="min-w-full divide-y divide-border">
							<thead class="bg-muted/50">
								<tr>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Endpoint</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Polling Interval</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Active</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each ticketingConfigs as config}
									<tr class="hover:bg-muted/30">
										<td class="px-4 py-3 text-sm">
											<a href="/governance/operations/ticketing/{config.id}" class="font-medium text-primary hover:underline">
												{config.name}
											</a>
										</td>
										<td class="px-4 py-3 text-sm">
											<TicketingTypeBadge systemType={config.ticketing_type} />
										</td>
										<td class="px-4 py-3 text-sm">{truncate(config.endpoint_url, 40)}</td>
										<td class="px-4 py-3 text-sm">{config.polling_interval_seconds}s</td>
										<td class="px-4 py-3 text-sm">
											{#if config.is_active}
												<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">Yes</span>
											{:else}
												<span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">No</span>
											{/if}
										</td>
										<td class="px-4 py-3 text-sm">
											<a href="/governance/operations/ticketing/{config.id}" class="text-sm text-primary hover:underline">View</a>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

		<!-- Bulk Actions Tab -->
		{:else if activeTab === 'bulk-actions'}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<select
							class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
							value={bulkActionStatusFilter}
							onchange={(e) => handleBulkActionStatusFilterChange(e.currentTarget.value)}
						>
							<option value="">All Statuses</option>
							<option value="pending">Pending</option>
							<option value="previewing">Previewing</option>
							<option value="approved">Approved</option>
							<option value="executing">Executing</option>
							<option value="completed">Completed</option>
							<option value="failed">Failed</option>
							<option value="cancelled">Cancelled</option>
						</select>
						<select
							class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
							value={bulkActionTypeFilter}
							onchange={(e) => handleBulkActionTypeFilterChange(e.currentTarget.value)}
						>
							<option value="">All Types</option>
							<option value="assign_role">Assign Role</option>
							<option value="revoke_role">Revoke Role</option>
							<option value="enable">Enable</option>
							<option value="disable">Disable</option>
							<option value="modify_attribute">Modify Attribute</option>
						</select>
					</div>
					<a href="/governance/operations/bulk-actions/create" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90">Create Bulk Action</a>
				</div>

				{#if bulkActionsLoading}
					<p class="py-8 text-center text-sm text-muted-foreground">Loading bulk actions...</p>
				{:else if bulkActions.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">No bulk actions found</p>
				{:else}
					<div class="overflow-x-auto rounded-md border">
						<table class="min-w-full divide-y divide-border">
							<thead class="bg-muted/50">
								<tr>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Filter Expression</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action Type</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Matched</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Processed</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Failed</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created At</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each bulkActions as action}
									<tr class="hover:bg-muted/30">
										<td class="px-4 py-3 text-sm">
											<a href="/governance/operations/bulk-actions/{action.id}" class="font-medium text-primary hover:underline">
												{truncate(action.filter_expression, 40)}
											</a>
											{#if action.justification}
												<p class="text-xs text-muted-foreground">{truncate(action.justification, 50)}</p>
											{/if}
										</td>
										<td class="px-4 py-3 text-sm">{formatActionType(action.action_type)}</td>
										<td class="px-4 py-3 text-sm">
											<BulkActionStatusBadge status={action.status} />
										</td>
										<td class="px-4 py-3 text-sm">{action.total_matched}</td>
										<td class="px-4 py-3 text-sm">{action.processed_count}</td>
										<td class="px-4 py-3 text-sm">{action.failure_count}</td>
										<td class="px-4 py-3 text-sm">{formatDate(action.created_at)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

		<!-- Failed Operations Tab -->
		{:else if activeTab === 'failed-ops'}
			<div class="space-y-4">
				<div class="flex items-center justify-end">
					<Button onclick={handleProcessRetries} disabled={processingRetries}>
						{processingRetries ? 'Processing...' : 'Process Retries'}
					</Button>
				</div>

				{#if failedOpsLoading}
					<p class="py-8 text-center text-sm text-muted-foreground">Loading failed operations...</p>
				{:else if failedOps.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">No failed operations</p>
				{:else}
					<div class="overflow-x-auto rounded-md border">
						<table class="min-w-full divide-y divide-border">
							<thead class="bg-muted/50">
								<tr>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Operation Type</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Object</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Error Message</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Retries</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Next Retry</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each failedOps as op}
									<tr class="hover:bg-muted/30">
										<td class="px-4 py-3 text-sm">{op.operation_type}</td>
										<td class="px-4 py-3 text-sm">
											<span class="text-xs text-muted-foreground">{op.object_type}</span>
											<br />
											<span class="font-mono text-xs">{truncate(op.object_id, 12)}</span>
										</td>
										<td class="px-4 py-3 text-sm" title={op.error_message}>{truncate(op.error_message, 50)}</td>
										<td class="px-4 py-3 text-sm">{op.retry_count} / {op.max_retries}</td>
										<td class="px-4 py-3 text-sm">
											<FailedOpStatusBadge status={op.status} />
										</td>
										<td class="px-4 py-3 text-sm">{formatDate(op.next_retry_at)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

		<!-- Bulk State Tab -->
		{:else if activeTab === 'bulk-state'}
			<div class="space-y-4">
				{#if bulkStateLoading}
					<p class="py-8 text-center text-sm text-muted-foreground">Loading bulk state operations...</p>
				{:else if bulkStateOps.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">No bulk state operations</p>
				{:else}
					<div class="overflow-x-auto rounded-md border">
						<table class="min-w-full divide-y divide-border">
							<thead class="bg-muted/50">
								<tr>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Transition ID</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Progress</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Success / Fail</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created At</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each bulkStateOps as op}
									<tr class="hover:bg-muted/30">
										<td class="px-4 py-3 text-sm font-mono text-xs">{truncate(op.transition_id, 12)}</td>
										<td class="px-4 py-3 text-sm">
											<BulkStateStatusBadge status={op.status} />
										</td>
										<td class="px-4 py-3 text-sm">
											{op.processed_count} / {op.total_count}
											<span class="ml-1 text-xs text-muted-foreground">({op.progress_percent}%)</span>
										</td>
										<td class="px-4 py-3 text-sm">
											<span class="text-green-600 dark:text-green-400">{op.success_count}</span> / <span class="text-red-600 dark:text-red-400">{op.failure_count}</span>
										</td>
										<td class="px-4 py-3 text-sm">{formatDate(op.created_at)}</td>
										<td class="px-4 py-3 text-sm">
											{#if op.status === 'queued' || op.status === 'processing'}
												<button
													type="button"
													class="text-sm font-medium text-destructive hover:underline"
													onclick={() => handleCancelBulkStateOp(op.id)}
												>
													Cancel
												</button>
											{:else}
												<span class="text-sm text-muted-foreground">--</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

		<!-- Scheduled Tab -->
		{:else if activeTab === 'scheduled'}
			<div class="space-y-4">
				<div class="flex items-center gap-3">
					<select
						class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
						value={scheduledStatusFilter}
						onchange={(e) => handleScheduledStatusFilterChange(e.currentTarget.value)}
					>
						<option value="">All Statuses</option>
						<option value="pending">Pending</option>
						<option value="executed">Executed</option>
						<option value="cancelled">Cancelled</option>
						<option value="failed">Failed</option>
					</select>
				</div>

				{#if scheduledLoading}
					<p class="py-8 text-center text-sm text-muted-foreground">Loading scheduled transitions...</p>
				{:else if scheduledTransitions.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">No scheduled transitions</p>
				{:else}
					<div class="overflow-x-auto rounded-md border">
						<table class="min-w-full divide-y divide-border">
							<thead class="bg-muted/50">
								<tr>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Object</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Transition</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Scheduled For</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
									<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each scheduledTransitions as transition}
									<tr class="hover:bg-muted/30">
										<td class="px-4 py-3 text-sm">
											<span class="text-xs text-muted-foreground">{transition.object_type}</span>
											<br />
											<span class="font-mono text-xs">{truncate(transition.object_id, 12)}</span>
										</td>
										<td class="px-4 py-3 text-sm">
											{transition.transition_name}
											<br />
											<span class="text-xs text-muted-foreground">{transition.from_state} → {transition.to_state}</span>
										</td>
										<td class="px-4 py-3 text-sm">{formatDate(transition.scheduled_for)}</td>
										<td class="px-4 py-3 text-sm">
											<ScheduledStatusBadge status={transition.status} />
										</td>
										<td class="px-4 py-3 text-sm">
											{#if transition.status === 'pending'}
												<button
													type="button"
													class="text-sm font-medium text-destructive hover:underline"
													onclick={() => handleCancelScheduledTransition(transition.id)}
												>
													Cancel
												</button>
											{:else}
												<span class="text-sm text-muted-foreground">--</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
