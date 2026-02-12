<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { Plus, Folder, Package } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	let categories = $derived(data.categories);
	let items = $derived(data.items);

	let activeTab = $state<'categories' | 'items'>('categories');
</script>

<PageHeader title="Catalog Administration" description="Manage catalog categories and items" />

<div class="mt-4 flex gap-2 border-b">
	<button
		class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'categories' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}"
		onclick={() => activeTab = 'categories'}
	>
		Categories ({data.categoriesTotal})
	</button>
	<button
		class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'items' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}"
		onclick={() => activeTab = 'items'}
	>
		Items ({data.itemsTotal})
	</button>
</div>

<div class="mt-6">
	{#if activeTab === 'categories'}
		<div class="mb-4 flex justify-end">
			<a href="/governance/catalog/admin/categories/create">
				<Button size="sm"><Plus class="mr-1.5 h-3.5 w-3.5" />New Category</Button>
			</a>
		</div>
		{#if categories.length === 0}
			<EmptyState title="No categories" description="Create your first catalog category." />
		{:else}
			<div class="space-y-2">
				{#each categories as cat (cat.id)}
					<a href="/governance/catalog/admin/categories/{cat.id}" class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted">
						<div class="flex items-center gap-3">
							<Folder class="h-5 w-5 text-muted-foreground" />
							<div>
								<p class="font-medium">{cat.name}</p>
								{#if cat.description}<p class="text-sm text-muted-foreground">{cat.description}</p>{/if}
							</div>
						</div>
						{#if cat.parent_id}
							<Badge variant="outline">Subcategory</Badge>
						{:else}
							<Badge variant="secondary">Root</Badge>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="mb-4 flex justify-end">
			<a href="/governance/catalog/admin/items/create">
				<Button size="sm"><Plus class="mr-1.5 h-3.5 w-3.5" />New Item</Button>
			</a>
		</div>
		{#if items.length === 0}
			<EmptyState title="No catalog items" description="Create your first catalog item." />
		{:else}
			<div class="space-y-2">
				{#each items as item (item.id)}
					<a href="/governance/catalog/admin/items/{item.id}" class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted">
						<div class="flex items-center gap-3">
							<Package class="h-5 w-5 text-muted-foreground" />
							<div>
								<p class="font-medium">{item.name}</p>
								{#if item.description}<p class="text-sm text-muted-foreground line-clamp-1">{item.description}</p>{/if}
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant="outline">{item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}</Badge>
							{#if !item.is_enabled}
								<Badge variant="destructive">Disabled</Badge>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	{/if}
</div>
