<script lang="ts">
	import type { PageData } from './$types';
	import type { BulkActionPreview } from '$lib/api/types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { updateBulkActionSchema } from '$lib/schemas/governance-operations';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import BulkActionStatusBadge from '$lib/components/operations/bulk-action-status-badge.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data }: { data: PageData } = $props();
	const action = $derived(data.bulkAction);

	let preview: BulkActionPreview | null = $state(null);
	let previewing = $state(false);
	let executing = $state(false);

	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(updateBulkActionSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Bulk action updated successfully');
			}
		}
	});

	const ACTION_TYPE_LABELS: Record<string, string> = {
		assign_role: 'Assign Role',
		revoke_role: 'Revoke Role',
		enable: 'Enable',
		disable: 'Disable',
		modify_attribute: 'Modify Attribute'
	};

	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr || isNaN(new Date(dateStr).getTime())) return '--';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function handlePreview() {
		previewing = true;
		try {
			const res = await fetch(`/api/governance/bulk-actions/${action.id}/preview`, {
				method: 'POST'
			});
			if (!res.ok) throw new Error('Preview failed');
			preview = await res.json();
		} catch {
			addToast('error', 'Failed to preview bulk action');
		} finally {
			previewing = false;
		}
	}

	async function handleExecute() {
		executing = true;
		try {
			const res = await fetch(`/api/governance/bulk-actions/${action.id}/execute`, {
				method: 'POST'
			});
			if (!res.ok) throw new Error('Execute failed');
			addToast('success', 'Bulk action execution started');
			window.location.reload();
		} catch {
			addToast('error', 'Failed to execute bulk action');
		} finally {
			executing = false;
		}
	}
</script>

<PageHeader title="Bulk Action Detail" description={ACTION_TYPE_LABELS[action.action_type] ?? action.action_type}>
	<div class="flex items-center gap-3">
		<BulkActionStatusBadge status={action.status} />
		<button
			class="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
			disabled={previewing}
			onclick={handlePreview}
		>
			{previewing ? 'Previewing...' : 'Preview'}
		</button>
		{#if action.status === 'approved'}
			<button
				class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				disabled={executing}
				onclick={handleExecute}
			>
				{executing ? 'Executing...' : 'Execute'}
			</button>
		{/if}
		<a
			href="/governance/operations"
			class="text-sm text-muted-foreground hover:text-foreground"
		>
			&larr; Back
		</a>
	</div>
</PageHeader>

<div class="space-y-6">
	<!-- Detail Card -->
	<Card>
		<CardHeader>
			<h2 class="text-lg font-semibold">Details</h2>
		</CardHeader>
		<CardContent>
			<dl class="grid gap-4 sm:grid-cols-2">
				<div>
					<dt class="text-sm text-muted-foreground">Action Type</dt>
					<dd class="text-sm font-medium text-foreground">
						{ACTION_TYPE_LABELS[action.action_type] ?? action.action_type}
					</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Status</dt>
					<dd>
						<BulkActionStatusBadge status={action.status} />
					</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="text-sm text-muted-foreground">Filter Expression</dt>
					<dd class="mt-1 rounded-md bg-muted p-2 font-mono text-sm text-foreground">
						{action.filter_expression}
					</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="text-sm text-muted-foreground">Action Parameters</dt>
					<dd class="mt-1 rounded-md bg-muted p-2 font-mono text-sm text-foreground">
						{typeof action.action_params === 'string' ? action.action_params : JSON.stringify(action.action_params, null, 2)}
					</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="text-sm text-muted-foreground">Justification</dt>
					<dd class="text-sm text-foreground">{action.justification}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Total Matched</dt>
					<dd class="text-sm font-medium text-foreground">{action.total_matched}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Processed</dt>
					<dd class="text-sm font-medium text-foreground">{action.processed_count}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Succeeded</dt>
					<dd class="text-sm font-medium text-foreground">{action.success_count}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Failed</dt>
					<dd class="text-sm font-medium {action.failure_count > 0 ? 'text-destructive' : 'text-foreground'}">
						{action.failure_count}
					</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Skipped</dt>
					<dd class="text-sm font-medium text-foreground">{action.skipped_count}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Created</dt>
					<dd class="text-sm text-foreground">{formatDate(action.created_at)}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Started At</dt>
					<dd class="text-sm text-foreground">{formatDate(action.started_at)}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Completed At</dt>
					<dd class="text-sm text-foreground">{formatDate(action.completed_at)}</dd>
				</div>
			</dl>
		</CardContent>
	</Card>

	<!-- Edit Form (only for pending status) -->
	{#if action.status === 'pending'}
		<Card id="edit-section">
			<CardHeader>
				<h2 class="text-lg font-semibold">Edit Bulk Action</h2>
			</CardHeader>
			<CardContent>
				{#if $message}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{$message}</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" action="?/edit" use:enhance class="space-y-4">
					<div class="space-y-2">
						<Label for="edit-filter_expression">Filter Expression</Label>
						<textarea
							id="edit-filter_expression"
							name="filter_expression"
							class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							bind:value={$form.filter_expression}
						></textarea>
						{#if $errors.filter_expression}
							<p class="text-sm text-destructive">{$errors.filter_expression}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="edit-action_params">Action Parameters (JSON)</Label>
						<textarea
							id="edit-action_params"
							name="action_params"
							class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							bind:value={$form.action_params}
						></textarea>
						{#if $errors.action_params}
							<p class="text-sm text-destructive">{$errors.action_params}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="edit-justification">Justification</Label>
						<textarea
							id="edit-justification"
							name="justification"
							class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							bind:value={$form.justification}
						></textarea>
						{#if $errors.justification}
							<p class="text-sm text-destructive">{$errors.justification}</p>
						{/if}
					</div>

					<div class="flex gap-2 pt-2">
						<Button type="submit">Save changes</Button>
						<a
							href="/governance/operations/bulk-actions/{action.id}"
							class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							Cancel
						</a>
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}

	<!-- Preview Results -->
	{#if preview}
		<Card>
			<CardHeader>
				<h2 class="text-lg font-semibold">Preview Results</h2>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					<div class="flex flex-wrap gap-4 text-sm">
						<span>
							<span class="text-muted-foreground">Total matched:</span>
							<span class="font-medium text-foreground">{preview.total_matched}</span>
						</span>
						<span>
							<span class="text-muted-foreground">Would change:</span>
							<span class="font-medium text-foreground">{preview.would_change_count}</span>
						</span>
						<span>
							<span class="text-muted-foreground">No change:</span>
							<span class="font-medium text-foreground">{preview.no_change_count}</span>
						</span>
					</div>

					{#if preview.users.length > 0}
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-border">
										<th class="px-3 py-2 text-left text-muted-foreground">Name</th>
										<th class="px-3 py-2 text-left text-muted-foreground">Email</th>
										<th class="px-3 py-2 text-left text-muted-foreground">Current State</th>
										<th class="px-3 py-2 text-left text-muted-foreground">Would Change</th>
										<th class="px-3 py-2 text-left text-muted-foreground">Description</th>
									</tr>
								</thead>
								<tbody>
									{#each preview.users as user}
										<tr class="border-b border-border">
											<td class="px-3 py-2">{user.display_name ?? user.id}</td>
											<td class="px-3 py-2">{user.email}</td>
											<td class="px-3 py-2">{user.current_state ?? '--'}</td>
											<td class="px-3 py-2">{user.would_change ? 'Yes' : 'No'}</td>
											<td class="px-3 py-2 text-muted-foreground">{user.change_description ?? '--'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
