<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import TaskStatusBadge from '$lib/components/manual-tasks/task-status-badge.svelte';
	import OperationTypeBadge from '$lib/components/manual-tasks/operation-type-badge.svelte';
	import SlaIndicator from '$lib/components/manual-tasks/sla-indicator.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let task = $derived(data.task);
	let confirmOpen = $state(false);
	let rejectOpen = $state(false);
	let cancelOpen = $state(false);
	let confirmNotes = $state('');
	let rejectReason = $state('');

	const canClaim = $derived(task.status === 'pending' && !task.assignee_id);
	const canStart = $derived(task.status === 'pending' && !!task.assignee_id);
	const canConfirm = $derived(task.status === 'in_progress');
	const canReject = $derived(task.status === 'in_progress');
	const canCancel = $derived(task.status === 'pending');

	function formatDate(d: string | null): string {
		if (!d) return '—';
		const date = new Date(d);
		if (isNaN(date.getTime())) return '—';
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function handleResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', `Task ${result.data.action} successfully`);
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}
</script>

<PageHeader title="Manual Task Detail" description="View and manage this provisioning task" />

<div class="grid gap-6 lg:grid-cols-3">
	<!-- Task Info -->
	<Card class="lg:col-span-2">
		<CardHeader>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold text-foreground">Task Information</h2>
				<TaskStatusBadge status={task.status} />
			</div>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">Application</p>
					<p class="font-medium text-foreground">{task.application_name ?? task.application_id}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">User</p>
					<p class="font-medium text-foreground">{task.user_name ?? task.user_id}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Entitlement</p>
					<p class="font-medium text-foreground">{task.entitlement_name ?? task.entitlement_id}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Operation</p>
					<OperationTypeBadge operationType={task.operation_type} />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Assignee</p>
					<p class="font-medium text-foreground">{task.assignee_name ?? task.assignee_id ?? 'Unassigned'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">SLA Status</p>
					<SlaIndicator slaDeadline={task.sla_deadline} slaBreached={task.sla_breached} slaWarningSent={task.sla_warning_sent} />
				</div>
			</div>

			<Separator class="my-4" />

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">Created</p>
					<p class="text-sm text-foreground">{formatDate(task.created_at)}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Updated</p>
					<p class="text-sm text-foreground">{formatDate(task.updated_at)}</p>
				</div>
				{#if task.completed_at}
					<div>
						<p class="text-sm text-muted-foreground">Completed</p>
						<p class="text-sm text-foreground">{formatDate(task.completed_at)}</p>
					</div>
				{/if}
				{#if task.notes}
					<div class="sm:col-span-2">
						<p class="text-sm text-muted-foreground">Notes</p>
						<p class="text-sm text-foreground whitespace-pre-wrap">{task.notes}</p>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Actions -->
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold text-foreground">Actions</h2>
		</CardHeader>
		<CardContent class="space-y-3">
			{#if canClaim}
				<form method="POST" action="?/claim" use:enhance={() => ({ result }) => handleResult(result)}>
					<Button type="submit" class="w-full">Claim Task</Button>
				</form>
			{/if}

			{#if canStart}
				<form method="POST" action="?/start" use:enhance={() => ({ result }) => handleResult(result)}>
					<Button type="submit" class="w-full">Start Task</Button>
				</form>
			{/if}

			{#if canConfirm}
				<Button class="w-full" onclick={() => (confirmOpen = true)}>Confirm Completion</Button>
			{/if}

			{#if canReject}
				<Button variant="destructive" class="w-full" onclick={() => (rejectOpen = true)}>Reject Task</Button>
			{/if}

			{#if canCancel}
				<Button variant="outline" class="w-full" onclick={() => (cancelOpen = true)}>Cancel Task</Button>
			{/if}

			{#if !canClaim && !canStart && !canConfirm && !canReject && !canCancel}
				<p class="text-sm text-muted-foreground">No actions available for this task.</p>
			{/if}

			<Separator class="my-2" />

			<a href="/governance/manual-tasks" class="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
				Back to List
			</a>
		</CardContent>
	</Card>
</div>

<!-- Confirm Dialog -->
<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Task Completion</Dialog.Title>
			<Dialog.Description>Mark this provisioning task as completed.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/confirm" use:enhance={() => {
			confirmOpen = false;
			return ({ result }) => {
				handleResult(result);
				confirmNotes = '';
			};
		}}>
			<div class="py-4">
				<label for="confirm-notes" class="text-sm font-medium text-foreground">Notes (optional)</label>
				<textarea
					id="confirm-notes"
					name="notes"
					bind:value={confirmNotes}
					class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					rows={3}
					maxlength={2000}
					placeholder="Describe the actions taken..."
				></textarea>
				<p class="mt-1 text-xs text-muted-foreground">{confirmNotes.length}/2000</p>
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (confirmOpen = false)}>Cancel</Button>
				<Button type="submit">Confirm</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Reject Dialog -->
<Dialog.Root bind:open={rejectOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Reject Task</Dialog.Title>
			<Dialog.Description>Provide a reason for rejecting this task.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/reject" use:enhance={() => {
			rejectOpen = false;
			return ({ result }) => {
				handleResult(result);
				rejectReason = '';
			};
		}}>
			<div class="py-4">
				<label for="reject-reason" class="text-sm font-medium text-foreground">Reason <span class="text-red-500">*</span></label>
				<textarea
					id="reject-reason"
					name="reason"
					bind:value={rejectReason}
					class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					rows={3}
					minlength={5}
					maxlength={1000}
					required
					placeholder="Explain why this task is rejected..."
				></textarea>
				<p class="mt-1 text-xs text-muted-foreground">{rejectReason.length}/1000 (min 5)</p>
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (rejectOpen = false)}>Cancel</Button>
				<Button variant="destructive" type="submit" disabled={rejectReason.length < 5}>Reject</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Cancel Dialog -->
<Dialog.Root bind:open={cancelOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Cancel Task</Dialog.Title>
			<Dialog.Description>Are you sure you want to cancel this task?</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/cancel" use:enhance={() => {
			cancelOpen = false;
			return ({ result }) => handleResult(result);
		}}>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (cancelOpen = false)}>Keep Task</Button>
				<Button variant="destructive" type="submit">Cancel Task</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
