<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PeerGroupNameLink from './peer-group-name-link.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PeerGroup } from '$lib/api/types';

	const columnHelper = createColumnHelper<PeerGroup>();
	const columns = [
		columnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(PeerGroupNameLink, { name: info.getValue(), id: info.row.original.id })
		}),
		columnHelper.accessor('group_type', {
			header: 'Type',
			cell: (info) => {
				const labels: Record<string, string> = {
					department: 'Department',
					role: 'Role',
					location: 'Location',
					custom: 'Custom'
				};
				return labels[info.getValue()] ?? info.getValue();
			}
		}),
		columnHelper.accessor('attribute_key', {
			header: 'Attribute',
			cell: (info) => info.getValue()
		}),
		columnHelper.accessor('attribute_value', {
			header: 'Value',
			cell: (info) => info.getValue()
		}),
		columnHelper.accessor('user_count', {
			header: 'Users',
			cell: (info) => String(info.getValue())
		}),
		columnHelper.accessor('avg_entitlements', {
			header: 'Avg Entitlements',
			cell: (info) => {
				const val = info.getValue();
				return val !== null ? val.toFixed(1) : '—';
			}
		}),
		columnHelper.accessor('updated_at', {
			header: 'Updated',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<PeerGroup>[];

	let data: PeerGroup[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let isLoading: boolean = $state(false);
	let groupTypeFilter: string = $state('');
	let refreshingAll: boolean = $state(false);

	const groupTypeOptions = [
		{ value: '', label: 'All types' },
		{ value: 'department', label: 'Department' },
		{ value: 'role', label: 'Role' },
		{ value: 'location', label: 'Location' },
		{ value: 'custom', label: 'Custom' }
	];

	async function fetchPeerGroups() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (groupTypeFilter) params.set('group_type', groupTypeFilter);
			const res = await fetch(`/api/governance/peer-groups?${params}`);
			if (!res.ok) throw new Error('Failed to fetch');
			const result = await res.json();
			data = result.items;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load peer groups');
		} finally {
			isLoading = false;
		}
	}

	async function refreshAll() {
		refreshingAll = true;
		try {
			const res = await fetch('/api/governance/peer-groups/refresh-all', { method: 'POST' });
			if (!res.ok) throw new Error('Failed');
			const result = await res.json();
			addToast('success', `Refreshed ${result.groups_refreshed} groups (${result.users_processed} users processed)`);
			fetchPeerGroups();
		} catch {
			addToast('error', 'Failed to refresh peer groups');
		} finally {
			refreshingAll = false;
		}
	}

	function handlePaginationChange(updater: Updater<PaginationState>) {
		pagination = typeof updater === 'function' ? updater(pagination) : updater;
	}

	$effect(() => {
		void pagination;
		void groupTypeFilter;
		fetchPeerGroups();
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Peer Groups"
		description="Manage peer groups for outlier detection comparison"
	/>
	<div class="flex gap-2">
		<button
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
			onclick={refreshAll}
			disabled={refreshingAll}
		>
			{refreshingAll ? 'Refreshing...' : 'Refresh All'}
		</button>
		<a
			href="/governance/peer-groups/create"
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
		>
			Create Peer Group
		</a>
	</div>
</div>

<div class="mb-4 flex gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={groupTypeFilter}
		onchange={() => { pagination = { ...pagination, pageIndex: 0 }; }}
	>
		{#each groupTypeOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

{#snippet emptyState()}
	<EmptyState title="No peer groups" description="Create peer groups to enable access pattern comparison." icon="users" />
{/snippet}

<DataTable {columns} {data} {pageCount} {pagination} onPaginationChange={handlePaginationChange} {isLoading} {emptyState} />
