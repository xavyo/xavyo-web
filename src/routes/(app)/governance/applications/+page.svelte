<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import StatusBadge from '../status-badge.svelte';
	import ApplicationNameLink from '../application-name-link.svelte';
	import type { ApplicationResponse, ApplicationListResponse } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const columnHelper = createColumnHelper<ApplicationResponse>();
	const columns = [
		columnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(ApplicationNameLink, { name: info.getValue(), id: info.row.original.id })
		}),
		columnHelper.accessor('app_type', {
			header: 'Type',
			cell: (info) => {
				const val = info.getValue();
				return val === 'internal' ? 'Internal' : 'External';
			}
		}),
		columnHelper.accessor('status', {
			header: 'Status',
			cell: (info) => renderComponent(StatusBadge, { status: info.getValue() })
		}),
		columnHelper.accessor('description', {
			header: 'Description',
			cell: (info) => {
				const val = info.getValue();
				if (!val) return '';
				return val.length > 60 ? val.substring(0, 60) + '...' : val;
			}
		}),
		columnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<ApplicationResponse>[];

	let appData: ApplicationResponse[] = $state(data.applications);
	let pageCount: number = $state(Math.ceil(data.total / data.limit));
	let pagination: PaginationState = $state({ pageIndex: Math.floor(data.offset / data.limit), pageSize: data.limit });
	let loading: boolean = $state(false);
	let statusFilter: string = $state('');
	let typeFilter: string = $state('');

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' }
	];

	const typeOptions = [
		{ value: '', label: 'All types' },
		{ value: 'internal', label: 'Internal' },
		{ value: 'external', label: 'External' }
	];

	async function fetchApplications() {
		loading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (statusFilter) params.set('status', statusFilter);
			if (typeFilter) params.set('app_type', typeFilter);
			const response = await fetch(`/api/governance/applications?${params}`);
			if (!response.ok) throw new Error('Failed to fetch');
			const result: ApplicationListResponse = await response.json();
			appData = result.items;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load applications');
		} finally {
			loading = false;
		}
	}

	function handlePaginationChange(updater: Updater<PaginationState>) {
		pagination = typeof updater === 'function' ? updater(pagination) : updater;
	}

	$effect(() => {
		void pagination;
		void statusFilter;
		void typeFilter;
		fetchApplications();
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Applications"
		description="Manage governance applications"
	/>
</div>

<div class="mb-4 flex items-center justify-between">
	<div class="flex gap-3">
		<select
			class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			bind:value={statusFilter}
			onchange={() => { pagination = { ...pagination, pageIndex: 0 }; }}
		>
			{#each statusOptions as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<select
			class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			bind:value={typeFilter}
			onchange={() => { pagination = { ...pagination, pageIndex: 0 }; }}
		>
			{#each typeOptions as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
	</div>
	<a
		href="/governance/applications/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create application
	</a>
</div>

{#snippet emptyState()}
	{#if statusFilter || typeFilter}
		<EmptyState title="No applications match your filters" description="Try adjusting your filter criteria." icon="🔍" />
		<div class="flex justify-center pb-4">
			<button onclick={() => { statusFilter = ''; typeFilter = ''; }} class="text-sm font-medium text-primary hover:underline">Clear filters</button>
		</div>
	{:else}
		<EmptyState title="No applications yet" description="Create your first application to start managing entitlements." icon="📦" />
	{/if}
{/snippet}

<DataTable {columns} data={appData} {pageCount} {pagination} onPaginationChange={handlePaginationChange} isLoading={loading} {emptyState} />
