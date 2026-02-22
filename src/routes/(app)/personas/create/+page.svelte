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
				addToast('success', 'Persona created successfully');
			}
		}
	});
</script>

<PageHeader title="Create persona" description="Assign a new persona identity to a physical user" />

<Card class="max-w-lg">
	<CardHeader>
		<h2 class="text-xl font-semibold">Persona details</h2>
	</CardHeader>
	<CardContent>
		{#if $message}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{$message}</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="archetype_id">Archetype</Label>
				<select
					id="archetype_id"
					name="archetype_id"
					class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					value={$form.archetype_id ?? ''}
				>
					<option value="">Select an archetype</option>
					{#each data.archetypes as archetype}
						<option value={archetype.id}>{archetype.name}</option>
					{/each}
				</select>
				{#if $errors.archetype_id}
					<p class="text-sm text-destructive">{$errors.archetype_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="physical_user_id">Physical user</Label>
				<select
					id="physical_user_id"
					name="physical_user_id"
					class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					value={$form.physical_user_id ?? ''}
				>
					<option value="">Select a user</option>
					{#each data.users as user}
						<option value={user.id}>{user.email}</option>
					{/each}
				</select>
				{#if $errors.physical_user_id}
					<p class="text-sm text-destructive">{$errors.physical_user_id}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="valid_from">Valid from (optional)</Label>
				<Input
					id="valid_from"
					name="valid_from"
					type="date"
					value={String($form.valid_from ?? '')}
				/>
				{#if $errors.valid_from}
					<p class="text-sm text-destructive">{$errors.valid_from}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="valid_until">Valid until (optional)</Label>
				<Input
					id="valid_until"
					name="valid_until"
					type="date"
					value={String($form.valid_until ?? '')}
				/>
				{#if $errors.valid_until}
					<p class="text-sm text-destructive">{$errors.valid_until}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<Button type="submit">Create persona</Button>
				<a
					href="/personas"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Cancel
				</a>
			</div>
		</form>
	</CardContent>
</Card>
