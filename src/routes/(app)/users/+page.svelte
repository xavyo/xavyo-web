<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { UserResponse, UserListResponse } from '$lib/api/types';
	import UserStatusBadge from './user-status-badge.svelte';
	import UserEmailLink from './user-email-link.svelte';

	const columnHelper = createColumnHelper<UserResponse>();

	const columns = [
		columnHelper.accessor('email', {
			header: 'Email',
			cell: (info) =>
				renderComponent(UserEmailLink, {
					email: info.getValue(),
					href: `/users/${info.row.original.id}`
				})
		}),
		columnHelper.accessor('is_active', {
			header: 'Status',
			cell: (info) =>
				renderComponent(UserStatusBadge, { isActive: info.getValue() })
		}),
		columnHelper.accessor('roles', {
			header: 'Roles',
			cell: (info) => info.getValue().join(', ')
		}),
		columnHelper.accessor('email_verified', {
			header: 'Verified',
			cell: (info) => (info.getValue() ? 'Yes' : 'No')
		}),
		columnHelper.accessor('created_at', {
			header: 'Created',
			cell: (info) => new Date(info.getValue()).toLocaleDateString()
		})
	] as ColumnDef<UserResponse>[];

	let data: UserResponse[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let searchValue: string = $state('');
	let isLoading: boolean = $state(false);
	let hasSearchFilter = $derived(searchValue.length > 0);

	async function fetchUsers() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (searchValue) {
				params.set('email', searchValue);
			}

			const response = await fetch(`/api/users?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch users');
			}

			const result: UserListResponse = await response.json();
			data = result.users;
			pageCount = Math.ceil(result.pagination.total_count / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load users');
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
		fetchUsers();
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Users" description="Manage users in your organization" />
	<a
		href="/users/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create user
	</a>
</div>

{#snippet emptyState()}
	{#if hasSearchFilter}
		<EmptyState
			title="No users match your search"
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
			title="No users yet"
			description="Create your first user to get started."
			icon="👥"
			actionLabel="Create user"
			actionHref="/users/create"
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
