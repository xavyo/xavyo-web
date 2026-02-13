<script lang="ts">
	import { goto } from '$app/navigation';
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { UserGroup } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const columnHelper = createColumnHelper<UserGroup>();

	const columns = [
		columnHelper.accessor('display_name', {
			header: 'Name',
			cell: (info) => info.getValue()
		}),
		columnHelper.accessor('description', {
			header: 'Description',
			cell: (info) => {
				const val = info.getValue();
				if (!val) return '\u2014';
				return val.length > 80 ? val.slice(0, 80) + '...' : val;
			}
		}),
		columnHelper.accessor('group_type', {
			header: 'Type',
			cell: (info) => info.getValue()
		})
	] as ColumnDef<UserGroup>[];

	let groups = $derived(data.groups);

	let pageCount = $derived(
		data.pagination.has_more
			? Math.ceil(
					(data.pagination.offset + data.pagination.limit + 1) / data.pagination.limit
				)
			: Math.max(
					1,
					Math.ceil(
						(data.pagination.offset + data.groups.length) / data.pagination.limit
					)
				)
	);

	let pagination: PaginationState = $state({
		pageIndex: 0,
		pageSize: 20
	});

	// Sync pagination from SSR data
	$effect(() => {
		pagination = {
			pageIndex: Math.floor(data.pagination.offset / data.pagination.limit),
			pageSize: data.pagination.limit
		};
	});

	let isLoading: boolean = $state(false);

	function handlePaginationChange(updater: Updater<PaginationState>) {
		const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
		if (
			newPagination.pageIndex !== pagination.pageIndex ||
			newPagination.pageSize !== pagination.pageSize
		) {
			pagination = newPagination;

			const url = new URL(window.location.href);
			url.searchParams.set('offset', String(newPagination.pageIndex * newPagination.pageSize));
			url.searchParams.set('limit', String(newPagination.pageSize));

			isLoading = true;
			goto(url.toString(), { invalidateAll: true, noScroll: true }).finally(() => {
				isLoading = false;
			});
		}
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Groups" description="Manage user groups in your organization" />
	<a
		href="/groups/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create Group
	</a>
</div>

{#snippet emptyState()}
	<EmptyState
		title="No groups yet"
		description="Create your first group to get started."
		icon="👥"
		actionLabel="Create Group"
		actionHref="/groups/create"
	/>
{/snippet}

<DataTable
	{columns}
	data={groups}
	{pageCount}
	{pagination}
	onPaginationChange={handlePaginationChange}
	{isLoading}
	{emptyState}
/>

{#if groups.length > 0}
	<div class="sr-only">
		{#each groups as group}
			<a href="/groups/{group.id}">{group.display_name}</a>
		{/each}
	</div>
{/if}
