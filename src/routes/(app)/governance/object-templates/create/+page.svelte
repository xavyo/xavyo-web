<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import { createObjectTemplateSchema } from '$lib/schemas/object-templates';
	import PageHeader from '$lib/components/layout/page-header.svelte';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message: formMessage } = superForm(data.form, {
		validators: zodClient(createObjectTemplateSchema)
	});
</script>

<PageHeader title="Create Object Template" description="Define a new template for automatic lifecycle rule application." />

{#if $formMessage}
	<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
		{$formMessage}
	</div>
{/if}

<form method="POST" use:enhance class="max-w-2xl space-y-6">
	<div>
		<label for="name" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
		<input
			id="name"
			type="text"
			name="name"
			bind:value={$form.name}
			class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		/>
		{#if $errors.name}<p class="mt-1 text-sm text-red-600">{$errors.name}</p>{/if}
	</div>

	<div>
		<label for="description" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
		<textarea
			id="description"
			name="description"
			bind:value={$form.description}
			rows={3}
			class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		></textarea>
		{#if $errors.description}<p class="mt-1 text-sm text-red-600">{$errors.description}</p>{/if}
	</div>

	<div>
		<label for="object_type" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Object Type</label>
		<select
			id="object_type"
			name="object_type"
			bind:value={$form.object_type}
			class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		>
			<option value="user">User</option>
			<option value="role">Role</option>
			<option value="entitlement">Entitlement</option>
			<option value="application">Application</option>
		</select>
		{#if $errors.object_type}<p class="mt-1 text-sm text-red-600">{$errors.object_type}</p>{/if}
	</div>

	<div>
		<label for="priority" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Priority</label>
		<input
			id="priority"
			type="number"
			name="priority"
			bind:value={$form.priority}
			min="1"
			max="1000"
			class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
		/>
		{#if $errors.priority}<p class="mt-1 text-sm text-red-600">{$errors.priority}</p>{/if}
	</div>

	<div class="flex gap-3">
		<button
			type="submit"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			Create Template
		</button>
		<a
			href="/governance/object-templates"
			class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
		>
			Cancel
		</a>
	</div>
</form>
