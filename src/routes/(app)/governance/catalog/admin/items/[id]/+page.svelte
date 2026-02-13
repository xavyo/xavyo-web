<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { updateCatalogItemSchema } from '$lib/schemas/catalog';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data }: { data: PageData } = $props();
	let item = $derived(data.item);
	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(updateCatalogItemSchema)
	});

	let showDeleteConfirm = $state(false);
</script>

<div class="flex items-center gap-3">
	<PageHeader title={item.name} description="Edit catalog item details" />
	<Badge variant="outline">{item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}</Badge>
	{#if !item.is_enabled}
		<Badge variant="destructive">Disabled</Badge>
	{/if}
</div>

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
			<label for="category_id" class="mb-1 block text-sm font-medium">Category</label>
			<select id="category_id" name="category_id" bind:value={$form.category_id} class="w-full rounded-md border bg-background px-3 py-2 text-sm">
				<option value="">Uncategorized</option>
				{#each data.categories as cat}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>
		</div>
		<div class="flex gap-3">
			<Button type="submit">Save Changes</Button>
			<a href="/governance/catalog/admin"><Button variant="outline" type="button">Cancel</Button></a>
		</div>
	</form>

	<!-- Enable/Disable -->
	<div class="border-t pt-4">
		{#if item.is_enabled}
			<form method="POST" action="?/disable" use:formEnhance={() => {
				return async ({ update }) => {
					await update();
					addToast('success', 'Item disabled');
					invalidateAll();
				};
			}}>
				<Button variant="outline" type="submit">Disable Item</Button>
			</form>
		{:else}
			<form method="POST" action="?/enable" use:formEnhance={() => {
				return async ({ update }) => {
					await update();
					addToast('success', 'Item enabled');
					invalidateAll();
				};
			}}>
				<Button type="submit">Enable Item</Button>
			</form>
		{/if}
	</div>

	<!-- Delete -->
	<div class="border-t pt-4">
		{#if showDeleteConfirm}
			<p class="mb-2 text-sm text-destructive">This will permanently delete this item. Are you sure?</p>
			<form method="POST" action="?/delete">
				<div class="flex gap-2">
					<Button variant="destructive" type="submit">Confirm Delete</Button>
					<Button variant="outline" type="button" onclick={() => showDeleteConfirm = false}>Cancel</Button>
				</div>
			</form>
		{:else}
			<Button variant="outline" onclick={() => showDeleteConfirm = true}>Delete Item</Button>
		{/if}
	</div>
</div>
