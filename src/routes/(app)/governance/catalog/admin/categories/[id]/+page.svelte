<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { updateCategorySchema } from '$lib/schemas/catalog';

	let { data }: { data: PageData } = $props();
	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(updateCategorySchema)
	});

	let showDeleteConfirm = $state(false);
</script>

<PageHeader title="Category: {data.category.name}" description="Edit or delete this category" />

<div class="mt-6 max-w-lg space-y-6">
	<form method="POST" action="?/update" use:enhance class="space-y-4">
		<div>
			<label for="name" class="mb-1 block text-sm font-medium">Name</label>
			<input id="name" name="name" bind:value={$form.name} class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
			{#if $errors.name}<p class="mt-1 text-sm text-destructive">{$errors.name}</p>{/if}
		</div>
		<div>
			<label for="description" class="mb-1 block text-sm font-medium">Description</label>
			<textarea id="description" name="description" bind:value={$form.description} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm"></textarea>
		</div>
		<div>
			<label for="parent_id" class="mb-1 block text-sm font-medium">Parent Category</label>
			<select id="parent_id" name="parent_id" bind:value={$form.parent_id} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
				<option value="">None (root)</option>
				{#each data.parentCategories as cat}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="display_order" class="mb-1 block text-sm font-medium">Display Order</label>
			<input id="display_order" name="display_order" type="number" bind:value={$form.display_order} min="0" class="w-full rounded-md border bg-background px-3 py-2 text-sm" />
		</div>
		<div class="flex gap-3">
			<Button type="submit">Save Changes</Button>
			<a href="/governance/catalog/admin"><Button variant="outline" type="button">Cancel</Button></a>
		</div>
	</form>

	<div class="border-t pt-4">
		{#if showDeleteConfirm}
			<p class="mb-2 text-sm text-destructive">This will permanently delete this category. Are you sure?</p>
			<form method="POST" action="?/delete">
				<div class="flex gap-2">
					<Button variant="destructive" type="submit">Confirm Delete</Button>
					<Button variant="outline" type="button" onclick={() => showDeleteConfirm = false}>Cancel</Button>
				</div>
			</form>
		{:else}
			<Button variant="outline" onclick={() => showDeleteConfirm = true}>Delete Category</Button>
		{/if}
	</div>
</div>
