<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createSlaPolicySchema } from '$lib/schemas/governance-operations';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(createSlaPolicySchema),
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				addToast('success', 'SLA policy created successfully');
			}
		}
	});

	$effect(() => {
		if ($message) addToast('error', $message);
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Create SLA Policy" description="Define a new SLA policy for governance operations." />
	<a
		href="/governance/operations"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back
	</a>
</div>

<Card class="mt-6 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Policy Details</h2>
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
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="e.g. Access Request SLA"
					bind:value={$form.name}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="description">Description (optional)</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Brief description of this SLA policy"
					bind:value={$form.description}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="target_duration_seconds">Target Duration (seconds)</Label>
					<Input
						id="target_duration_seconds"
						name="target_duration_seconds"
						type="number"
						min="60"
						max="604800"
						placeholder="e.g. 86400"
						bind:value={$form.target_duration_seconds}
					/>
					{#if $errors.target_duration_seconds}
						<p class="text-sm text-destructive">{$errors.target_duration_seconds}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="warning_threshold_percent">Warning Threshold (%)</Label>
					<Input
						id="warning_threshold_percent"
						name="warning_threshold_percent"
						type="number"
						min="1"
						max="100"
						placeholder="e.g. 75"
						bind:value={$form.warning_threshold_percent}
					/>
					{#if $errors.warning_threshold_percent}
						<p class="text-sm text-destructive">{$errors.warning_threshold_percent}</p>
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="breach_notification_enabled"
					name="breach_notification_enabled"
					class="h-4 w-4 rounded border-input"
					bind:checked={$form.breach_notification_enabled}
					value="true"
				/>
				<Label for="breach_notification_enabled">Breach Notification Enabled</Label>
			</div>

			<div class="space-y-2">
				<Label for="escalation_contacts">Escalation Contacts (optional)</Label>
				<Input
					id="escalation_contacts"
					name="escalation_contacts"
					type="text"
					placeholder="Comma-separated contact emails or IDs"
					bind:value={$form.escalation_contacts}
				/>
				{#if $errors.escalation_contacts}
					<p class="text-sm text-destructive">{$errors.escalation_contacts}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create Policy</Button>
				<a
					href="/governance/operations"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
