<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createBulkActionSchema, BULK_ACTION_TYPES } from '$lib/schemas/governance-operations';
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
		validators: zodClient(createBulkActionSchema),
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Bulk action created successfully');
			}
		}
	});

	const actionTypeLabels: Record<string, string> = {
		assign_role: 'Assign Role',
		revoke_role: 'Revoke Role',
		enable: 'Enable',
		disable: 'Disable',
		modify_attribute: 'Modify Attribute'
	};
</script>

<PageHeader title="Create Bulk Action" description="Define a new bulk action to apply across multiple identities">
	<a
		href="/governance/operations"
		class="text-sm text-muted-foreground hover:text-foreground"
	>
		&larr; Back to Operations
	</a>
</PageHeader>

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Bulk action details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="filter_expression">Filter Expression</Label>
				<textarea
					id="filter_expression"
					name="filter_expression"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="e.g. department == 'engineering' AND status == 'active'"
					bind:value={$form.filter_expression}
				></textarea>
				{#if $errors.filter_expression}
					<p class="text-sm text-destructive">{$errors.filter_expression}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="action_type">Action Type</Label>
				<select
					id="action_type"
					name="action_type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					bind:value={$form.action_type}
				>
					<option value="" disabled>Select action type</option>
					{#each BULK_ACTION_TYPES as at}
						<option value={at}>{actionTypeLabels[at] ?? at}</option>
					{/each}
				</select>
				{#if $errors.action_type}
					<p class="text-sm text-destructive">{$errors.action_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="action_params">Action Parameters (JSON)</Label>
				<textarea
					id="action_params"
					name="action_params"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder={'{"role_id": "uuid-here"}'}
					bind:value={$form.action_params}
				></textarea>
				{#if $errors.action_params}
					<p class="text-sm text-destructive">{$errors.action_params}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="justification">Justification</Label>
				<textarea
					id="justification"
					name="justification"
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Explain why this bulk action is needed (min 10 characters)"
					bind:value={$form.justification}
				></textarea>
				{#if $errors.justification}
					<p class="text-sm text-destructive">{$errors.justification}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create bulk action</Button>
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
