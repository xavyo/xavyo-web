<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import SeverityBadge from './severity-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { AlertSeverity } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let alerts = $derived(data.alerts);
	let summary = $derived(data.summary);

	let severityFilter = $state(data.filters.severity ?? '');
	let acknowledgedFilter = $state(data.filters.acknowledged !== undefined ? String(data.filters.acknowledged) : '');
	let deleteOpen = $state(false);
	let deleteAlertId = $state('');

	function applyFilters() {
		const params = new URLSearchParams();
		if (severityFilter) params.set('severity', severityFilter);
		if (acknowledgedFilter) params.set('acknowledged', acknowledgedFilter);
		const qs = params.toString();
		goto(`/governance/risk${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function openDeleteDialog(id: string) {
		deleteAlertId = id;
		deleteOpen = true;
	}

	function handleResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', `Alert ${result.data.action} successfully`);
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}

	function truncateId(id: string, length = 12): string {
		if (id.length <= length) return id;
		return id.slice(0, length) + '...';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}

	function getSeverityCount(sev: string): number {
		const entry = summary.unacknowledged.find((u: { severity: AlertSeverity; count: number }) => u.severity === sev);
		return entry?.count ?? 0;
	}
</script>

<PageHeader title="Risk Alerts Dashboard" description="Monitor and manage identity risk alerts across your organization">
	<div class="flex gap-2">
		<a href="/governance/risk/scores">
			<Button variant="outline">Scores</Button>
		</a>
		<a href="/governance/risk/factors">
			<Button variant="outline">Factors</Button>
		</a>
		<a href="/governance/risk/thresholds">
			<Button variant="outline">Thresholds</Button>
		</a>
	</div>
</PageHeader>

<!-- Summary Cards -->
<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<div class="rounded-lg border border-border bg-card p-4">
		<p class="text-sm font-medium text-muted-foreground">Total Unacknowledged</p>
		<p class="mt-1 text-2xl font-semibold text-foreground">{summary.total_unacknowledged}</p>
	</div>
	<div class="rounded-lg border border-border bg-card p-4">
		<p class="text-sm font-medium text-muted-foreground">Critical</p>
		<p class="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{getSeverityCount('critical')}</p>
	</div>
	<div class="rounded-lg border border-border bg-card p-4">
		<p class="text-sm font-medium text-muted-foreground">Warning</p>
		<p class="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{getSeverityCount('warning')}</p>
	</div>
	<div class="rounded-lg border border-border bg-card p-4">
		<p class="text-sm font-medium text-muted-foreground">Info</p>
		<p class="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">{getSeverityCount('info')}</p>
	</div>
</div>

<!-- Filters -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={severityFilter}
		onchange={applyFilters}
	>
		<option value="">All Severities</option>
		<option value="info">Info</option>
		<option value="warning">Warning</option>
		<option value="critical">Critical</option>
	</select>

	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={acknowledgedFilter}
		onchange={applyFilters}
	>
		<option value="">All Status</option>
		<option value="true">Acknowledged</option>
		<option value="false">Unacknowledged</option>
	</select>

	<span class="text-sm text-muted-foreground">
		{alerts.total} alert{alerts.total !== 1 ? 's' : ''} found
	</span>
</div>

{#if alerts.items.length === 0}
	<EmptyState
		title="No risk alerts"
		description="No risk alerts match the current filters. Alerts are generated when user risk scores exceed configured thresholds."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Severity</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">User ID</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Score at Alert</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Acknowledged</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created At</th>
					<th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each alerts.items as alert}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3">
							<SeverityBadge severity={alert.severity as AlertSeverity} />
						</td>
						<td class="px-4 py-3 font-mono text-xs text-foreground" title={alert.user_id}>
							{truncateId(alert.user_id)}
						</td>
						<td class="px-4 py-3 text-foreground">{alert.score_at_alert}</td>
						<td class="px-4 py-3">
							{#if alert.acknowledged}
								<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
									Yes
								</span>
							{:else}
								<span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-200">
									No
								</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(alert.created_at)}</td>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-1">
								{#if !alert.acknowledged}
									<form method="POST" action="?/acknowledge" use:enhance={() => ({ result }) => handleResult(result)}>
										<input type="hidden" name="id" value={alert.id} />
										<Button variant="outline" size="sm" type="submit">Acknowledge</Button>
									</form>
								{/if}
								<Button variant="destructive" size="sm" onclick={() => openDeleteDialog(alert.id)}>Delete</Button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination info -->
	{#if alerts.total > alerts.limit}
		<div class="mt-4 flex items-center justify-between text-sm text-muted-foreground">
			<span>
				Showing {alerts.offset + 1} - {Math.min(alerts.offset + alerts.limit, alerts.total)} of {alerts.total}
			</span>
			<div class="flex gap-2">
				{#if alerts.offset > 0}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (severityFilter) params.set('severity', severityFilter);
							if (acknowledgedFilter) params.set('acknowledged', acknowledgedFilter);
							params.set('offset', String(Math.max(0, alerts.offset - alerts.limit)));
							goto(`/governance/risk?${params.toString()}`, { replaceState: true });
						}}
					>
						Previous
					</Button>
				{/if}
				{#if alerts.offset + alerts.limit < alerts.total}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (severityFilter) params.set('severity', severityFilter);
							if (acknowledgedFilter) params.set('acknowledged', acknowledgedFilter);
							params.set('offset', String(alerts.offset + alerts.limit));
							goto(`/governance/risk?${params.toString()}`, { replaceState: true });
						}}
					>
						Next
					</Button>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Risk Alert</Dialog.Title>
			<Dialog.Description>Are you sure you want to delete this alert? This action cannot be undone.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/delete" use:enhance={() => {
			deleteOpen = false;
			return ({ result }) => handleResult(result);
		}}>
			<input type="hidden" name="id" value={deleteAlertId} />
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteOpen = false)}>Cancel</Button>
				<Button variant="destructive" type="submit">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
