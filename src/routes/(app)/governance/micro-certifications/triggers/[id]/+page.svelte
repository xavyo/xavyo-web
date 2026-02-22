<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { invalidateAll } from '$app/navigation';
	import { updateTriggerRuleSchema } from '$lib/schemas/micro-certifications';
	import TriggerRuleBadge from '$lib/components/micro-certifications/trigger-rule-badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	const rule = $derived(data.rule);
	let isEditing = $state(false);
	let deleteConfirm = $state(false);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message: formMessage } = superForm(data.form, {
		validators: zodClient(updateTriggerRuleSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				addToast('success', 'Trigger rule updated');
				isEditing = false;
				invalidateAll();
			}
		}
	});

	async function handleAction(action: string) {
		const formData = new FormData();
		const res = await fetch(`?/${action}`, { method: 'POST', body: formData });
		const result = await res.json();

		if (result.type === 'success') {
			addToast('success', `Trigger rule ${action === 'setDefault' ? 'set as default' : action + 'd'}`);
			await invalidateAll();
		} else if (result.type === 'redirect') {
			window.location.href = '/governance/micro-certifications';
		} else {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}

	const reviewerTypeLabels: Record<string, string> = {
		user_manager: 'User Manager',
		entitlement_owner: 'Entitlement Owner',
		application_owner: 'Application Owner',
		specific_user: 'Specific User'
	};

	function formatDate(dateStr: string): string {
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
			<a href="/governance/micro-certifications" class="text-sm text-muted-foreground hover:text-foreground">
				&larr; Back to Micro Certifications
			</a>
			<h1 class="mt-2 text-2xl font-bold tracking-tight">{rule.name}</h1>
			<div class="mt-1 flex items-center gap-2">
				<TriggerRuleBadge type="trigger" value={rule.trigger_type} />
				<TriggerRuleBadge type="scope" value={rule.scope_type} />
				{#if rule.is_default}
					<span class="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>
				{/if}
				{#if rule.is_active}
					<span class="text-xs text-green-600 dark:text-green-400">Active</span>
				{:else}
					<span class="text-xs text-gray-500">Inactive</span>
				{/if}
			</div>
		</div>
		<div class="flex gap-2">
			{#if rule.is_active}
				<Button variant="outline" size="sm" onclick={() => handleAction('disable')}>Disable</Button>
			{:else}
				<Button variant="outline" size="sm" onclick={() => handleAction('enable')}>Enable</Button>
			{/if}
			{#if !rule.is_default}
				<Button variant="outline" size="sm" onclick={() => handleAction('setDefault')}>Set as Default</Button>
			{/if}
			<Button variant="outline" size="sm" onclick={() => (isEditing = !isEditing)}>
				{isEditing ? 'Cancel Edit' : 'Edit'}
			</Button>
			{#if !deleteConfirm}
				<Button variant="destructive" size="sm" onclick={() => (deleteConfirm = true)}>Delete</Button>
			{:else}
				<Button variant="destructive" size="sm" onclick={() => handleAction('delete')}>Confirm Delete</Button>
				<Button variant="outline" size="sm" onclick={() => (deleteConfirm = false)}>Cancel</Button>
			{/if}
		</div>
	</div>

	{#if $formMessage}
		<div class="rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
			{$formMessage}
		</div>
	{/if}

	{#if isEditing}
		<form method="POST" action="?/update" use:enhance class="max-w-2xl space-y-4 rounded-md border p-6">
			<h2 class="text-lg font-semibold">Edit Trigger Rule</h2>

			<div class="space-y-2">
				<Label for="edit-name">Name</Label>
				<Input id="edit-name" name="name" bind:value={$form.name} />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-timeout">Timeout (seconds)</Label>
					<Input id="edit-timeout" name="timeout_secs" type="number" bind:value={$form.timeout_secs} />
				</div>
				<div class="space-y-2">
					<Label for="edit-reminder">Reminder (%)</Label>
					<Input id="edit-reminder" name="reminder_threshold_percent" type="number" bind:value={$form.reminder_threshold_percent} min="0" max="100" />
				</div>
			</div>

			<div class="space-y-3">
				<label class="flex items-center gap-2">
					<input type="checkbox" name="auto_revoke" bind:checked={$form.auto_revoke} />
					<span class="text-sm">Auto-revoke on expiration</span>
				</label>
				<label class="flex items-center gap-2">
					<input type="checkbox" name="revoke_triggering_assignment" bind:checked={$form.revoke_triggering_assignment} />
					<span class="text-sm">Revoke triggering assignment</span>
				</label>
			</div>

			<div class="flex gap-3">
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Saving...' : 'Save Changes'}
				</Button>
				<Button variant="outline" type="button" onclick={() => (isEditing = false)}>Cancel</Button>
			</div>
		</form>
	{:else}
		<div class="rounded-md border p-6">
			<h2 class="mb-4 text-lg font-semibold">Rule Details</h2>
			<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Trigger Type</dt>
					<dd class="mt-1"><TriggerRuleBadge type="trigger" value={rule.trigger_type} /></dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Scope</dt>
					<dd class="mt-1"><TriggerRuleBadge type="scope" value={rule.scope_type} /></dd>
				</div>
				{#if rule.scope_id}
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Scope ID</dt>
						<dd class="mt-1 font-mono text-sm">{rule.scope_id}</dd>
					</div>
				{/if}
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Reviewer Type</dt>
					<dd class="mt-1 text-sm">{reviewerTypeLabels[rule.reviewer_type] ?? rule.reviewer_type}</dd>
				</div>
				{#if rule.specific_reviewer_id}
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Specific Reviewer</dt>
						<dd class="mt-1 font-mono text-sm">{rule.specific_reviewer_id}</dd>
					</div>
				{/if}
				{#if rule.fallback_reviewer_id}
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Fallback Reviewer</dt>
						<dd class="mt-1 font-mono text-sm">{rule.fallback_reviewer_id}</dd>
					</div>
				{/if}
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Timeout</dt>
					<dd class="mt-1 text-sm">{rule.timeout_secs ? `${rule.timeout_secs}s` : 'None'}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Reminder Threshold</dt>
					<dd class="mt-1 text-sm">{rule.reminder_threshold_percent ? `${rule.reminder_threshold_percent}%` : 'None'}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Auto-Revoke</dt>
					<dd class="mt-1 text-sm">{rule.auto_revoke ? 'Yes' : 'No'}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Priority</dt>
					<dd class="mt-1 text-sm">{rule.priority ?? 'Default'}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Created</dt>
					<dd class="mt-1 text-sm">{formatDate(rule.created_at)}</dd>
				</div>
			</dl>
		</div>
	{/if}
</div>
