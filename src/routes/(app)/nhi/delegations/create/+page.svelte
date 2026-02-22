<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createDelegationSchema } from '$lib/schemas/nhi-delegations';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(createDelegationSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Delegation grant created successfully');
			}
		}
	});
</script>

<PageHeader title="Create Delegation Grant" description="Grant RFC 8693 token exchange delegation between a principal and an NHI actor">
	<a href="/nhi/delegations" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Delegations</a>
</PageHeader>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Grant details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="principal_id">Principal ID</Label>
				<Input id="principal_id" name="principal_id" placeholder="UUID of user or NHI principal" bind:value={$form.principal_id} />
				{#if $errors.principal_id}<p class="text-sm text-destructive">{$errors.principal_id}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="principal_type">Principal Type</Label>
				<select id="principal_type" name="principal_type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={String($form.principal_type ?? '')} onchange={(e) => { $form.principal_type = (e.target as HTMLSelectElement).value as 'user' | 'nhi'; }}>
					<option value="user">User</option>
					<option value="nhi">NHI</option>
				</select>
				{#if $errors.principal_type}<p class="text-sm text-destructive">{$errors.principal_type}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="actor_nhi_id">Actor NHI ID</Label>
				<Input id="actor_nhi_id" name="actor_nhi_id" placeholder="UUID of the NHI that will act on behalf" bind:value={$form.actor_nhi_id} />
				{#if $errors.actor_nhi_id}<p class="text-sm text-destructive">{$errors.actor_nhi_id}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="allowed_scopes">Allowed Scopes (comma-separated, leave empty for all)</Label>
				<Input id="allowed_scopes" name="allowed_scopes" placeholder="read, write, admin" bind:value={$form.allowed_scopes} />
				{#if $errors.allowed_scopes}<p class="text-sm text-destructive">{$errors.allowed_scopes}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="allowed_resource_types">Allowed Resource Types (comma-separated, leave empty for all)</Label>
				<Input id="allowed_resource_types" name="allowed_resource_types" placeholder="api, data, service" bind:value={$form.allowed_resource_types} />
				{#if $errors.allowed_resource_types}<p class="text-sm text-destructive">{$errors.allowed_resource_types}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="max_delegation_depth">Max Delegation Depth (1-5, optional)</Label>
				<Input id="max_delegation_depth" name="max_delegation_depth" type="number" min="1" max="5" placeholder="e.g. 1" bind:value={$form.max_delegation_depth} />
				{#if $errors.max_delegation_depth}<p class="text-sm text-destructive">{$errors.max_delegation_depth}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="expires_at">Expires At (optional)</Label>
				<Input id="expires_at" name="expires_at" type="datetime-local" bind:value={$form.expires_at} />
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Grant</Button>
				<a href="/nhi/delegations" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</a>
			</div>
		</form>
	</CardContent>
</Card>
