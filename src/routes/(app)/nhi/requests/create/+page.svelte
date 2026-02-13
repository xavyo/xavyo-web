<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { submitNhiRequestSchema } from '$lib/schemas/nhi-requests';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(submitNhiRequestSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'NHI request submitted successfully');
			}
		}
	});
</script>

<PageHeader title="Submit NHI Request" description="Request creation of a new non-human identity">
	<a href="/nhi/requests" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Requests</a>
</PageHeader>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Request details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input id="name" name="name" placeholder="Service account or agent name" bind:value={$form.name} />
				{#if $errors.name}<p class="text-sm text-destructive">{$errors.name}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="purpose">Purpose</Label>
				<textarea id="purpose" name="purpose" class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Why is this NHI needed? (min 10 characters)" bind:value={$form.purpose}></textarea>
				{#if $errors.purpose}<p class="text-sm text-destructive">{$errors.purpose}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="requested_permissions">Permissions (comma-separated UUIDs, optional)</Label>
				<Input id="requested_permissions" name="requested_permissions" placeholder="uuid1, uuid2, ..." bind:value={$form.requested_permissions} />
				{#if $errors.requested_permissions}<p class="text-sm text-destructive">{$errors.requested_permissions}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label for="requested_expiration">Expiration Date (optional)</Label>
				<Input id="requested_expiration" name="requested_expiration" type="datetime-local" bind:value={$form.requested_expiration} />
			</div>

			<div class="space-y-2">
				<Label for="rotation_interval_days">Credential Rotation Interval (days, optional)</Label>
				<Input id="rotation_interval_days" name="rotation_interval_days" type="number" min="1" max="365" placeholder="e.g. 90" bind:value={$form.rotation_interval_days} />
				{#if $errors.rotation_interval_days}<p class="text-sm text-destructive">{$errors.rotation_interval_days}</p>{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Submit Request</Button>
				<a href="/nhi/requests" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</a>
			</div>
		</form>
	</CardContent>
</Card>
