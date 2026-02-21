<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { NhiIdentityResponse, NhiListResponse } from '$lib/api/types';
	import { relativeTime } from '$lib/utils/relative-time';
	import NhiNameLink from '../nhi-name-link.svelte';
	import NhiStateBadge from '../nhi-state-badge.svelte';

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
		columnHelper.accessor('risk_score', {
			header: 'Risk Score',
			cell: (info) => String(info.getValue())
		}),
		columnHelper.accessor('last_activity_at', {
			header: 'Last Activity',
			cell: (info) => relativeTime(info.getValue())
		}),
		columnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<NhiIdentityResponse>[];

	let tableData: NhiIdentityResponse[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let isLoading: boolean = $state(false);

	// Lifecycle state filter
	let lifecycleStateFilter: string = $state('');
	let hasFilters = $derived(lifecycleStateFilter !== '');

	const lifecycleStateOptions = [
		{ value: '', label: 'All states' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'suspended', label: 'Suspended' },
		{ value: 'deprecated', label: 'Deprecated' },
		{ value: 'archived', label: 'Archived' }
	];

	async function fetchAgents() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize),
				nhi_type: 'agent'
			});
			if (lifecycleStateFilter) {
				params.set('lifecycle_state', lifecycleStateFilter);
			}

			const response = await fetch(`/api/nhi?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch agents');
			}

			const result: NhiListResponse = await response.json();
			tableData = result.data;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load agents');
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

	// Fetch agents when filters or pagination change
	$effect(() => {
		void pagination;
		void lifecycleStateFilter;
		fetchAgents();
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader title="NHI Agents" description="Manage AI and automation agents" />
	<div class="flex items-center gap-2">
		<a
			href="/nhi"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to NHI
		</a>
		<a
			href="/nhi/agents/create"
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
		>
			Create Agent
		</a>
	</div>
</div>

<div class="mb-4 flex gap-3">
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
			title="No agents match your filters"
			description="Try adjusting your filter criteria."
			icon="🔍"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => { lifecycleStateFilter = ''; }}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No agents yet"
			description="Create your first AI or automation agent."
			icon="🤖"
		/>
	{/if}
{/snippet}

<DataTable
	{columns}
	data={tableData}
	{pageCount}
	{pagination}
	onPaginationChange={handlePaginationChange}
	{isLoading}
	{emptyState}
/>
