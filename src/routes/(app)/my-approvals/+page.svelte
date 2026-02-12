<script lang="ts">
	import type { PaginationState, Updater } from '@tanstack/svelte-table';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { ApprovalItem, ApprovalItemListResponse } from '$lib/api/types';

	let data: ApprovalItem[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let isLoading: boolean = $state(false);
	let statusFilter: string = $state('pending');

	let showApproveDialog = $state(false);
	let showRejectDialog = $state(false);
	let selectedApprovalId: string | null = $state(null);
	let actionComment = $state('');
	let isSubmitting = $state(false);

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'rejected', label: 'Rejected' }
	];

	const statusStyles: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};

	const statusLabels: Record<string, string> = {
		pending: 'Pending',
		approved: 'Approved',
		rejected: 'Rejected'
	};

	async function fetchApprovals() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				offset: String(pagination.pageIndex * pagination.pageSize),
				limit: String(pagination.pageSize)
			});
			if (statusFilter) {
				params.set('status', statusFilter);
			}

			const response = await fetch(`/api/governance/my-approvals?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch approvals');
			}

			const result: ApprovalItemListResponse = await response.json();
			data = result.items;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load approvals');
		} finally {
			isLoading = false;
		}
	}

	async function handleApprove() {
		if (!selectedApprovalId || isSubmitting) return;
		isSubmitting = true;
		try {
			const res = await fetch(`/api/governance/my-approvals/${selectedApprovalId}/approve`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ comment: actionComment || undefined })
			});
			if (!res.ok) throw new Error('Failed');
			addToast('success', 'Request approved');
			showApproveDialog = false;
			actionComment = '';
			selectedApprovalId = null;
			fetchApprovals();
		} catch {
			addToast('error', 'Failed to approve request');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleReject() {
		if (!selectedApprovalId || !actionComment || isSubmitting) {
			if (!actionComment) {
				addToast('error', 'Justification is required for rejection');
			}
			return;
		}
		isSubmitting = true;
		try {
			const res = await fetch(`/api/governance/my-approvals/${selectedApprovalId}/reject`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ comment: actionComment })
			});
			if (!res.ok) throw new Error('Failed');
			addToast('success', 'Request rejected');
			showRejectDialog = false;
			actionComment = '';
			selectedApprovalId = null;
			fetchApprovals();
		} catch {
			addToast('error', 'Failed to reject request');
		} finally {
			isSubmitting = false;
		}
	}

	function openApproveDialog(approvalId: string) {
		selectedApprovalId = approvalId;
		actionComment = '';
		showApproveDialog = true;
	}

	function openRejectDialog(approvalId: string) {
		selectedApprovalId = approvalId;
		actionComment = '';
		showRejectDialog = true;
	}

	function closeApproveDialog() {
		showApproveDialog = false;
		actionComment = '';
		selectedApprovalId = null;
	}

	function closeRejectDialog() {
		showRejectDialog = false;
		actionComment = '';
		selectedApprovalId = null;
	}

	$effect(() => {
		void pagination;
		void statusFilter;
		fetchApprovals();
	});

	let totalPages = $derived(pageCount);
	let canPreviousPage = $derived(pagination.pageIndex > 0);
	let canNextPage = $derived(pagination.pageIndex < totalPages - 1);
</script>

<PageHeader title="My Approvals" description="Review and act on pending approval requests" />

<div class="mb-4 flex gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={statusFilter}
		onchange={() => {
			pagination = { ...pagination, pageIndex: 0 };
		}}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

{#if isLoading}
	<div class="flex items-center justify-center py-12">
		<p class="text-sm text-muted-foreground">Loading approvals...</p>
	</div>
{:else if data.length === 0}
	{#if statusFilter}
		<EmptyState
			title="No approvals match your filter"
			description="Try adjusting your filter criteria."
			icon="🔍"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					statusFilter = '';
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filter
			</button>
		</div>
	{:else}
		<EmptyState
			title="No approval requests"
			description="You have no approval requests assigned to you."
			icon="✅"
		/>
	{/if}
{:else}
	<div class="space-y-3">
		{#each data as approval}
			<div class="rounded-lg border border-border bg-card p-4">
				<div class="flex items-start justify-between">
					<div class="min-w-0 flex-1">
						<p class="font-medium text-foreground">{approval.resource_name}</p>
						<p class="mt-0.5 text-sm text-muted-foreground">
							Requested by {approval.requester_email}
						</p>
						<p class="mt-0.5 text-sm text-muted-foreground">
							Type: {approval.resource_type}
						</p>
						{#if approval.reason}
							<p class="mt-0.5 text-sm text-muted-foreground">
								{approval.reason.length > 100
									? approval.reason.substring(0, 100) + '...'
									: approval.reason}
							</p>
						{:else}
							<p class="mt-0.5 text-sm text-muted-foreground italic">No reason provided</p>
						{/if}
						<p class="mt-1 text-xs text-muted-foreground">
							Submitted: {new Date(approval.submitted_at).toLocaleDateString()}
						</p>
					</div>
					<div class="ml-4 shrink-0">
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusStyles[approval.status] ?? 'bg-gray-100 text-gray-800'}"
						>
							{statusLabels[approval.status] ?? approval.status}
						</span>
					</div>
				</div>
				{#if approval.status === 'pending'}
					<div class="mt-3 flex gap-2">
						<button
							onclick={() => openApproveDialog(approval.id)}
							class="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
						>
							Approve
						</button>
						<button
							onclick={() => openRejectDialog(approval.id)}
							class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
						>
							Reject
						</button>
					</div>
				{/if}
				{#if approval.decision_comment}
					<p class="mt-2 text-sm text-muted-foreground">
						<span class="font-medium">Comment:</span>
						{approval.decision_comment}
					</p>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Page {pagination.pageIndex + 1} of {totalPages}
			</p>
			<div class="flex gap-2">
				<button
					onclick={() => {
						pagination = { ...pagination, pageIndex: pagination.pageIndex - 1 };
					}}
					disabled={!canPreviousPage}
					class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
				>
					Previous
				</button>
				<button
					onclick={() => {
						pagination = { ...pagination, pageIndex: pagination.pageIndex + 1 };
					}}
					disabled={!canNextPage}
					class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
				>
					Next
				</button>
			</div>
		</div>
	{/if}
{/if}

<!-- Approve Dialog -->
{#if showApproveDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
			<h3 class="text-lg font-semibold text-foreground">Approve Request</h3>
			<p class="mt-1 text-sm text-muted-foreground">
				Add an optional comment for this approval.
			</p>
			<textarea
				class="mt-3 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				placeholder="Optional comment..."
				bind:value={actionComment}
				rows={3}
			></textarea>
			<div class="mt-4 flex justify-end gap-2">
				<button
					onclick={closeApproveDialog}
					disabled={isSubmitting}
					class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					onclick={handleApprove}
					disabled={isSubmitting}
					class="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
				>
					{isSubmitting ? 'Approving...' : 'Approve'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Reject Dialog -->
{#if showRejectDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
			<h3 class="text-lg font-semibold text-foreground">Reject Request</h3>
			<p class="mt-1 text-sm text-muted-foreground">A justification is required for rejection.</p>
			<textarea
				class="mt-3 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				placeholder="Justification..."
				bind:value={actionComment}
				rows={3}
			></textarea>
			<div class="mt-4 flex justify-end gap-2">
				<button
					onclick={closeRejectDialog}
					disabled={isSubmitting}
					class="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					onclick={handleReject}
					disabled={!actionComment || isSubmitting}
					class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
				>
					{isSubmitting ? 'Rejecting...' : 'Reject'}
				</button>
			</div>
		</div>
	</div>
{/if}
