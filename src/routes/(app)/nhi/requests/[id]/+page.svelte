<script lang="ts">
	import type { NhiAccessRequest } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import RequestStatusBadge from '$lib/components/nhi/request-status-badge.svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/stores/toast.svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let request = $derived(data.request as NhiAccessRequest);
	let isAdmin = $derived(data.isAdmin as boolean);
	let currentUserId = $derived(data.currentUserId as string);

	let showApproveForm = $state(false);
	let showRejectForm = $state(false);
	let rejectReason = $state('');
	let approveComments = $state('');
</script>

<PageHeader title="NHI Request: {request.requested_name}">
	<a href="/nhi/requests" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Requests</a>
</PageHeader>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<div class="flex items-center gap-3">
				<h2 class="text-xl font-semibold">Request Details</h2>
				<RequestStatusBadge status={request.status} />
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div><p class="text-sm text-muted-foreground">Requested Name</p><p class="font-medium">{request.requested_name}</p></div>
				<div><p class="text-sm text-muted-foreground">NHI Type</p><p class="font-medium">{request.nhi_type ?? '—'}</p></div>
				<div class="sm:col-span-2"><p class="text-sm text-muted-foreground">Purpose</p><p>{request.purpose}</p></div>
				{#if request.requested_permissions.length > 0}
					<div class="sm:col-span-2"><p class="text-sm text-muted-foreground">Requested Permissions</p><p class="font-mono text-xs">{request.requested_permissions.join(', ')}</p></div>
				{/if}
				{#if request.requested_expiration}
					<div><p class="text-sm text-muted-foreground">Requested Expiration</p><p>{new Date(request.requested_expiration).toLocaleString()}</p></div>
				{/if}
				{#if request.rotation_interval_days}
					<div><p class="text-sm text-muted-foreground">Rotation Interval</p><p>{request.rotation_interval_days} days</p></div>
				{/if}
				<div><p class="text-sm text-muted-foreground">Created</p><p>{new Date(request.created_at).toLocaleString()}</p></div>
				{#if request.reviewed_at}
					<div><p class="text-sm text-muted-foreground">Reviewed</p><p>{new Date(request.reviewed_at).toLocaleString()}</p></div>
				{/if}
				{#if request.review_comments}
					<div class="sm:col-span-2"><p class="text-sm text-muted-foreground">Reviewer Comments</p><p>{request.review_comments}</p></div>
				{/if}
				{#if request.nhi_id}
					<div><p class="text-sm text-muted-foreground">Created NHI</p><a href="/nhi" class="text-primary hover:underline">{request.nhi_id}</a></div>
				{/if}
			</div>
		</CardContent>
	</Card>

	{#if request.status === 'pending'}
		<Card>
			<CardHeader><h3 class="text-lg font-semibold">Actions</h3></CardHeader>
			<CardContent class="space-y-4">
				{#if isAdmin}
					{#if showApproveForm}
						<form method="POST" action="?/approve" use:enhance={() => { return async ({ update }) => { addToast('success', 'Request approved'); await update(); }; }}>
							<div class="space-y-2">
								<label for="comments" class="text-sm font-medium">Comments (optional)</label>
								<textarea id="comments" name="comments" class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" bind:value={approveComments}></textarea>
							</div>
							<div class="mt-2 flex gap-2">
								<Button type="submit" variant="default">Confirm Approve</Button>
								<Button type="button" variant="ghost" onclick={() => (showApproveForm = false)}>Cancel</Button>
							</div>
						</form>
					{:else if showRejectForm}
						<form method="POST" action="?/reject" use:enhance={() => { return async ({ update }) => { addToast('success', 'Request rejected'); await update(); }; }}>
							<div class="space-y-2">
								<label for="reason" class="text-sm font-medium">Reason (min 5 characters)</label>
								<textarea id="reason" name="reason" class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" bind:value={rejectReason} required minlength={5}></textarea>
							</div>
							<div class="mt-2 flex gap-2">
								<Button type="submit" variant="destructive">Confirm Reject</Button>
								<Button type="button" variant="ghost" onclick={() => (showRejectForm = false)}>Cancel</Button>
							</div>
						</form>
					{:else}
						<div class="flex gap-2">
							<Button variant="default" onclick={() => (showApproveForm = true)}>Approve</Button>
							<Button variant="destructive" onclick={() => (showRejectForm = true)}>Reject</Button>
						</div>
					{/if}
				{/if}

				{#if request.requester_id === currentUserId}
					<form method="POST" action="?/cancel" use:enhance={() => { return async ({ update }) => { addToast('success', 'Request cancelled'); await update(); }; }}>
						<Button type="submit" variant="outline">Cancel Request</Button>
					</form>
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>
