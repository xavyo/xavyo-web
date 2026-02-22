<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import QueueStatsCards from '$lib/components/operations/queue-stats-cards.svelte';
	import OperationStatusBadge from '$lib/components/operations/operation-status-badge.svelte';
	import OperationTypeBadge from '$lib/components/operations/operation-type-badge.svelte';
	import { fetchOperationStats } from '$lib/api/operations-client';
	import type { QueueStatistics } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let connectorFilter = $state('');
	let statusFilter = $state('');
	let typeFilter = $state('');
	let fromDate = $state('');
	let toDate = $state('');
	// svelte-ignore state_referenced_locally
	let stats = $state<QueueStatistics | null>(data.stats);

	const operations = $derived(data.operations.operations);
	const total = $derived(data.operations.total);
	const limit = $derived(data.operations.limit);
	const offset = $derived(data.operations.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));
	const hasFilters = $derived(
		connectorFilter !== '' || statusFilter !== '' || typeFilter !== '' || fromDate !== '' || toDate !== ''
	);

	$effect(() => {
		const url = new URL(window.location.href);
		connectorFilter = url.searchParams.get('connector_id') ?? '';
		statusFilter = url.searchParams.get('status') ?? '';
		typeFilter = url.searchParams.get('operation_type') ?? '';
		fromDate = url.searchParams.get('from_date') ?? '';
		toDate = url.searchParams.get('to_date') ?? '';
	});

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'dead_letter', label: 'Dead Letter' },
		{ value: 'awaiting_system', label: 'Awaiting System' },
		{ value: 'resolved', label: 'Resolved' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	const typeOptions = [
		{ value: '', label: 'All types' },
		{ value: 'create', label: 'Create' },
		{ value: 'update', label: 'Update' },
		{ value: 'delete', label: 'Delete' }
	];

	function buildUrl(overrides: Record<string, string | number | undefined> = {}): string {
		const params = new URLSearchParams();
		const cid = (overrides.connector_id as string) ?? connectorFilter;
		const st = (overrides.status as string) ?? statusFilter;
		const tp = (overrides.operation_type as string) ?? typeFilter;
		const fd = (overrides.from_date as string) ?? fromDate;
		const td = (overrides.to_date as string) ?? toDate;
		const off = overrides.offset ?? 0;
		if (cid) params.set('connector_id', cid);
		if (st) params.set('status', st);
		if (tp) params.set('operation_type', tp);
		if (fd) params.set('from_date', fd);
		if (td) params.set('to_date', td);
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/connectors/operations?${params}`;
	}

	function applyFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	async function onConnectorFilterChange() {
		applyFilter();
		try {
			stats = await fetchOperationStats(connectorFilter || undefined);
		} catch {
			// keep existing stats
		}
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Operations Queue" description="Monitor provisioning operations across all connectors" />
	<div class="flex gap-2">
		<a
			href="/connectors/operations/dlq"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Dead Letter Queue
		</a>
		<a
			href="/connectors/conflicts"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Conflicts
		</a>
	</div>
</div>

{#if stats}
	<div class="mb-6">
		<QueueStatsCards {stats} />
	</div>
{/if}

<div class="mb-4 flex flex-wrap gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={connectorFilter}
		onchange={onConnectorFilterChange}
	>
		<option value="">All connectors</option>
		{#each data.connectors as connector}
			<option value={connector.id}>{connector.name}</option>
		{/each}
	</select>
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={statusFilter}
		onchange={applyFilter}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={typeFilter}
		onchange={applyFilter}
	>
		{#each typeOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	<input
		type="date"
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={fromDate}
		onchange={applyFilter}
		placeholder="From date"
	/>
	<input
		type="date"
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={toDate}
		onchange={applyFilter}
		placeholder="To date"
	/>
</div>

{#if operations.length === 0}
	{#if hasFilters}
		<EmptyState
			title="No operations match your filters"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					connectorFilter = '';
					statusFilter = '';
					typeFilter = '';
					fromDate = '';
					toDate = '';
					goto('/connectors/operations?limit=' + limit + '&offset=0');
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No operations"
			description="No provisioning operations have been recorded yet."
			icon="inbox"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Connector</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Object Class</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Retries</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each operations as operation}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3">
							<OperationTypeBadge type={operation.operation_type} />
						</td>
						<td class="px-4 py-3">
							<OperationStatusBadge status={operation.status} />
						</td>
						<td class="px-4 py-3 text-muted-foreground">{operation.connector_name}</td>
						<td class="px-4 py-3">
							<a href="/connectors/operations/{operation.id}" class="text-primary hover:underline">
								{operation.object_class}
							</a>
						</td>
						<td class="px-4 py-3 text-muted-foreground">{operation.priority}</td>
						<td class="px-4 py-3 text-muted-foreground">{operation.retry_count}/{operation.max_retries}</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(operation.created_at)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} operations
			</p>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" disabled={currentPage === 0} onclick={() => goToPage(currentPage - 1)}>
					Previous
				</Button>
				<Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onclick={() => goToPage(currentPage + 1)}>
					Next
				</Button>
			</div>
		</div>
	{/if}
{/if}
