<script lang="ts">
	import type { NhiAccessRequest } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import RequestStatusBadge from '$lib/components/nhi/request-status-badge.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let requests = $derived(data.requests as NhiAccessRequest[]);
	let summary = $derived(data.summary);
	let total = $derived(data.total as number);
	let isAdmin = $derived(data.isAdmin as boolean);

	let statusFilter = $state('');

	function applyFilter() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		goto(`/nhi/requests?${params.toString()}`);
	}
</script>

<PageHeader title="NHI Access Requests" description="Manage requests to create new non-human identities">
	<a href="/nhi/requests/create" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
		New Request
	</a>
</PageHeader>

{#if summary}
	<div class="mb-6 grid gap-4 sm:grid-cols-4">
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Pending</p>
				<p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.pending}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Approved</p>
				<p class="text-2xl font-bold text-green-600 dark:text-green-400">{summary.approved}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Rejected</p>
				<p class="text-2xl font-bold text-red-600 dark:text-red-400">{summary.rejected}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-4">
				<p class="text-sm text-muted-foreground">Cancelled</p>
				<p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.cancelled}</p>
			</CardContent>
		</Card>
	</div>
{/if}

<div class="mb-4 flex items-center gap-3">
	<select class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" bind:value={statusFilter} onchange={applyFilter}>
		<option value="">All statuses</option>
		<option value="pending">Pending</option>
		<option value="approved">Approved</option>
		<option value="rejected">Rejected</option>
		<option value="cancelled">Cancelled</option>
	</select>
</div>

{#if requests.length === 0}
	<EmptyState title="No requests found" description="No NHI access requests match your filters." actionLabel="Submit a Request" actionHref="/nhi/requests/create" />
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Name</th>
					<th class="px-4 py-3 text-left font-medium">Purpose</th>
					<th class="px-4 py-3 text-left font-medium">Status</th>
					<th class="px-4 py-3 text-left font-medium">Created</th>
					<th class="px-4 py-3 text-left font-medium">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each requests as req}
					<tr class="border-b hover:bg-muted/30">
						<td class="px-4 py-3 font-medium">{req.requested_name}</td>
						<td class="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{req.purpose}</td>
						<td class="px-4 py-3"><RequestStatusBadge status={req.status} /></td>
						<td class="px-4 py-3 text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</td>
						<td class="px-4 py-3">
							<a href="/nhi/requests/{req.id}" class="text-sm text-primary hover:underline">View</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-2 text-sm text-muted-foreground">{total} total requests</p>
{/if}
