<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { NhiIdentityResponse, NhiListResponse } from '$lib/api/types';
	import NhiNameLink from './nhi-name-link.svelte';
	import NhiTypeBadge from './nhi-type-badge.svelte';
	import NhiStateBadge from './nhi-state-badge.svelte';

	const columnHelper = createColumnHelper<NhiIdentityResponse>();

	const columns = [
		columnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(NhiNameLink, {
					name: info.getValue(),
					id: info.row.original.id,
					nhiType: info.row.original.nhi_type
				})
		}),
		columnHelper.accessor('nhi_type', {
			header: 'Type',
			cell: (info) =>
				renderComponent(NhiTypeBadge, { type: info.getValue() })
		}),
		columnHelper.accessor('lifecycle_state', {
			header: 'State',
			cell: (info) =>
				renderComponent(NhiStateBadge, { state: info.getValue() })
		}),
		columnHelper.accessor('description', {
			header: 'Description',
			cell: (info) => {
				const val = info.getValue();
				if (!val) return '—';
				return val.length > 60 ? val.substring(0, 60) + '…' : val;
			}
		}),
		columnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<NhiIdentityResponse>[];

	let data: NhiIdentityResponse[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let isLoading: boolean = $state(false);

	// Filters
	let nhiTypeFilter: string = $state('');
	let lifecycleStateFilter: string = $state('');
	let hasFilters = $derived(nhiTypeFilter !== '' || lifecycleStateFilter !== '');

	const nhiTypeOptions = [
		{ value: '', label: 'All types' },
		{ value: 'tool', label: 'Tool' },
		{ value: 'agent', label: 'Agent' },
		{ value: 'service_account', label: 'Service Account' }
	];

	const lifecycleStateOptions = [
		{ value: '', label: 'All states' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'suspended', label: 'Suspended' },
		{ value: 'deprecated', label: 'Deprecated' },
		{ value: 'archived', label: 'Archived' }
	];

	async function fetchNhi() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (nhiTypeFilter) {
				params.set('nhi_type', nhiTypeFilter);
			}
			if (lifecycleStateFilter) {
				params.set('lifecycle_state', lifecycleStateFilter);
			}

			const response = await fetch(`/api/nhi?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch NHI');
			}

			const result: NhiListResponse = await response.json();
			data = result.data;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load non-human identities');
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

	// Fetch NHI when filters or pagination change
	$effect(() => {
		void pagination;
		void nhiTypeFilter;
		void lifecycleStateFilter;
		fetchNhi();
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Non-Human Identities" description="Manage tools, agents, and service accounts" />
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
		>
			Create NHI
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item>
				<a href="/nhi/tools/create" class="w-full">Tool</a>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<a href="/nhi/agents/create" class="w-full">Agent</a>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<a href="/nhi/service-accounts/create" class="w-full">Service Account</a>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<div class="mb-4 flex gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={nhiTypeFilter}
		onchange={() => { pagination = { ...pagination, pageIndex: 0 }; }}
	>
		{#each nhiTypeOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>

	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={lifecycleStateFilter}
		onchange={() => { pagination = { ...pagination, pageIndex: 0 }; }}
	>
		{#each lifecycleStateOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

{#snippet emptyState()}
	{#if hasFilters}
		<EmptyState
			title="No identities match your filters"
			description="Try adjusting your filter criteria."
			icon="🔍"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => { nhiTypeFilter = ''; lifecycleStateFilter = ''; }}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No non-human identities yet"
			description="Create your first tool, agent, or service account."
			icon="🤖"
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
