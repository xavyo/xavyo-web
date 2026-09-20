<script lang="ts">
	import { createColumnHelper } from '@tanstack/table-core';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderComponent } from '@tanstack/svelte-table';
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import DataTable from '$lib/components/data-table/data-table.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/stores/toast.svelte';
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

<PageHeader title="Applications"
		description="OAuth/OIDC apps for this workspace. Free plan includes developer OIDC clients — set exact redirect URIs for your app.">
	<a
		href="/settings/oauth-clients/create"
		class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
	>
		Create application
	</a>
</PageHeader>

{#if data.issuerUrl}
	<div class="mb-6 rounded-lg border border-border bg-muted/30 p-4">
		<h3 class="text-sm font-semibold">OIDC endpoints</h3>
		<p class="mt-1 text-sm text-muted-foreground">
			Point your app at this issuer. Register exact redirect URIs on each application (signup
			creates a default client you can edit).
		</p>
		<div class="mt-3 space-y-3">
			<div class="space-y-1">
				<span class="text-xs font-medium text-muted-foreground">Issuer</span>
				<div class="flex items-center gap-2">
					<code class="flex-1 overflow-x-auto rounded bg-background px-3 py-2 text-sm">
						{data.issuerUrl}
					</code>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => {
							navigator.clipboard.writeText(data.issuerUrl!);
							addToast('success', 'Issuer URL copied');
						}}
					>
						Copy
					</Button>
				</div>
			</div>
			{#if data.discoveryUrl}
				<div class="space-y-1">
					<span class="text-xs font-medium text-muted-foreground">OpenID configuration URL</span>
					<div class="flex items-center gap-2">
						<code class="flex-1 overflow-x-auto rounded bg-background px-3 py-2 text-sm">
							{data.discoveryUrl}
						</code>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => {
								navigator.clipboard.writeText(data.discoveryUrl!);
								addToast('success', 'OpenID configuration URL copied');
							}}
						>
							Copy
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#snippet emptyState()}
	<EmptyState
		title="No applications yet"
		description="Register an OAuth/OIDC application so your app can sign users in with this workspace."
		actionLabel="Create application"
		actionHref="/settings/oauth-clients/create"
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
