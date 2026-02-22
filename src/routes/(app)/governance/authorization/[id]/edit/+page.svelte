<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
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
		onResult({ result }) {
			if (result.type === 'redirect') {
				addToast('success', 'Policy updated successfully');
			}
		}
	});
</script>

<PageHeader title="Edit Policy" description="Update authorization policy settings" />

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Policy details</h2>
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
					placeholder="e.g. Allow read access to documents"
					value={String($form.name ?? '')}
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
					placeholder="Brief description of this policy"
					value={String($form.description ?? '')}
				></textarea>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="effect">Effect</Label>
				<select
					id="effect"
					name="effect"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					value={String($form.effect ?? 'allow')}
				>
					<option value="allow" selected={$form.effect === 'allow'}>Allow</option>
					<option value="deny" selected={$form.effect === 'deny'}>Deny</option>
				</select>
				{#if $errors.effect}
					<p class="text-sm text-destructive">{$errors.effect}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="priority">Priority</Label>
				<Input
					id="priority"
					name="priority"
					type="number"
					placeholder="100"
					value={String($form.priority ?? '100')}
				/>
				<p class="text-xs text-muted-foreground">
					Lower numbers = higher priority. Range: 0-10000.
				</p>
				{#if $errors.priority}
					<p class="text-sm text-destructive">{$errors.priority}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="resource_type">Resource Type</Label>
				<Input
					id="resource_type"
					name="resource_type"
					type="text"
					placeholder="e.g. document, user, report"
					value={String($form.resource_type ?? '')}
				/>
				{#if $errors.resource_type}
					<p class="text-sm text-destructive">{$errors.resource_type}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="action">Action</Label>
				<Input
					id="action"
					name="action"
					type="text"
					placeholder="e.g. read, write, delete"
					value={String($form.action ?? '')}
				/>
				{#if $errors.action}
					<p class="text-sm text-destructive">{$errors.action}</p>
				{/if}
			</div>

			<p class="text-sm text-muted-foreground">
				Conditions are managed on the policy detail page.
			</p>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Save Changes</Button>
				<a
					href="/governance/authorization/{data.policy.id}"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
