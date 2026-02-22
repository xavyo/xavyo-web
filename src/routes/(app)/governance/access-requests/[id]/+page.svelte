<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let approveDialogOpen = $state(false);
	let rejectDialogOpen = $state(false);

	const {
		form: approveFormData,
		errors: approveErrors,
		enhance: approveEnhance,
		message: approveMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.approveForm, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Access request approved');
			}
		}
	});

	const {
		form: rejectFormData,
		errors: rejectErrors,
		enhance: rejectEnhance,
		message: rejectMessage
	// svelte-ignore state_referenced_locally
	} = superForm(data.rejectForm, {
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Access request rejected');
			}
		}
	});

	const statusStyles: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		pending_approval: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		provisioned: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
		rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};

	const statusLabels: Record<string, string> = {
		pending: 'Pending',
		pending_approval: 'Pending Approval',
		approved: 'Approved',
		provisioned: 'Provisioned',
		rejected: 'Rejected',
		cancelled: 'Cancelled',
		expired: 'Expired',
		failed: 'Failed'
	};

	const isPending = $derived(
		data.request.status === 'pending' || data.request.status === 'pending_approval'
	);
</script>

<div class="mb-4">
	<a
		href="/governance"
		class="text-sm font-medium text-muted-foreground hover:text-foreground"
	>
		&larr; Back to Governance
	</a>
</div>

<PageHeader
	title="Access Request"
	description="Review and manage this access request"
/>

<div class="grid gap-6 lg:grid-cols-2">
	<!-- Request Details -->
	<Card>
		<CardHeader>
			<h2 class="text-xl font-semibold">Request details</h2>
		</CardHeader>
		<CardContent>
			<dl class="space-y-4">
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Request ID</dt>
					<dd class="mt-1 font-mono text-sm">{data.request.id}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Requester ID</dt>
					<dd class="mt-1 font-mono text-sm">{data.request.requester_id}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Entitlement ID</dt>
					<dd class="mt-1 font-mono text-sm">{data.request.entitlement_id}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Status</dt>
					<dd class="mt-1">
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusStyles[data.request.status] ?? 'bg-gray-100 text-gray-800'}"
						>
							{statusLabels[data.request.status] ?? data.request.status}
						</span>
					</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Justification</dt>
					<dd class="mt-1 text-sm">{data.request.justification}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Created</dt>
					<dd class="mt-1 text-sm">{new Date(data.request.created_at).toLocaleString()}</dd>
				</div>
				{#if data.request.requested_expires_at}
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Requested expiry</dt>
						<dd class="mt-1 text-sm">
							{new Date(data.request.requested_expires_at).toLocaleString()}
						</dd>
					</div>
				{/if}
				{#if data.request.expires_at}
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Expires at</dt>
						<dd class="mt-1 text-sm">
							{new Date(data.request.expires_at).toLocaleString()}
						</dd>
					</div>
				{/if}
			</dl>
		</CardContent>
	</Card>

	<!-- SoD Warnings -->
	<div class="space-y-6">
		{#if data.request.has_sod_warning}
			<Card>
				<CardHeader>
					<h2 class="text-xl font-semibold text-orange-600 dark:text-orange-400">
						SoD Warning
					</h2>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>
							This request has separation of duties violations that require attention.
						</AlertDescription>
					</Alert>
					{#if data.request.sod_violations.length > 0}
						<ul class="space-y-3">
							{#each data.request.sod_violations as violation}
								<li class="rounded-md border p-3">
									<p class="font-medium">{violation.rule_name}</p>
									<p class="mt-1 text-sm text-muted-foreground">
										Severity:
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
												{violation.severity === 'critical'
												? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
												: violation.severity === 'high'
													? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
													: violation.severity === 'medium'
														? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
														: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}"
										>
											{violation.severity}
										</span>
									</p>
									<p class="mt-1 text-xs text-muted-foreground">
										Rule ID: {violation.rule_id}
									</p>
								</li>
							{/each}
						</ul>
					{/if}
				</CardContent>
			</Card>
		{/if}

		<!-- Actions for pending requests -->
		{#if isPending}
			<Card>
				<CardHeader>
					<h2 class="text-xl font-semibold">Actions</h2>
				</CardHeader>
				<CardContent>
					<div class="flex gap-3">
						<Button
							variant="default"
							onclick={() => {
								approveDialogOpen = true;
							}}
						>
							Approve
						</Button>
						<Button
							variant="destructive"
							onclick={() => {
								rejectDialogOpen = true;
							}}
						>
							Reject
						</Button>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>

<!-- Escalation History -->
{#if data.escalationHistory.events.length > 0}
	<Separator class="my-6" />
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Escalation History</h2>
				{#if isPending}
					<div class="flex gap-2">
						<form method="POST" action="?/cancelEscalation" use:formEnhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									addToast('success', 'Escalation cancelled');
									await invalidateAll();
								} else if (result.type === 'failure') {
									addToast('error', 'Failed to cancel escalation');
								}
							};
						}}>
							<Button type="submit" variant="outline" size="sm">Cancel Escalation</Button>
						</form>
						<form method="POST" action="?/resetEscalation" use:formEnhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									addToast('success', 'Escalation reset');
									await invalidateAll();
								} else if (result.type === 'failure') {
									addToast('error', 'Failed to reset escalation');
								}
							};
						}}>
							<Button type="submit" variant="outline" size="sm">Reset Escalation</Button>
						</form>
					</div>
				{/if}
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each data.escalationHistory.events as entry}
					<div class="flex gap-3 rounded-md border border-border p-3">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
							{entry.event_type === 'escalated' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
							 entry.event_type === 'auto_approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
							 entry.event_type === 'auto_rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
							 entry.event_type === 'reassigned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
							 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
							<span class="text-xs font-bold">
								{entry.event_type === 'escalated' ? 'E' :
								 entry.event_type === 'auto_approved' ? 'A' :
								 entry.event_type === 'auto_rejected' ? 'R' :
								 entry.event_type === 'reassigned' ? 'M' :
								 entry.event_type === 'notified' ? 'N' : '?'}
							</span>
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium capitalize">{entry.event_type.replace(/_/g, ' ')}</span>
								<span class="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
							</div>
							{#if entry.action_taken}
								<p class="mt-1 text-sm text-muted-foreground">Action: {entry.action_taken}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
{/if}

<!-- Approve Dialog -->
<Dialog.Root bind:open={approveDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Approve access request</Dialog.Title>
			<Dialog.Description>
				Approve this access request. You may add optional notes.
			</Dialog.Description>
		</Dialog.Header>

		{#if $approveMessage}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$approveMessage}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" action="?/approve" use:approveEnhance class="space-y-4">
			<div class="space-y-2">
				<Label for="comments">Comments (optional)</Label>
				<textarea
					id="comments"
					name="comments"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Add any comments about this approval..."
					value={String($approveFormData.comments ?? '')}
				></textarea>
				{#if $approveErrors.comments}
					<p class="text-sm text-destructive">{$approveErrors.comments}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Button
					variant="outline"
					type="button"
					onclick={() => {
						approveDialogOpen = false;
					}}
				>
					Cancel
				</Button>
				<Button type="submit">Approve request</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Reject Dialog -->
<Dialog.Root bind:open={rejectDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Reject access request</Dialog.Title>
			<Dialog.Description>
				Reject this access request. A reason is required.
			</Dialog.Description>
		</Dialog.Header>

		{#if $rejectMessage}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$rejectMessage}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" action="?/reject" use:rejectEnhance class="space-y-4">
			<div class="space-y-2">
				<Label for="reject-comments">Reason</Label>
				<textarea
					id="reject-comments"
					name="comments"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Explain why this request is being rejected..."
					value={String($rejectFormData.comments ?? '')}
				></textarea>
				{#if $rejectErrors.comments}
					<p class="text-sm text-destructive">{$rejectErrors.comments}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Button
					variant="outline"
					type="button"
					onclick={() => {
						rejectDialogOpen = false;
					}}
				>
					Cancel
				</Button>
				<Button variant="destructive" type="submit">Reject request</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
