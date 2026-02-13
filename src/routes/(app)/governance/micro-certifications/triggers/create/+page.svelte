<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createTriggerRuleSchema } from '$lib/schemas/micro-certifications';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	const { form, errors, enhance, submitting, message: formMessage } = superForm(data.form, {
		validators: zodClient(createTriggerRuleSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Trigger rule created successfully');
			}
		}
	});

	const needsScopeId = $derived($form.scope_type !== 'tenant');
	const needsSpecificReviewer = $derived($form.reviewer_type === 'specific_user');
</script>

<div class="space-y-6 p-6">
	<div>
		<a href="/governance/micro-certifications" class="text-sm text-muted-foreground hover:text-foreground">
			&larr; Back to Micro Certifications
		</a>
		<h1 class="mt-2 text-2xl font-bold tracking-tight">Create Trigger Rule</h1>
		<p class="text-sm text-muted-foreground">Configure when micro certifications are automatically generated.</p>
	</div>

	{#if $formMessage}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
			{$formMessage}
		</div>
	{/if}

	<form method="POST" use:enhance class="max-w-2xl space-y-6">
		<div class="space-y-2">
			<Label for="name">Name</Label>
			<Input id="name" name="name" bind:value={$form.name} placeholder="e.g., Role Change Review" />
			{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="space-y-2">
				<Label for="trigger_type">Trigger Type</Label>
				<select id="trigger_type" name="trigger_type" class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" bind:value={$form.trigger_type}>
					<option value="high_risk_assignment">High Risk Assignment</option>
					<option value="sod_violation">SoD Violation</option>
					<option value="manager_change">Manager Change</option>
					<option value="periodic_recert">Periodic Re-certification</option>
					<option value="manual">Manual</option>
				</select>
				{#if $errors.trigger_type}<p class="text-sm text-destructive">{$errors.trigger_type}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="scope_type">Scope</Label>
				<select id="scope_type" name="scope_type" class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" bind:value={$form.scope_type}>
					<option value="tenant">Tenant-wide</option>
					<option value="application">Application</option>
					<option value="entitlement">Entitlement</option>
				</select>
				{#if $errors.scope_type}<p class="text-sm text-destructive">{$errors.scope_type}</p>{/if}
			</div>
		</div>

		{#if needsScopeId}
			<div class="space-y-2">
				<Label for="scope_id">Scope ID</Label>
				<Input id="scope_id" name="scope_id" bind:value={$form.scope_id} placeholder="Application or Entitlement UUID" />
				{#if $errors.scope_id}<p class="text-sm text-destructive">{$errors.scope_id}</p>{/if}
			</div>
		{/if}

		<div class="space-y-2">
			<Label for="reviewer_type">Reviewer Type</Label>
			<select id="reviewer_type" name="reviewer_type" class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" bind:value={$form.reviewer_type}>
				<option value="user_manager">User's Manager</option>
				<option value="entitlement_owner">Entitlement Owner</option>
				<option value="application_owner">Application Owner</option>
				<option value="specific_user">Specific User</option>
			</select>
			{#if $errors.reviewer_type}<p class="text-sm text-destructive">{$errors.reviewer_type}</p>{/if}
		</div>

		{#if needsSpecificReviewer}
			<div class="space-y-2">
				<Label for="specific_reviewer_id">Specific Reviewer ID</Label>
				<Input id="specific_reviewer_id" name="specific_reviewer_id" bind:value={$form.specific_reviewer_id} placeholder="Reviewer UUID" />
				{#if $errors.specific_reviewer_id}<p class="text-sm text-destructive">{$errors.specific_reviewer_id}</p>{/if}
			</div>
		{/if}

		<div class="space-y-2">
			<Label for="fallback_reviewer_id">Fallback Reviewer ID (optional)</Label>
			<Input id="fallback_reviewer_id" name="fallback_reviewer_id" bind:value={$form.fallback_reviewer_id} placeholder="Fallback reviewer UUID" />
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="space-y-2">
				<Label for="timeout_secs">Timeout (seconds)</Label>
				<Input id="timeout_secs" name="timeout_secs" type="number" bind:value={$form.timeout_secs} placeholder="e.g., 86400" />
			</div>
			<div class="space-y-2">
				<Label for="reminder_threshold_percent">Reminder Threshold (%)</Label>
				<Input id="reminder_threshold_percent" name="reminder_threshold_percent" type="number" bind:value={$form.reminder_threshold_percent} placeholder="e.g., 75" min="0" max="100" />
			</div>
		</div>

		<div class="space-y-3">
			<label class="flex items-center gap-2">
				<input type="checkbox" name="auto_revoke" bind:checked={$form.auto_revoke} />
				<span class="text-sm">Auto-revoke on expiration</span>
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" name="revoke_triggering_assignment" bind:checked={$form.revoke_triggering_assignment} />
				<span class="text-sm">Revoke triggering assignment on revocation</span>
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" name="is_default" bind:checked={$form.is_default} />
				<span class="text-sm">Set as default trigger rule</span>
			</label>
		</div>

		<div class="space-y-2">
			<Label for="priority">Priority (optional)</Label>
			<Input id="priority" name="priority" type="number" bind:value={$form.priority} placeholder="e.g., 10" min="0" />
		</div>

		<div class="flex gap-3">
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Creating...' : 'Create Trigger Rule'}
			</Button>
			<a href="/governance/micro-certifications">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
