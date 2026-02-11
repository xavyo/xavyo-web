<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { AccessRequestResponse, AccessRequestListResponse } from '$lib/api/types';
	import AccessRequestStatusBadge from './access-request-status-badge.svelte';
	import CancelButton from './cancel-button.svelte';

	const columnHelper = createColumnHelper<AccessRequestResponse>();

	const columns = [
		columnHelper.accessor('entitlement_id', {
			header: 'Entitlement',
			cell: (info) => {
				const val = info.getValue();
				return val.length > 12 ? val.substring(0, 12) + '...' : val;
			}
		}),
		columnHelper.accessor('status', {
			header: 'Status',
			cell: (info) =>
				renderComponent(AccessRequestStatusBadge, { status: info.getValue() })
		}),
		columnHelper.accessor('justification', {
			header: 'Justification',
			cell: (info) => {
				const val = info.getValue();
				return val.length > 50 ? val.substring(0, 50) + '...' : val;
			}
		}),
		columnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		}),
		columnHelper.display({
			id: 'actions',
			header: '',
			cell: (info) => {
				const row = info.row.original;
				if (row.status === 'pending' || row.status === 'pending_approval') {
					return renderComponent(CancelButton, {
						requestId: row.id,
						onCancel: () => fetchRequests()
					});
				}
				return '';
			}
		})
	] as ColumnDef<AccessRequestResponse>[];

	let data: AccessRequestResponse[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let isLoading: boolean = $state(false);
	let statusFilter: string = $state('');

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'pending_approval', label: 'Pending Approval' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'provisioned', label: 'Provisioned' },
		{ value: 'rejected', label: 'Rejected' },
		{ value: 'cancelled', label: 'Cancelled' },
		{ value: 'expired', label: 'Expired' },
		{ value: 'failed', label: 'Failed' }
	];

	async function fetchRequests() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (statusFilter) {
				params.set('status', statusFilter);
			}

			const response = await fetch(`/api/governance/access-requests?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch access requests');
			}

			const result: AccessRequestListResponse = await response.json();
			data = result.items;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load access requests');
		} finally {
			isLoading = false;
		}
	}

	function handlePaginationChange(updater: Updater<PaginationState>) {
		if (typeof updater === 'function') {
			pagination = updater(pagination);
		} else {
			pagination = updater;
		}
	}

	$effect(() => {
		void pagination;
		void statusFilter;
		fetchRequests();
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader title="My Requests" description="View and manage your access requests" />
	<a
		href="/my-requests/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		New Request
	</a>
</div>

<div class="mb-4 flex gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={statusFilter}
		onchange={() => {
			pagination = { ...pagination, pageIndex: 0 };
		}}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

{#snippet emptyState()}
	{#if statusFilter}
		<EmptyState
			title="No requests match your filter"
			description="Try adjusting your filter criteria."
			icon="🔍"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					statusFilter = '';
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filter
			</button>
		</div>
	{:else}
		<EmptyState
			title="No access requests yet"
			description="Submit your first access request to get started."
			icon="📋"
		/>
	{/if}
{/snippet}

<DataTable
	{columns}
	{data}
	{pageCount}
	{pagination}
	onPaginationChange={handlePaginationChange}
	{isLoading}
	{emptyState}
/>
