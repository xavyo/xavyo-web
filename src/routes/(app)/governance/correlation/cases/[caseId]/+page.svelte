<script lang="ts">
	import type { CorrelationCaseDetail } from '$lib/api/types';
	import {
		confirmCaseClient,
		rejectCaseClient,
		createIdentityFromCaseClient,
		reassignCaseClient
	} from '$lib/api/correlation-client';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import CandidateCard from '$lib/components/correlation/candidate-card.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let caseDetail: CorrelationCaseDetail = $derived(data.caseDetail);

	let selectedCandidateId: string | null = $state(null);
	let confirmReason = $state('');
	let rejectReason = $state('');
	let createIdentityReason = $state('');
	let reassignTo = $state('');
	let reassignReason = $state('');

	let showConfirmDialog = $state(false);
	let showRejectDialog = $state(false);
	let showCreateIdentityDialog = $state(false);
	let showReassignDialog = $state(false);
	let actionLoading = $state(false);

	let isPending = $derived(caseDetail.status === 'pending');

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'confirmed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'rejected':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			case 'identity_created':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}

	function triggerTypeBadgeClass(type: string): string {
		switch (type) {
			case 'import':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
			case 'reconciliation':
				return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
			case 'manual':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr || isNaN(new Date(dateStr).getTime())) return '—';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function handleSelectCandidate(candidateId: string) {
		selectedCandidateId = selectedCandidateId === candidateId ? null : candidateId;
	}

	async function handleConfirm() {
		if (!selectedCandidateId) {
			addToast('error', 'Please select a candidate to confirm');
			return;
		}
		actionLoading = true;
		try {
			await confirmCaseClient(caseDetail.id, {
				candidate_id: selectedCandidateId,
				reason: confirmReason || undefined
			});
			addToast('success', 'Case confirmed successfully');
			goto('/governance/correlation');
		} catch {
			addToast('error', 'Failed to confirm case');
		} finally {
			actionLoading = false;
		}
	}

	async function handleReject() {
		if (!rejectReason.trim()) {
			addToast('error', 'Please provide a reason for rejection');
			return;
		}
		actionLoading = true;
		try {
			await rejectCaseClient(caseDetail.id, { reason: rejectReason });
			addToast('success', 'Case rejected');
			goto('/governance/correlation');
		} catch {
			addToast('error', 'Failed to reject case');
		} finally {
			actionLoading = false;
		}
	}

	async function handleCreateIdentity() {
		actionLoading = true;
		try {
			await createIdentityFromCaseClient(caseDetail.id, {
				reason: createIdentityReason || undefined
			});
			addToast('success', 'New identity created from case');
			goto('/governance/correlation');
		} catch {
			addToast('error', 'Failed to create identity from case');
		} finally {
			actionLoading = false;
		}
	}

	async function handleReassign() {
		if (!reassignTo.trim()) {
			addToast('error', 'Please provide the user to reassign to');
			return;
		}
		actionLoading = true;
		try {
			await reassignCaseClient(caseDetail.id, {
				assigned_to: reassignTo,
				reason: reassignReason || undefined
			});
			addToast('success', 'Case reassigned');
			await invalidateAll();
			showReassignDialog = false;
			reassignTo = '';
			reassignReason = '';
		} catch {
			addToast('error', 'Failed to reassign case');
		} finally {
			actionLoading = false;
		}
	}

	let accountAttributeEntries = $derived(Object.entries(caseDetail.account_attributes ?? {}));
</script>

<PageHeader title={caseDetail.account_identifier} description="Correlation case detail">
	<a
		href="/governance/correlation"
		class="text-sm text-muted-foreground hover:text-foreground"
	>
		&larr; Back to Correlation
	</a>
</PageHeader>

<!-- Breadcrumb -->
<nav class="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
	<ol class="flex items-center gap-1.5">
		<li><a href="/governance" class="hover:text-foreground">Governance</a></li>
		<li>/</li>
		<li><a href="/governance/correlation" class="hover:text-foreground">Correlation</a></li>
		<li>/</li>
		<li><a href="/governance/correlation" class="hover:text-foreground">Cases</a></li>
		<li>/</li>
		<li class="text-foreground">{caseDetail.account_identifier}</li>
	</ol>
</nav>

<div class="space-y-6">
	<!-- Status & Metadata -->
	<div class="flex flex-wrap items-center gap-3">
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {statusBadgeClass(caseDetail.status)}"
		>
			{caseDetail.status}
		</span>
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {triggerTypeBadgeClass(caseDetail.trigger_type)}"
		>
			{caseDetail.trigger_type}
		</span>
		<span class="text-sm text-muted-foreground">
			{caseDetail.candidate_count} candidate{caseDetail.candidate_count !== 1 ? 's' : ''}
		</span>
		<span class="text-sm text-muted-foreground">
			Highest confidence: <span class="font-mono font-medium text-foreground"
				>{Math.round(caseDetail.highest_confidence * 100)}%</span
			>
		</span>
	</div>

	<!-- Case Info -->
	<div class="grid gap-4 md:grid-cols-2">
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Case Information</h3>
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Connector</dt>
					<dd class="text-foreground">{caseDetail.connector_name}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Account Identifier</dt>
					<dd class="text-foreground">{caseDetail.account_identifier}</dd>
				</div>
				{#if caseDetail.account_id}
					<div class="flex justify-between">
						<dt class="text-muted-foreground">Account ID</dt>
						<dd class="font-mono text-xs text-foreground">{caseDetail.account_id}</dd>
					</div>
				{/if}
				{#if caseDetail.assigned_to}
					<div class="flex justify-between">
						<dt class="text-muted-foreground">Assigned To</dt>
						<dd class="text-foreground">{caseDetail.assigned_to}</dd>
					</div>
				{/if}
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Created</dt>
					<dd class="text-foreground">{formatDate(caseDetail.created_at)}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-muted-foreground">Updated</dt>
					<dd class="text-foreground">{formatDate(caseDetail.updated_at)}</dd>
				</div>
				{#if caseDetail.resolved_by}
					<div class="flex justify-between">
						<dt class="text-muted-foreground">Resolved By</dt>
						<dd class="text-foreground">{caseDetail.resolved_by}</dd>
					</div>
				{/if}
				{#if caseDetail.resolved_at}
					<div class="flex justify-between">
						<dt class="text-muted-foreground">Resolved At</dt>
						<dd class="text-foreground">{formatDate(caseDetail.resolved_at)}</dd>
					</div>
				{/if}
				{#if caseDetail.resolution_reason}
					<div class="flex justify-between">
						<dt class="text-muted-foreground">Resolution Reason</dt>
						<dd class="text-foreground">{caseDetail.resolution_reason}</dd>
					</div>
				{/if}
			</dl>
		</div>

		<!-- Account Attributes -->
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Account Attributes</h3>
			{#if accountAttributeEntries.length === 0}
				<p class="text-sm text-muted-foreground">No attributes available.</p>
			{:else}
				<dl class="space-y-2 text-sm">
					{#each accountAttributeEntries as [key, value]}
						<div class="flex justify-between gap-2">
							<dt class="shrink-0 text-muted-foreground">{key}</dt>
							<dd class="truncate text-right text-foreground">{String(value ?? '—')}</dd>
						</div>
					{/each}
				</dl>
			{/if}
		</div>
	</div>

	<!-- Candidates -->
	<div>
		<h3 class="mb-3 text-sm font-semibold text-foreground">
			Match Candidates ({caseDetail.candidates.length})
		</h3>
		{#if caseDetail.candidates.length === 0}
			<div class="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
				No match candidates found for this case.
			</div>
		{:else}
			<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				{#each caseDetail.candidates as candidate}
					<CandidateCard
						{candidate}
						isSelected={selectedCandidateId === candidate.id}
						onSelect={handleSelectCandidate}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Actions (only for pending cases) -->
	{#if isPending}
		<div class="flex flex-wrap gap-3 border-t border-border pt-4">
			<button
				class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				disabled={!selectedCandidateId || actionLoading}
				onclick={() => (showConfirmDialog = true)}
			>
				Confirm Match
			</button>
			<button
				class="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
				disabled={actionLoading}
				onclick={() => (showRejectDialog = true)}
			>
				Reject
			</button>
			<button
				class="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
				disabled={actionLoading}
				onclick={() => (showCreateIdentityDialog = true)}
			>
				Create New Identity
			</button>
			<button
				class="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
				disabled={actionLoading}
				onclick={() => (showReassignDialog = true)}
			>
				Reassign
			</button>
		</div>
	{/if}

	<!-- Confirm Dialog -->
	{#if showConfirmDialog}
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Confirm Correlation Match</h3>
			<p class="mb-3 text-sm text-muted-foreground">
				Confirm that account <span class="font-medium text-foreground"
					>{caseDetail.account_identifier}</span
				>
				matches the selected identity candidate.
			</p>
			<div class="space-y-3">
				<div>
					<label for="confirm-reason" class="block text-sm text-muted-foreground"
						>Reason (optional)</label
					>
					<textarea
						id="confirm-reason"
						rows="2"
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
						placeholder="Why are you confirming this match?"
						bind:value={confirmReason}
					></textarea>
				</div>
				<div class="flex gap-3">
					<button
						class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						disabled={actionLoading}
						onclick={handleConfirm}
					>
						{actionLoading ? 'Confirming...' : 'Confirm'}
					</button>
					<button
						class="rounded-md border border-input px-4 py-2 text-sm text-foreground hover:bg-muted"
						onclick={() => (showConfirmDialog = false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Reject Dialog -->
	{#if showRejectDialog}
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Reject Correlation Case</h3>
			<div class="space-y-3">
				<div>
					<label for="reject-reason" class="block text-sm text-muted-foreground">Reason</label>
					<textarea
						id="reject-reason"
						rows="3"
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
						placeholder="Why are you rejecting this correlation?"
						bind:value={rejectReason}
					></textarea>
				</div>
				<div class="flex gap-3">
					<button
						class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
						disabled={actionLoading || !rejectReason.trim()}
						onclick={handleReject}
					>
						{actionLoading ? 'Rejecting...' : 'Reject'}
					</button>
					<button
						class="rounded-md border border-input px-4 py-2 text-sm text-foreground hover:bg-muted"
						onclick={() => (showRejectDialog = false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Create Identity Dialog -->
	{#if showCreateIdentityDialog}
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Create New Identity</h3>
			<p class="mb-3 text-sm text-muted-foreground">
				Create a new identity from this unmatched account. This means no existing identity matches
				the account.
			</p>
			<div class="space-y-3">
				<div>
					<label for="create-identity-reason" class="block text-sm text-muted-foreground"
						>Reason (optional)</label
					>
					<textarea
						id="create-identity-reason"
						rows="2"
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
						placeholder="Why are you creating a new identity?"
						bind:value={createIdentityReason}
					></textarea>
				</div>
				<div class="flex gap-3">
					<button
						class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						disabled={actionLoading}
						onclick={handleCreateIdentity}
					>
						{actionLoading ? 'Creating...' : 'Create Identity'}
					</button>
					<button
						class="rounded-md border border-input px-4 py-2 text-sm text-foreground hover:bg-muted"
						onclick={() => (showCreateIdentityDialog = false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Reassign Dialog -->
	{#if showReassignDialog}
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="mb-3 text-sm font-semibold text-foreground">Reassign Case</h3>
			<div class="space-y-3">
				<div>
					<label for="reassign-to" class="block text-sm text-muted-foreground">Assign To</label>
					<input
						id="reassign-to"
						type="text"
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
						placeholder="User ID"
						bind:value={reassignTo}
					/>
				</div>
				<div>
					<label for="reassign-reason" class="block text-sm text-muted-foreground"
						>Reason (optional)</label
					>
					<textarea
						id="reassign-reason"
						rows="2"
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
						placeholder="Why are you reassigning this case?"
						bind:value={reassignReason}
					></textarea>
				</div>
				<div class="flex gap-3">
					<button
						class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						disabled={actionLoading || !reassignTo.trim()}
						onclick={handleReassign}
					>
						{actionLoading ? 'Reassigning...' : 'Reassign'}
					</button>
					<button
						class="rounded-md border border-input px-4 py-2 text-sm text-foreground hover:bg-muted"
						onclick={() => (showReassignDialog = false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
