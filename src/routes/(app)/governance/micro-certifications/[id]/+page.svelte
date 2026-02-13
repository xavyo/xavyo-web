<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import CertStatusBadge from '$lib/components/micro-certifications/cert-status-badge.svelte';
	import CertEventsTimeline from '$lib/components/micro-certifications/cert-events-timeline.svelte';
	import CertDecisionDialog from '$lib/components/micro-certifications/cert-decision-dialog.svelte';
	import CertDelegateDialog from '$lib/components/micro-certifications/cert-delegate-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import {
		decideMicroCertificationClient,
		delegateMicroCertificationClient,
		skipMicroCertificationClient
	} from '$lib/api/micro-certifications-client';

	let { data } = $props();

	const certification = $derived(data.certification);
	const events = $derived(data.events);

	let decisionDialogOpen = $state(false);
	let delegateDialogOpen = $state(false);
	let skipSubmitting = $state(false);

	const isPending = $derived(certification.status === 'pending');

	async function handleDecide(decision: 'approve' | 'revoke' | 'reduce', comment: string) {
		await decideMicroCertificationClient(certification.id, { decision, comment: comment || undefined });
		const labels: Record<string, string> = { approve: 'approved', revoke: 'revoked', reduce: 'flagged for review' };
		addToast('success', `Certification ${labels[decision] ?? decision} successfully`);
		await invalidateAll();
	}

	async function handleDelegate(delegateTo: string, comment: string) {
		await delegateMicroCertificationClient(certification.id, {
			delegate_to: delegateTo,
			comment: comment || undefined
		});
		addToast('success', 'Certification delegated successfully');
		await invalidateAll();
	}

	let skipReason = $state('');
	let skipDialogOpen = $state(false);

	async function handleSkip() {
		if (!skipReason.trim() || skipReason.trim().length < 10) {
			addToast('error', 'Reason must be at least 10 characters');
			return;
		}
		skipSubmitting = true;
		try {
			await skipMicroCertificationClient(certification.id, { reason: skipReason.trim() });
			addToast('success', 'Certification skipped');
			skipDialogOpen = false;
			skipReason = '';
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to skip certification');
		} finally {
			skipSubmitting = false;
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		try {
			return new Date(dateStr).toLocaleString();
		} catch {
			return dateStr;
		}
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2">
				<a href="/governance/micro-certifications" class="text-sm text-muted-foreground hover:text-foreground">
					← Back to Micro Certifications
				</a>
			</div>
			<h1 class="mt-2 text-2xl font-bold tracking-tight">Certification Detail</h1>
		</div>
		{#if isPending}
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={() => (delegateDialogOpen = true)}>Delegate</Button>
				<Button variant="outline" size="sm" onclick={() => (skipDialogOpen = true)} disabled={skipSubmitting}>
					{skipSubmitting ? 'Skipping...' : 'Skip'}
				</Button>
				<Button size="sm" onclick={() => (decisionDialogOpen = true)}>Make Decision</Button>
			</div>
		{/if}
	</div>

	<!-- Certification Info -->
	<div class="rounded-md border p-6">
		<h2 class="mb-4 text-lg font-semibold">Certification Information</h2>
		<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div>
				<dt class="text-sm font-medium text-muted-foreground">Status</dt>
				<dd class="mt-1"><CertStatusBadge status={certification.status} /></dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-muted-foreground">User</dt>
				<dd class="mt-1 font-mono text-sm">{certification.user_id}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-muted-foreground">Entitlement</dt>
				<dd class="mt-1 font-mono text-sm">{certification.entitlement_id}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-muted-foreground">Reviewer</dt>
				<dd class="mt-1 font-mono text-sm">{certification.reviewer_id}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-muted-foreground">Created</dt>
				<dd class="mt-1 text-sm">{formatDate(certification.created_at)}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-muted-foreground">Deadline</dt>
				<dd class="mt-1 text-sm">{formatDate(certification.to_date)}</dd>
			</div>
			{#if certification.decision}
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Decision</dt>
					<dd class="mt-1 text-sm capitalize">{certification.decision}</dd>
				</div>
			{/if}
			{#if certification.comment}
				<div class="sm:col-span-2">
					<dt class="text-sm font-medium text-muted-foreground">Comment</dt>
					<dd class="mt-1 text-sm">{certification.comment}</dd>
				</div>
			{/if}
			{#if certification.decided_at}
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Decided At</dt>
					<dd class="mt-1 text-sm">{formatDate(certification.decided_at)}</dd>
				</div>
			{/if}
			{#if certification.delegated_to}
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Delegated To</dt>
					<dd class="mt-1 font-mono text-sm">{certification.delegated_to}</dd>
				</div>
			{/if}
			<div>
				<dt class="text-sm font-medium text-muted-foreground">Flags</dt>
				<dd class="mt-1 flex gap-2">
					{#if certification.escalated}
						<span class="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
							Escalated
						</span>
					{/if}
					{#if certification.past_deadline}
						<span class="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-400">
							Overdue
						</span>
					{/if}
					{#if !certification.escalated && !certification.past_deadline}
						<span class="text-sm text-muted-foreground">None</span>
					{/if}
				</dd>
			</div>
		</dl>
	</div>

	<!-- Events Timeline -->
	<div class="rounded-md border p-6">
		<h2 class="mb-4 text-lg font-semibold">Events Timeline</h2>
		<CertEventsTimeline events={events.items} />
	</div>

	<!-- Dialogs -->
	<CertDecisionDialog
		bind:open={decisionDialogOpen}
		certificationId={certification.id}
		onDecide={handleDecide}
	/>
	<CertDelegateDialog
		bind:open={delegateDialogOpen}
		certificationId={certification.id}
		onDelegate={handleDelegate}
	/>

	<!-- Skip Dialog -->
	{#if skipDialogOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
				<h3 class="text-lg font-semibold">Skip Certification</h3>
				<p class="mt-1 text-sm text-muted-foreground">Provide a reason for skipping this certification (min 10 characters).</p>
				<textarea
					bind:value={skipReason}
					rows={3}
					class="mt-3 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					placeholder="Enter reason for skipping..."
				></textarea>
				<div class="mt-4 flex justify-end gap-2">
					<Button variant="outline" size="sm" onclick={() => { skipDialogOpen = false; skipReason = ''; }}>Cancel</Button>
					<Button size="sm" onclick={handleSkip} disabled={skipSubmitting || skipReason.trim().length < 10}>
						{skipSubmitting ? 'Skipping...' : 'Confirm Skip'}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
