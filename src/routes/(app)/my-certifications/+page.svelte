<script lang="ts">
	import type { PaginationState } from '@tanstack/svelte-table';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { MyCertificationItem, MyCertificationListResponse } from '$lib/api/types';

	let data: MyCertificationItem[] = $state([]);
	let pageCount: number = $state(0);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let isLoading: boolean = $state(false);
	let statusFilter: string = $state('pending');
	let isActioning: string | null = $state(null);

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'certified', label: 'Certified' },
		{ value: 'revoked', label: 'Revoked' }
	];

	const statusStyles: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		certified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		revoked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};

	const statusLabels: Record<string, string> = {
		pending: 'Pending',
		certified: 'Certified',
		revoked: 'Revoked'
	};

	async function fetchCertifications() {
		isLoading = true;
		try {
			const params = new URLSearchParams({
				page: String(pagination.pageIndex + 1),
				page_size: String(pagination.pageSize)
			});
			if (statusFilter) {
				params.set('status', statusFilter);
			}

			const response = await fetch(`/api/governance/my-certifications?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch certifications');
			}

			const result: MyCertificationListResponse = await response.json();
			data = result.items;
			pageCount = Math.ceil(result.total / pagination.pageSize);
		} catch {
			addToast('error', 'Failed to load certifications');
		} finally {
			isLoading = false;
		}
	}

	async function handleCertify(itemId: string) {
		if (isActioning) return;
		isActioning = itemId;
		try {
			const res = await fetch(`/api/governance/my-certifications/${itemId}/certify`, {
				method: 'POST'
			});
			if (!res.ok) {
				throw new Error('Failed to certify');
			}
			addToast('success', 'Access certified');
			fetchCertifications();
		} catch {
			addToast('error', 'Failed to certify access');
		} finally {
			isActioning = null;
		}
	}

	async function handleRevoke(itemId: string) {
		if (isActioning) return;
		isActioning = itemId;
		try {
			const res = await fetch(`/api/governance/my-certifications/${itemId}/revoke`, {
				method: 'POST'
			});
			if (!res.ok) {
				throw new Error('Failed to revoke');
			}
			addToast('success', 'Access revoked');
			fetchCertifications();
		} catch {
			addToast('error', 'Failed to revoke access');
		} finally {
			isActioning = null;
		}
	}

	$effect(() => {
		void pagination;
		void statusFilter;
		fetchCertifications();
	});

	let totalPages = $derived(pageCount);
	let canPreviousPage = $derived(pagination.pageIndex > 0);
	let canNextPage = $derived(pagination.pageIndex < totalPages - 1);
</script>

<PageHeader title="My Certifications" description="Review and certify or revoke user access" />

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
		<p class="text-sm text-muted-foreground">Loading certifications...</p>
	</div>
{:else if data.length === 0}
	{#if statusFilter}
		<EmptyState
			title="No certifications match your filter"
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
			title="No certification items"
			description="You have no certification reviews assigned to you."
			icon="📋"
		/>
	{/if}
{:else}
	<div class="space-y-3">
		{#each data as item}
			<div class="rounded-lg border border-border bg-card p-4">
				<div class="flex items-start justify-between">
					<div class="min-w-0 flex-1">
						<p class="font-medium text-foreground">{item.user_email}</p>
						<p class="mt-0.5 text-sm text-muted-foreground">
							Campaign: {item.campaign_name}
						</p>
						<p class="mt-0.5 text-sm text-muted-foreground">
							Entitlements: {item.entitlements.length > 0 ? item.entitlements.join(', ') : 'None'}
						</p>
						{#if item.due_date}
							<p class="mt-1 text-xs text-muted-foreground">
								Due: {new Date(item.due_date).toLocaleDateString()}
							</p>
						{/if}
					</div>
					<div class="ml-4 shrink-0">
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusStyles[item.status] ?? 'bg-gray-100 text-gray-800'}"
						>
							{statusLabels[item.status] ?? item.status}
						</span>
					</div>
				</div>
				{#if item.status === 'pending'}
					<div class="mt-3 flex gap-2">
						<button
							onclick={() => handleCertify(item.id)}
							disabled={isActioning === item.id}
							class="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
						>
							{isActioning === item.id ? 'Processing...' : 'Certify'}
						</button>
						<button
							onclick={() => handleRevoke(item.id)}
							disabled={isActioning === item.id}
							class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
						>
							{isActioning === item.id ? 'Processing...' : 'Revoke'}
						</button>
					</div>
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
