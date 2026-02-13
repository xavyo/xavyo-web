<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { OAuthClient } from '$lib/api/types';
	import OAuthClientNameLink from './oauth-client-name-link.svelte';
	import OAuthClientStatusBadge from './oauth-client-status-badge.svelte';
	import OAuthClientTypeBadge from './oauth-client-type-badge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const columnHelper = createColumnHelper<OAuthClient>();

	const columns = [
		columnHelper.accessor('name', {
			header: 'Name',
			cell: (info) =>
				renderComponent(OAuthClientNameLink, {
					name: info.getValue(),
					id: info.row.original.id
				})
		}),
		columnHelper.accessor('client_id', {
			header: 'Client ID',
			cell: (info) => {
				const val = info.getValue();
				return val.length > 20 ? val.substring(0, 20) + '...' : val;
			}
		}),
		columnHelper.accessor('client_type', {
			header: 'Type',
			cell: (info) =>
				renderComponent(OAuthClientTypeBadge, { clientType: info.getValue() })
		}),
		columnHelper.accessor('grant_types', {
			header: 'Grant Types',
			cell: (info) => info.getValue().join(', ')
		}),
		columnHelper.accessor('is_active', {
			header: 'Status',
			cell: (info) =>
				renderComponent(OAuthClientStatusBadge, { isActive: info.getValue() })
		})
	] as ColumnDef<OAuthClient>[];

	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 50 });

	function handlePaginationChange(updater: Updater<PaginationState>) {
		if (typeof updater === 'function') {
			pagination = updater(pagination);
		} else {
			pagination = updater;
		}
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="OAuth Clients"
		description="Manage registered OAuth/OIDC client applications"
	/>
	<a
		href="/settings/oauth-clients/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create Client
	</a>
</div>

{#snippet emptyState()}
	<EmptyState
		title="No OAuth clients"
		description="Create your first OAuth client application to get started."
		icon="🔑"
	/>
{/snippet}

<DataTable
	{columns}
	data={data.clients}
	pageCount={1}
	{pagination}
	onPaginationChange={handlePaginationChange}
	{emptyState}
/>
