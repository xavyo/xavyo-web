<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';

	let { data }: { data: PageData } = $props();

	let currentStatus = $state(data.status ?? '');
	let emailSearch = $state(data.email ?? '');
	let currentOffset = $state(data.offset);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	const limit = $derived(data.limit);
	const total = $derived(data.total);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(currentOffset / limit));
	const hasFilters = $derived(currentStatus !== '' || emailSearch !== '');

	const statusOptions: { value: string; label: string }[] = [
		{ value: '', label: 'All statuses' },
		{ value: 'sent', label: 'Sent' },
		{ value: 'cancelled', label: 'Cancelled' },
		{ value: 'accepted', label: 'Accepted' }
	];

	function isExpired(invitation: { status: string; expires_at: string }): boolean {
		return invitation.status === 'sent' && new Date(invitation.expires_at) < new Date();
	}

	function statusBadgeColor(invitation: { status: string; expires_at: string }): string {
		if (isExpired(invitation)) {
			return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
		}
		switch (invitation.status) {
			case 'sent':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			case 'accepted':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function statusLabel(invitation: { status: string; expires_at: string }): string {
		if (isExpired(invitation)) return 'Expired';
		return invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1);
	}

	function buildUrl(overrides: { status?: string; email?: string; offset?: number } = {}): string {
		const params = new URLSearchParams();
		const status = overrides.status ?? currentStatus;
		const email = overrides.email ?? emailSearch;
		const off = overrides.offset ?? 0;
		if (status) params.set('status', status);
		if (email) params.set('email', email);
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/invitations?${params}`;
	}

	function applyStatusFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function onEmailInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			goto(buildUrl({ offset: 0 }));
		}, 300);
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

	let showCancelConfirm = $state(false);
	let cancelInvitationId: string | null = $state(null);

	function canActOn(invitation: { status: string; expires_at: string }): boolean {
		return invitation.status === 'sent' && !isExpired(invitation);
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Invitations" description="Manage user invitations to your organization" />
	<a
		href="/invitations/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Invite User
	</a>
</div>

<div class="mb-4 flex gap-3">
	<input
		type="text"
		placeholder="Search by email..."
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={emailSearch}
		oninput={onEmailInput}
	/>
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={currentStatus}
		onchange={applyStatusFilter}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

{#if data.invitations.length === 0}
	{#if hasFilters}
		<EmptyState
			title="No invitations match your filter"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					currentStatus = '';
					emailSearch = '';
					goto('/invitations?limit=' + limit + '&offset=0');
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No invitations yet"
			description="Invite users to join your organization."
			icon="inbox"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Invited</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Expires</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.invitations as invitation}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3 font-medium">
							{invitation.email}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(invitation)}"
							>
								{statusLabel(invitation)}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{new Date(invitation.created_at).toLocaleDateString()}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{new Date(invitation.expires_at).toLocaleDateString()}
						</td>
						<td class="px-4 py-3">
							{#if canActOn(invitation)}
								<div class="flex gap-2">
									<form
										method="POST"
										action="?/resend"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') {
													const resultData = result.data as
														| { success: boolean; error?: string }
														| undefined;
													if (resultData?.success) {
														addToast('success', 'Invitation resent successfully');
														await invalidateAll();
													} else {
														addToast('error', resultData?.error ?? 'Failed to resend invitation');
													}
												} else {
													addToast('error', 'Failed to resend invitation');
												}
											};
										}}
									>
										<input type="hidden" name="id" value={invitation.id} />
										<Button variant="outline" size="sm" type="submit">Resend</Button>
									</form>
									<form
										id="cancel-form-{invitation.id}"
										method="POST"
										action="?/cancel"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') {
													const resultData = result.data as
														| { success: boolean; error?: string }
														| undefined;
													if (resultData?.success) {
														addToast('success', 'Invitation cancelled');
														await invalidateAll();
													} else {
														addToast('error', resultData?.error ?? 'Failed to cancel invitation');
													}
												} else {
													addToast('error', 'Failed to cancel invitation');
												}
											};
										}}
									>
										<input type="hidden" name="id" value={invitation.id} />
										<Button variant="outline" size="sm" type="button" onclick={() => { cancelInvitationId = invitation.id; showCancelConfirm = true; }}>Cancel</Button>
									</form>
								</div>
							{:else}
								<span class="text-sm text-muted-foreground">&mdash;</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {currentOffset + 1}&ndash;{Math.min(currentOffset + limit, total)} of {total} invitations
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === 0}
					onclick={() => goToPage(currentPage - 1)}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage >= pageCount - 1}
					onclick={() => goToPage(currentPage + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
{/if}

<ConfirmDialog
	bind:open={showCancelConfirm}
	title="Cancel invitation"
	description="Are you sure you want to cancel this invitation?"
	confirmLabel="Cancel Invitation"
	variant="destructive"
	onconfirm={() => {
		if (cancelInvitationId) {
			const form = document.getElementById('cancel-form-' + cancelInvitationId);
			if (form instanceof HTMLFormElement) form.requestSubmit();
		}
	}}
/>
