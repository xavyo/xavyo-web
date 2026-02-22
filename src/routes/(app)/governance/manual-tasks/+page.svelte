<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import DashboardMetricCard from '$lib/components/manual-tasks/dashboard-metric-card.svelte';
	import TaskStatusBadge from '$lib/components/manual-tasks/task-status-badge.svelte';
	import OperationTypeBadge from '$lib/components/manual-tasks/operation-type-badge.svelte';
	import SlaIndicator from '$lib/components/manual-tasks/sla-indicator.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let statusFilter = $state(data.filters.status ?? '');
	// svelte-ignore state_referenced_locally
	let slaBreachedFilter = $state(data.filters.sla_breached !== undefined ? String(data.filters.sla_breached) : '');

	function applyFilters() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		if (slaBreachedFilter) params.set('sla_breached', slaBreachedFilter);
		const qs = params.toString();
		goto(`/governance/manual-tasks${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function formatCompletionTime(seconds: number | null): string {
		if (seconds === null) return 'N/A';
		if (seconds < 60) return `${Math.round(seconds)}s`;
		if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
		return `${(seconds / 3600).toFixed(1)}h`;
	}
</script>

<PageHeader title="Manual Tasks" description="Manage manual provisioning tasks" />

<!-- Dashboard Metrics -->
<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
	<DashboardMetricCard label="Pending" value={data.dashboard.pending_count} variant="warning" />
	<DashboardMetricCard label="In Progress" value={data.dashboard.in_progress_count} />
	<DashboardMetricCard label="SLA At Risk" value={data.dashboard.sla_at_risk_count} variant="warning" />
	<DashboardMetricCard label="SLA Breached" value={data.dashboard.sla_breached_count} variant="danger" />
	<DashboardMetricCard label="Completed Today" value={data.dashboard.completed_today} variant="success" />
	<DashboardMetricCard label="Avg Completion" value={formatCompletionTime(data.dashboard.average_completion_time_seconds)} />
</div>

<!-- Filters -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={statusFilter}
		onchange={applyFilters}
	>
		<option value="">All Statuses</option>
		<option value="pending">Pending</option>
		<option value="in_progress">In Progress</option>
		<option value="completed">Completed</option>
		<option value="rejected">Rejected</option>
		<option value="cancelled">Cancelled</option>
	</select>

	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={slaBreachedFilter}
		onchange={applyFilters}
	>
		<option value="">SLA Status</option>
		<option value="true">Breached</option>
		<option value="false">Not Breached</option>
	</select>
</div>

<!-- Task List -->
{#if data.tasks.items.length === 0}
	<EmptyState
		title="No manual tasks"
		description="No manual provisioning tasks match the current filters."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Application</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Entitlement</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Operation</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Assignee</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">SLA</th>
				</tr>
			</thead>
			<tbody>
				{#each data.tasks.items as task}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3">
							<a href="/governance/manual-tasks/{task.id}" class="font-medium text-primary hover:underline">
								{task.application_name ?? task.application_id}
							</a>
						</td>
						<td class="px-4 py-3 text-foreground">{task.user_name ?? task.user_id}</td>
						<td class="px-4 py-3 text-foreground">{task.entitlement_name ?? task.entitlement_id}</td>
						<td class="px-4 py-3"><OperationTypeBadge operationType={task.operation_type} /></td>
						<td class="px-4 py-3"><TaskStatusBadge status={task.status} /></td>
						<td class="px-4 py-3 text-foreground">{task.assignee_name ?? task.assignee_id ?? '—'}</td>
						<td class="px-4 py-3">
							<SlaIndicator
								slaDeadline={task.sla_deadline}
								slaBreached={task.sla_breached}
								slaWarningSent={task.sla_warning_sent}
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if data.tasks.total > data.tasks.limit}
		<div class="mt-4 flex items-center justify-between text-sm text-muted-foreground">
			<span>Showing {data.tasks.offset + 1}–{Math.min(data.tasks.offset + data.tasks.limit, data.tasks.total)} of {data.tasks.total}</span>
			<div class="flex gap-2">
				{#if data.tasks.offset > 0}
					<a
						href="/governance/manual-tasks?offset={data.tasks.offset - data.tasks.limit}&limit={data.tasks.limit}{statusFilter ? `&status=${statusFilter}` : ''}{slaBreachedFilter ? `&sla_breached=${slaBreachedFilter}` : ''}"
						class="rounded-md border border-input px-3 py-1 hover:bg-accent"
					>Previous</a>
				{/if}
				{#if data.tasks.offset + data.tasks.limit < data.tasks.total}
					<a
						href="/governance/manual-tasks?offset={data.tasks.offset + data.tasks.limit}&limit={data.tasks.limit}{statusFilter ? `&status=${statusFilter}` : ''}{slaBreachedFilter ? `&sla_breached=${slaBreachedFilter}` : ''}"
						class="rounded-md border border-input px-3 py-1 hover:bg-accent"
					>Next</a>
				{/if}
			</div>
		</div>
	{/if}
{/if}
