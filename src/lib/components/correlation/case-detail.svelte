<script lang="ts">
	import type { CorrelationCaseDetail } from '$lib/api/types';
	import {
		confirmCaseClient,
		rejectCaseClient,
		createIdentityFromCaseClient,
		reassignCaseClient
	} from '$lib/api/correlation-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import CandidateCard from './candidate-card.svelte';
	import { CheckCircle, XCircle, UserPlus, ArrowRightLeft } from 'lucide-svelte';

	interface Props {
		caseDetail: CorrelationCaseDetail;
		onAction?: () => void;
	}

	let { caseDetail, onAction }: Props = $props();

	let selectedCandidateId = $state<string | null>(null);
	let processing = $state(false);

	// Dialog states
	let showConfirmDialog = $state(false);
	let showRejectDialog = $state(false);
	let showCreateIdentityDialog = $state(false);
	let showReassignDialog = $state(false);

	// Dialog form values
	let confirmReason = $state('');
	let rejectReason = $state('');
	let createIdentityReason = $state('');
	let reassignTo = $state('');
	let reassignReason = $state('');

	let isResolved = $derived(caseDetail.status !== 'pending');

	let accountAttributes = $derived(Object.entries(caseDetail.account_attributes ?? {}));

	function statusClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'confirmed':
				return 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'rejected':
				return 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			case 'identity_created':
				return 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
			default:
				return '';
		}
	}

	function triggerClass(trigger: string): string {
		switch (trigger) {
			case 'import':
				return 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'reconciliation':
				return 'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
			case 'manual':
				return 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default:
				return '';
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '--';
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return '--';
		return d.toLocaleString();
	}

	function handleSelectCandidate(candidateId: string) {
		if (isResolved) return;
		selectedCandidateId = selectedCandidateId === candidateId ? null : candidateId;
	}

	async function handleConfirm() {
		if (!selectedCandidateId) return;
		processing = true;
		try {
			await confirmCaseClient(caseDetail.id, {
				candidate_id: selectedCandidateId,
				reason: confirmReason || undefined
			});
			showConfirmDialog = false;
			confirmReason = '';
			selectedCandidateId = null;
			onAction?.();
		} finally {
			processing = false;
		}
	}

	async function handleReject() {
		if (!rejectReason.trim()) return;
		processing = true;
		try {
			await rejectCaseClient(caseDetail.id, { reason: rejectReason });
			showRejectDialog = false;
			rejectReason = '';
			onAction?.();
		} finally {
			processing = false;
		}
	}

	async function handleCreateIdentity() {
		processing = true;
		try {
			await createIdentityFromCaseClient(caseDetail.id, {
				reason: createIdentityReason || undefined
			});
			showCreateIdentityDialog = false;
			createIdentityReason = '';
			onAction?.();
		} finally {
			processing = false;
		}
	}

	async function handleReassign() {
		if (!reassignTo.trim()) return;
		processing = true;
		try {
			await reassignCaseClient(caseDetail.id, {
				assigned_to: reassignTo,
				reason: reassignReason || undefined
			});
			showReassignDialog = false;
			reassignTo = '';
			reassignReason = '';
			onAction?.();
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header with status -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold text-foreground">
				Case: {caseDetail.account_identifier}
			</h2>
			<p class="mt-0.5 text-sm text-muted-foreground">
				Connector: {caseDetail.connector_name}
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge class={triggerClass(caseDetail.trigger_type)}>{caseDetail.trigger_type}</Badge>
			<Badge class={statusClass(caseDetail.status)}>{caseDetail.status.replace('_', ' ')}</Badge>
		</div>
	</div>

	<!-- Resolution info (if resolved) -->
	{#if isResolved}
		<div class="rounded-lg border border-border bg-muted/50 p-4">
			<p class="text-sm font-medium text-foreground">Resolution</p>
			<div class="mt-2 space-y-1 text-sm text-muted-foreground">
				{#if caseDetail.resolved_by}
					<p>Resolved by: {caseDetail.resolved_by}</p>
				{/if}
				{#if caseDetail.resolved_at}
					<p>Resolved at: {formatDate(caseDetail.resolved_at)}</p>
				{/if}
				{#if caseDetail.resolution_reason}
					<p>Reason: {caseDetail.resolution_reason}</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Two-column layout -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Left: Account info -->
		<div class="space-y-4">
			<h3 class="text-sm font-semibold text-foreground">Account Information</h3>
			<div class="rounded-lg border border-border p-4">
				<dl class="space-y-2">
					<div>
						<dt class="text-xs font-medium text-muted-foreground">Account Identifier</dt>
						<dd class="text-sm text-foreground">{caseDetail.account_identifier}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium text-muted-foreground">Connector</dt>
						<dd class="text-sm text-foreground">{caseDetail.connector_name}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium text-muted-foreground">Trigger Type</dt>
						<dd class="text-sm text-foreground">{caseDetail.trigger_type}</dd>
					</div>
					<div>
						<dt class="text-xs font-medium text-muted-foreground">Created</dt>
						<dd class="text-sm text-foreground">{formatDate(caseDetail.created_at)}</dd>
					</div>
				</dl>

				{#if accountAttributes.length > 0}
					<div class="mt-4 border-t border-border pt-4">
						<p class="mb-2 text-xs font-medium text-muted-foreground">Account Attributes</p>
						<dl class="space-y-1.5">
							{#each accountAttributes as [key, value]}
								<div class="flex items-start gap-2">
									<dt class="w-28 shrink-0 truncate text-xs text-muted-foreground" title={key}>
										{key}
									</dt>
									<dd class="text-xs text-foreground">{String(value ?? '--')}</dd>
								</div>
							{/each}
						</dl>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right: Candidates -->
		<div class="space-y-4">
			<h3 class="text-sm font-semibold text-foreground">
				Candidates ({caseDetail.candidates.length})
			</h3>
			{#if caseDetail.candidates.length === 0}
				<p class="py-8 text-center text-sm text-muted-foreground">
					No candidate identities found.
				</p>
			{:else}
				<div class="space-y-3">
					{#each caseDetail.candidates as candidate}
						<CandidateCard
							{candidate}
							isSelected={selectedCandidateId === candidate.id}
							onSelect={isResolved ? undefined : handleSelectCandidate}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Action bar (only when pending) -->
	{#if !isResolved}
		<div class="flex flex-wrap items-center gap-2 border-t border-border pt-4">
			<Button
				onclick={() => (showConfirmDialog = true)}
				disabled={!selectedCandidateId || processing}
			>
				<CheckCircle class="mr-1.5 h-4 w-4" />
				Confirm Match
			</Button>
			<Button variant="destructive" onclick={() => (showRejectDialog = true)} disabled={processing}>
				<XCircle class="mr-1.5 h-4 w-4" />
				Reject All
			</Button>
			<Button
				variant="secondary"
				onclick={() => (showCreateIdentityDialog = true)}
				disabled={processing}
			>
				<UserPlus class="mr-1.5 h-4 w-4" />
				Create New Identity
			</Button>
			<Button variant="outline" onclick={() => (showReassignDialog = true)} disabled={processing}>
				<ArrowRightLeft class="mr-1.5 h-4 w-4" />
				Reassign
			</Button>
		</div>
	{/if}
</div>

<!-- Confirm Match Dialog -->
<Dialog.Root bind:open={showConfirmDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Confirm Match</DialogTitle>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<p class="text-sm text-muted-foreground">
				Confirm that the selected candidate is the correct identity match for this account.
			</p>
			<div>
				<label for="confirm-reason" class="mb-1 block text-sm font-medium text-foreground">
					Reason (optional)
				</label>
				<textarea
					id="confirm-reason"
					bind:value={confirmReason}
					rows={3}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="Enter reason for confirming this match..."
				></textarea>
			</div>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showConfirmDialog = false)}>Cancel</Button>
			<Button onclick={handleConfirm} disabled={processing}>
				{processing ? 'Confirming...' : 'Confirm'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>

<!-- Reject All Dialog -->
<Dialog.Root bind:open={showRejectDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Reject All Candidates</DialogTitle>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<p class="text-sm text-muted-foreground">
				Reject all candidate matches for this account. A reason is required.
			</p>
			<div>
				<label for="reject-reason" class="mb-1 block text-sm font-medium text-foreground">
					Reason <span class="text-destructive">*</span>
				</label>
				<textarea
					id="reject-reason"
					bind:value={rejectReason}
					rows={3}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="Enter reason for rejecting all candidates..."
				></textarea>
			</div>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showRejectDialog = false)}>Cancel</Button>
			<Button
				variant="destructive"
				onclick={handleReject}
				disabled={processing || !rejectReason.trim()}
			>
				{processing ? 'Rejecting...' : 'Reject All'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>

<!-- Create New Identity Dialog -->
<Dialog.Root bind:open={showCreateIdentityDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create New Identity</DialogTitle>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<p class="text-sm text-muted-foreground">
				Create a new identity from this account's attributes. No existing identity will be linked.
			</p>
			<div>
				<label
					for="create-identity-reason"
					class="mb-1 block text-sm font-medium text-foreground"
				>
					Reason (optional)
				</label>
				<textarea
					id="create-identity-reason"
					bind:value={createIdentityReason}
					rows={3}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="Enter reason for creating a new identity..."
				></textarea>
			</div>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showCreateIdentityDialog = false)}>
				Cancel
			</Button>
			<Button variant="secondary" onclick={handleCreateIdentity} disabled={processing}>
				{processing ? 'Creating...' : 'Create Identity'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>

<!-- Reassign Dialog -->
<Dialog.Root bind:open={showReassignDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Reassign Case</DialogTitle>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<p class="text-sm text-muted-foreground">
				Reassign this case to another reviewer.
			</p>
			<div>
				<label for="reassign-to" class="mb-1 block text-sm font-medium text-foreground">
					Assign To <span class="text-destructive">*</span>
				</label>
				<input
					id="reassign-to"
					type="text"
					bind:value={reassignTo}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="Enter user ID to assign to..."
				/>
			</div>
			<div>
				<label for="reassign-reason" class="mb-1 block text-sm font-medium text-foreground">
					Reason (optional)
				</label>
				<textarea
					id="reassign-reason"
					bind:value={reassignReason}
					rows={3}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="Enter reason for reassignment..."
				></textarea>
			</div>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (showReassignDialog = false)}>Cancel</Button>
			<Button onclick={handleReassign} disabled={processing || !reassignTo.trim()}>
				{processing ? 'Reassigning...' : 'Reassign'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
