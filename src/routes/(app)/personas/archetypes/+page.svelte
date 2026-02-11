<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { ArchetypeResponse, ArchetypeListResponse } from '$lib/api/types';
	import ArchetypeStatusBadge from '../archetype-status-badge.svelte';
	import ArchetypeNameLink from '../archetype-name-link.svelte';

	const columnHelper = createColumnHelper<ArchetypeResponse>();

	const columns = [
		columnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(ArchetypeNameLink, {
					name: info.getValue(),
					href: `/personas/archetypes/${info.row.original.id}`
				})
		}),
		columnHelper.accessor('description', {
			header: 'Description',
			cell: (info) => {
				const val = info.getValue();
				if (!val) return '—';
				return val.length > 80 ? val.slice(0, 80) + '…' : val;
			}
		}),
		columnHelper.accessor('is_active', {
			header: 'Status',
			cell: (info) =>
				renderComponent(ArchetypeStatusBadge, { isActive: info.getValue() })
		}),
		columnHelper.accessor('personas_count', {
			header: 'Personas',
			cell: (info) => String(info.getValue() ?? 0)
		}),
		columnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<ArchetypeResponse>[];

	let data: ArchetypeResponse[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let searchValue: string = $state('');
	let isLoading: boolean = $state(false);
	let hasSearchFilter = $derived(searchValue.length > 0);

	async function fetchArchetypes() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (searchValue) {
				params.set('name_contains', searchValue);
			}

			const response = await fetch(`/api/archetypes?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch archetypes');
			}

			const result: ArchetypeListResponse = await response.json();
			data = result.items;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load archetypes');
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

	function handleSearchChange(value: string) {
		searchValue = value;
		pagination = { ...pagination, pageIndex: 0 };
	}

	$effect(() => {
		void pagination;
		void searchValue;
		fetchArchetypes();
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Archetypes" description="Manage persona archetypes" />
	<a
		href="/personas/archetypes/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create archetype
	</a>
</div>

{#snippet emptyState()}
	{#if hasSearchFilter}
		<EmptyState
			title="No archetypes match your search"
			description="Try adjusting your search term."
			icon="🔍"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => handleSearchChange('')}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear search
			</button>
		</div>
	{:else}
		<EmptyState
			title="No archetypes yet"
			description="Create your first archetype to get started."
			icon="🏛️"
			actionLabel="Create archetype"
			actionHref="/personas/archetypes/create"
		/>
	{/if}
{/snippet}

<DataTable
	{columns}
	{data}
	{pageCount}
	{pagination}
	onPaginationChange={handlePaginationChange}
	{searchValue}
	onSearchChange={handleSearchChange}
	{isLoading}
	{emptyState}
/>
