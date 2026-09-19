<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import { Mail } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let resendingVerification = $state(false);

	// svelte-ignore state_referenced_locally
	let currentStatus = $state(data.status ?? '');
	// svelte-ignore state_referenced_locally
	let emailSearch = $state(data.email ?? '');
	// svelte-ignore state_referenced_locally
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
			return 'bg-warning/15 text-warning';
		}
		switch (invitation.status) {
			case 'sent':
				return 'bg-info/15 text-info';
			case 'cancelled':
				return 'bg-muted text-muted-foreground';
			case 'accepted':
				return 'bg-success/15 text-success';
			default:
				return 'bg-muted text-muted-foreground';
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

	function roleBadgeColor(role: string): string {
		return role === 'admin'
			? 'bg-primary/15 text-primary'
			: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
	}

	function roleBadgeLabel(role: string): string {
		return role === 'admin' ? 'Administrator' : 'Member';
	}

	function canActOn(invitation: { status: string; expires_at: string }): boolean {
		return invitation.status === 'sent' && !isExpired(invitation);
	}
</script>

{#if !data.emailVerified}
	<PageHeader
		title="Invitations"
		description="Confirm your email before inviting teammates."
	/>

	<div
		class="mb-6 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground"
		role="status"
	>
		To invite teammates, we need to confirm it is really you. Check your inbox for a verification
		link
		{#if data.profileEmail}
			sent to <span class="font-medium">{data.profileEmail}</span>
		{/if}.
	</div>

	<div
		class="mx-auto flex max-w-lg flex-col items-center rounded-lg border border-border/80 bg-card px-6 py-12 text-center shadow-xs"
	>
		<div
			class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
			aria-hidden="true"
		>
			<Mail class="h-7 w-7" />
		</div>
		<h2 class="text-xl font-semibold tracking-tight">Confirm your email</h2>
		<p class="mt-2 max-w-sm text-sm text-muted-foreground">
			Click the link we sent you. Invitation is locked until that address is verified.
		</p>
		{#if data.profileEmail}
			<p class="mt-4 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
				{data.profileEmail}
			</p>
		{/if}

		{#if form?.action === 'resendVerification' && form.success}
			<p class="mt-4 text-sm text-foreground">Verification email sent. Check your inbox.</p>
		{/if}

		<form
			method="POST"
			action="?/resendVerification"
			class="mt-6 w-full max-w-xs"
			use:enhance={() => {
				resendingVerification = true;
				return async ({ result, update }) => {
					resendingVerification = false;
					if (result.type === 'success') {
						addToast('success', 'Verification email sent');
					} else {
						addToast('error', 'Could not resend verification email');
					}
					await update();
				};
			}}
		>
			<Button type="submit" class="w-full" disabled={resendingVerification}>
				{resendingVerification ? 'Sending…' : 'Resend email'}
			</Button>
		</form>

		<p class="mt-6 text-sm text-muted-foreground">
			Can’t find the email? Check your junk folder, then resend.
		</p>
	</div>
{:else}
<PageHeader title="Invitations" description="Invite people and track acceptance.">
	<a
		href="/invitations/create"
		class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
	>
		Invite user
	</a>
</PageHeader>

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
		/>
	{/if}
{:else}
	<div class="overflow-x-auto rounded-lg border border-border/80 bg-card shadow-xs">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
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
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {roleBadgeColor(invitation.role)}"
							>
								{roleBadgeLabel(invitation.role)}
							</span>
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
{/if}
