<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createCatalogItemSchema, CATALOG_ITEM_TYPES, CATALOG_ITEM_TYPE_LABELS } from '$lib/schemas/catalog';

	let { data }: { data: PageData } = $props();
	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(createCatalogItemSchema)
	});

</script>

<PageHeader title="Create Catalog Item" description="Add a new item to the request catalog" />

<form method="POST" use:enhance class="mt-6 max-w-lg space-y-4">
	<div>
		<label for="item_type" class="mb-1 block text-sm font-medium">Type *</label>
		<select id="item_type" name="item_type" bind:value={$form.item_type} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
			<option value="">Select type...</option>
			{#each CATALOG_ITEM_TYPES as t}
				<option value={t}>{CATALOG_ITEM_TYPE_LABELS[t] ?? t}</option>
			{/each}
		</select>
		{#if $errors.item_type}<p class="mt-1 text-sm text-destructive">{$errors.item_type}</p>{/if}
	</div>

	<div>
		<label for="name" class="mb-1 block text-sm font-medium">Name *</label>
		<input id="name" name="name" bind:value={$form.name} class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
		{#if $errors.name}<p class="mt-1 text-sm text-destructive">{$errors.name}</p>{/if}
	</div>

	<div>
		<label for="description" class="mb-1 block text-sm font-medium">Description</label>
		<textarea id="description" name="description" bind:value={$form.description} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm"></textarea>
	</div>

	<div>
		<label for="category_id" class="mb-1 block text-sm font-medium">Category</label>
		<select id="category_id" name="category_id" bind:value={$form.category_id} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
			<option value="">Uncategorized</option>
			{#each data.categories as cat}
				<option value={cat.id}>{cat.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="tags" class="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
		<input id="tags" name="tags" bind:value={$form.tags} placeholder="engineering, devtools, cloud" class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
	</div>

	<div class="flex gap-3">
		<Button type="submit">Create Item</Button>
		<a href="/governance/catalog/admin"><Button variant="outline" type="button">Cancel</Button></a>
	</div>
</form>
