<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { manualTriggerSchema } from '$lib/schemas/micro-certifications';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message: formMessage } = superForm(data.form, {
		validators: zodClient(manualTriggerSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Certification triggered successfully');
			}
		}
	});
</script>

<div class="space-y-6 p-6">
	<div>
		<a href="/governance/micro-certifications" class="text-sm text-muted-foreground hover:text-foreground">
			&larr; Back to Micro Certifications
		</a>
		<h1 class="mt-2 text-2xl font-bold tracking-tight">Trigger Certification</h1>
		<p class="text-sm text-muted-foreground">Manually trigger a micro certification for a specific user-entitlement combination.</p>
	</div>

	{#if $formMessage}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
			{$formMessage}
		</div>
	{/if}

	<form method="POST" use:enhance class="max-w-lg space-y-6">
		<div class="space-y-2">
			<Label for="user_id">User ID</Label>
			<Input id="user_id" name="user_id" bind:value={$form.user_id} placeholder="User UUID" />
			{#if $errors.user_id}<p class="text-sm text-destructive">{$errors.user_id}</p>{/if}
		</div>

		<div class="space-y-2">
			<Label for="entitlement_id">Entitlement ID</Label>
			<Input id="entitlement_id" name="entitlement_id" bind:value={$form.entitlement_id} placeholder="Entitlement UUID" />
			{#if $errors.entitlement_id}<p class="text-sm text-destructive">{$errors.entitlement_id}</p>{/if}
		</div>

		<div class="space-y-2">
			<Label for="trigger_rule_id">Trigger Rule ID (optional)</Label>
			<Input id="trigger_rule_id" name="trigger_rule_id" bind:value={$form.trigger_rule_id} placeholder="Trigger rule UUID" />
		</div>

		<div class="space-y-2">
			<Label for="reviewer_id">Reviewer ID (optional)</Label>
			<Input id="reviewer_id" name="reviewer_id" bind:value={$form.reviewer_id} placeholder="Reviewer UUID" />
		</div>

		<div class="space-y-2">
			<Label for="reason">Reason</Label>
			<textarea
				id="reason"
				name="reason"
				bind:value={$form.reason}
				rows={3}
				class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				placeholder="Reason for triggering this certification..."
			></textarea>
			{#if $errors.reason}<p class="text-sm text-destructive">{$errors.reason}</p>{/if}
		</div>

		<div class="flex gap-3">
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Triggering...' : 'Trigger Certification'}
			</Button>
			<a href="/governance/micro-certifications">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
