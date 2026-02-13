<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createPeerGroupSchema, PEER_GROUP_TYPES } from '$lib/schemas/peer-groups';
	import PageHeader from '$lib/components/layout/page-header.svelte';

	let { data } = $props();

	const { form, errors, enhance, message, submitting } = superForm(data.form, {
		validators: zodClient(createPeerGroupSchema)
	});

	const groupTypeLabels: Record<string, string> = {
		department: 'Department',
		role: 'Role',
		location: 'Location',
		custom: 'Custom'
	};
</script>

<PageHeader title="Create Peer Group" description="Define a new peer group for outlier comparison" />

{#if $message}
	<div class="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
		{$message}
	</div>
{/if}

<form method="POST" use:enhance class="max-w-xl space-y-4">
	<div>
		<label for="name" class="mb-1 block text-sm font-medium">Name</label>
		<input
			id="name"
			type="text"
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			bind:value={$form.name}
		/>
		{#if $errors.name}<p class="mt-1 text-xs text-destructive">{$errors.name}</p>{/if}
	</div>

	<div>
		<label for="group_type" class="mb-1 block text-sm font-medium">Group Type</label>
		<select
			id="group_type"
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			bind:value={$form.group_type}
		>
			<option value="">Select type...</option>
			{#each PEER_GROUP_TYPES as t}
				<option value={t}>{groupTypeLabels[t] ?? t}</option>
			{/each}
		</select>
		{#if $errors.group_type}<p class="mt-1 text-xs text-destructive">{$errors.group_type}</p>{/if}
	</div>

	<div>
		<label for="attribute_key" class="mb-1 block text-sm font-medium">Attribute Key</label>
		<input
			id="attribute_key"
			type="text"
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			bind:value={$form.attribute_key}
			placeholder="e.g., department, role, location"
		/>
		{#if $errors.attribute_key}<p class="mt-1 text-xs text-destructive">{$errors.attribute_key}</p>{/if}
	</div>

	<div>
		<label for="attribute_value" class="mb-1 block text-sm font-medium">Attribute Value</label>
		<input
			id="attribute_value"
			type="text"
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			bind:value={$form.attribute_value}
			placeholder="e.g., Engineering, Senior Engineer, US-West"
		/>
		{#if $errors.attribute_value}<p class="mt-1 text-xs text-destructive">{$errors.attribute_value}</p>{/if}
	</div>

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
			disabled={$submitting}
		>
			{$submitting ? 'Creating...' : 'Create Peer Group'}
		</button>
		<a
			href="/governance/peer-groups"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Cancel
		</a>
	</div>
</form>
