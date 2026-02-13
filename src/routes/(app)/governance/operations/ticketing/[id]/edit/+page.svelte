<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { updateTicketingConfigSchema } from '$lib/schemas/governance-operations';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const config = $derived(data.config);

	const { form, errors, enhance, message } = superForm(data.form, {
		validators: zodClient(updateTicketingConfigSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Ticketing configuration updated successfully');
			}
		}
	});
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Edit Ticketing Configuration"
		description="Update ticketing system integration settings"
	/>
	<a
		href="/governance/operations/ticketing/{config.id}"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Details
	</a>
</div>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Configuration details</h2>
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
					placeholder="e.g. Production ServiceNow"
					bind:value={$form.name}
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="endpoint_url">Endpoint URL</Label>
				<Input
					id="endpoint_url"
					name="endpoint_url"
					type="url"
					placeholder="https://example.service-now.com/api"
					bind:value={$form.endpoint_url}
				/>
				{#if $errors.endpoint_url}
					<p class="text-sm text-destructive">{$errors.endpoint_url}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="credentials">Credentials (leave empty to keep current)</Label>
				<Input
					id="credentials"
					name="credentials"
					type="password"
					placeholder="Enter new credentials to update"
					bind:value={$form.credentials}
				/>
				{#if $errors.credentials}
					<p class="text-sm text-destructive">{$errors.credentials}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="field_mappings">Field Mappings (optional, JSON)</Label>
				<textarea
					id="field_mappings"
					name="field_mappings"
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder={'{"priority": "urgency"}'}
					bind:value={$form.field_mappings}
				></textarea>
				{#if $errors.field_mappings}
					<p class="text-sm text-destructive">{$errors.field_mappings}</p>
				{/if}
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="default_assignee">Default Assignee (optional)</Label>
					<Input
						id="default_assignee"
						name="default_assignee"
						type="text"
						placeholder="e.g. admin@example.com"
						bind:value={$form.default_assignee}
					/>
					{#if $errors.default_assignee}
						<p class="text-sm text-destructive">{$errors.default_assignee}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="default_assignment_group">Default Assignment Group (optional)</Label>
					<Input
						id="default_assignment_group"
						name="default_assignment_group"
						type="text"
						placeholder="e.g. IAM Team"
						bind:value={$form.default_assignment_group}
					/>
					{#if $errors.default_assignment_group}
						<p class="text-sm text-destructive">{$errors.default_assignment_group}</p>
					{/if}
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="project_key">Project Key (optional)</Label>
					<Input
						id="project_key"
						name="project_key"
						type="text"
						placeholder="e.g. IAM"
						bind:value={$form.project_key}
					/>
					{#if $errors.project_key}
						<p class="text-sm text-destructive">{$errors.project_key}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="issue_type">Issue Type (optional)</Label>
					<Input
						id="issue_type"
						name="issue_type"
						type="text"
						placeholder="e.g. Task"
						bind:value={$form.issue_type}
					/>
					{#if $errors.issue_type}
						<p class="text-sm text-destructive">{$errors.issue_type}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="polling_interval_seconds">Polling Interval (seconds)</Label>
				<Input
					id="polling_interval_seconds"
					name="polling_interval_seconds"
					type="number"
					min="60"
					max="3600"
					placeholder="e.g. 300"
					bind:value={$form.polling_interval_seconds}
				/>
				{#if $errors.polling_interval_seconds}
					<p class="text-sm text-destructive">{$errors.polling_interval_seconds}</p>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="is_active"
					name="is_active"
					class="h-4 w-4 rounded border-input"
					bind:checked={$form.is_active}
					value="true"
				/>
				<Label for="is_active">Active</Label>
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Save Changes</Button>
				<a
					href="/governance/operations/ticketing/{config.id}"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
