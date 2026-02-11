<script lang="ts" generics="TData">
	import {
		createTable,
		FlexRender,
		getCoreRowModel
	} from '@tanstack/svelte-table';
	import type { ColumnDef, PaginationState, OnChangeFn } from '@tanstack/svelte-table';
	import type { Snippet } from 'svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import DataTablePagination from './data-table-pagination.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';

	let {
		columns,
		data,
		pageCount,
		pagination,
		onPaginationChange,
		searchValue,
		onSearchChange,
		isLoading = false,
		emptyMessage = 'No results found',
		emptyState,
		skeletonRows = 5
	}: {
		columns: ColumnDef<TData, unknown>[];
		data: TData[];
		pageCount: number;
		pagination: PaginationState;
		onPaginationChange: OnChangeFn<PaginationState>;
		searchValue?: string;
		onSearchChange?: (value: string) => void;
		isLoading?: boolean;
		emptyMessage?: string;
		emptyState?: Snippet;
		skeletonRows?: number;
	} = $props();

	const table = createTable({
		get columns() {
			return columns;
		},
		get data() {
			return data;
		},
		get pageCount() {
			return pageCount;
		},
		state: {
			get pagination() {
				return pagination;
			}
		},
		get onPaginationChange() {
			return onPaginationChange;
		},
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true
	});
</script>

<div>
	{#if onSearchChange}
		<DataTableToolbar
			value={searchValue}
			onchange={onSearchChange}
			placeholder="Search..."
		/>
	{/if}

	<div class="overflow-x-auto rounded-md border">
		<table class="w-full caption-bottom text-sm">
			<thead class="[&_tr]:border-b">
				{#each table.getHeaderGroups() as headerGroup}
					<tr class="border-b transition-colors hover:bg-muted/50">
						{#each headerGroup.headers as header}
							<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody class="[&_tr:last-child]:border-0">
				{#if isLoading}
					{#each Array(skeletonRows) as _}
						<tr class="border-b">
							{#each columns as _col}
								<td class="p-4 align-middle">
									<Skeleton class="h-4 w-full" />
								</td>
							{/each}
						</tr>
					{/each}
				{:else if data.length === 0}
					<tr>
						<td colspan={columns.length} class="p-0">
							{#if emptyState}
								{@render emptyState()}
							{:else}
								<div class="flex h-24 items-center justify-center text-muted-foreground">
									{emptyMessage}
								</div>
							{/if}
						</td>
					</tr>
				{:else}
					{#each table.getRowModel().rows as row}
						<tr class="border-b transition-colors hover:bg-muted/50">
							{#each row.getVisibleCells() as cell}
								<td class="p-4 align-middle">
									<FlexRender
										content={cell.column.columnDef.cell}
										context={cell.getContext()}
									/>
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<DataTablePagination
		pageIndex={table.getState().pagination.pageIndex}
		pageCount={table.getPageCount()}
		canPreviousPage={table.getCanPreviousPage()}
		canNextPage={table.getCanNextPage()}
		onPreviousPage={() => table.previousPage()}
		onNextPage={() => table.nextPage()}
	/>
</div>
