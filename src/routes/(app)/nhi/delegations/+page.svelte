<script lang="ts">
	import type { NhiDelegationGrant } from '$lib/api/types';
	import { fetchDelegationGrants } from '$lib/api/nhi-delegations-client';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import DelegationStatusBadge from '$lib/components/nhi/delegation-status-badge.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Server-provided data (reactive to navigation)
	let serverGrants = $derived(data.grants as NhiDelegationGrant[]);
	let serverHasMore = $derived(data.hasMore as boolean);
	let needsFilter = $derived(data.needsFilter as boolean);
	let serverFilters = $derived(data.filters as { principal_id: string; actor_nhi_id: string; status: string });

	// Client-side accumulated state for Load More
	let additionalGrants = $state<NhiDelegationGrant[]>([]);
	let loadMoreHasMore = $state<boolean | null>(null);
	let isLoadingMore = $state(false);
	let loadMoreError = $state<string | null>(null);

	// Reset client accumulation when server data changes (new filter/navigation)
	$effect(() => {
		void serverGrants;
		additionalGrants = [];
		loadMoreHasMore = null;
		loadMoreError = null;
	});

	let allGrants = $derived([...serverGrants, ...additionalGrants]);
	let hasMore = $derived(loadMoreHasMore ?? serverHasMore);

	// Filter inputs — synced from server on navigation
	let principalIdFilter = $state('');
	let actorNhiIdFilter = $state('');
	let statusFilter = $state('');

	$effect(() => {
		principalIdFilter = serverFilters.principal_id;
		actorNhiIdFilter = serverFilters.actor_nhi_id;
		statusFilter = serverFilters.status;
	});

	function applyFilter() {
		const params = new URLSearchParams();
		if (principalIdFilter) params.set('principal_id', principalIdFilter);
		if (actorNhiIdFilter) params.set('actor_nhi_id', actorNhiIdFilter);
		if (statusFilter) params.set('status', statusFilter);
		goto(`/nhi/delegations?${params.toString()}`);
	}

	async function loadMore() {
		isLoadingMore = true;
		loadMoreError = null;
		try {
			const pageSize = 20;
			const result = await fetchDelegationGrants({
				principal_id: serverFilters.principal_id || undefined,
				actor_nhi_id: serverFilters.actor_nhi_id || undefined,
				status: serverFilters.status || undefined,
				limit: pageSize,
				offset: allGrants.length
			});
			additionalGrants = [...additionalGrants, ...result.data];
			loadMoreHasMore = result.data.length === pageSize;
		} catch (err: unknown) {
			loadMoreError = err instanceof Error ? err.message : 'Failed to load more grants';
		} finally {
			isLoadingMore = false;
		}
	}
</script>

<PageHeader title="NHI Delegation Grants" description="Manage RFC 8693 token exchange delegation grants">
	<a href="/nhi/delegations/create" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
		Create Grant
	</a>
</PageHeader>

<Card class="mb-6">
	<CardContent class="pt-4">
		<div class="flex flex-wrap items-end gap-3">
			<div class="space-y-1">
				<Label for="principal_id">Principal ID</Label>
				<Input id="principal_id" placeholder="User or NHI UUID" bind:value={principalIdFilter} class="w-64" />
			</div>
			<div class="space-y-1">
				<Label for="actor_nhi_id">Actor NHI ID</Label>
				<Input id="actor_nhi_id" placeholder="Actor NHI UUID" bind:value={actorNhiIdFilter} class="w-64" />
			</div>
			<div class="space-y-1">
				<Label for="status">Status</Label>
				<select id="status" class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" bind:value={statusFilter}>
					<option value="">All statuses</option>
					<option value="active">Active</option>
					<option value="expired">Expired</option>
					<option value="revoked">Revoked</option>
				</select>
			</div>
			<Button onclick={applyFilter}>Search</Button>
		</div>
		<p class="mt-2 text-xs text-muted-foreground">At least one of Principal ID or Actor NHI ID is required.</p>
	</CardContent>
</Card>

{#if needsFilter}
	<EmptyState title="Enter a filter" description="Please provide a Principal ID or Actor NHI ID to search for delegation grants." />
{:else if allGrants.length === 0}
	<EmptyState title="No delegation grants found" description="No delegation grants match your filters." actionLabel="Create Grant" actionHref="/nhi/delegations/create" />
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Principal</th>
					<th class="px-4 py-3 text-left font-medium">Type</th>
					<th class="px-4 py-3 text-left font-medium">Actor NHI</th>
					<th class="px-4 py-3 text-left font-medium">Scopes</th>
					<th class="px-4 py-3 text-left font-medium">Status</th>
					<th class="px-4 py-3 text-left font-medium">Granted</th>
					<th class="px-4 py-3 text-left font-medium">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each allGrants as grant}
					<tr class="border-b hover:bg-muted/30">
						<td class="max-w-[150px] truncate px-4 py-3 font-mono text-xs">{grant.principal_id}</td>
						<td class="px-4 py-3">{grant.principal_type}</td>
						<td class="max-w-[150px] truncate px-4 py-3 font-mono text-xs">{grant.actor_nhi_id}</td>
						<td class="max-w-[150px] truncate px-4 py-3 text-muted-foreground">{grant.allowed_scopes.length > 0 ? grant.allowed_scopes.join(', ') : 'All'}</td>
						<td class="px-4 py-3"><DelegationStatusBadge status={grant.status} /></td>
						<td class="px-4 py-3 text-muted-foreground">{new Date(grant.granted_at).toLocaleDateString()}</td>
						<td class="px-4 py-3">
							<a href="/nhi/delegations/{grant.id}" class="text-sm text-primary hover:underline">View</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if loadMoreError}
		<p class="mt-4 text-center text-sm text-destructive">{loadMoreError}</p>
	{/if}

	{#if hasMore}
		<div class="mt-4 flex justify-center">
			<Button variant="outline" onclick={loadMore} disabled={isLoadingMore}>
				{isLoadingMore ? 'Loading...' : 'Load More'}
			</Button>
		</div>
	{/if}
{/if}
