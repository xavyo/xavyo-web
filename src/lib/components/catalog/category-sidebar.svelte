<script lang="ts">
	import type { CatalogCategory } from '$lib/api/types';
	import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-svelte';

	interface Props {
		categories: CatalogCategory[];
		selectedCategoryId?: string | null;
		onSelect: (categoryId: string | null) => void;
	}

	let { categories, selectedCategoryId = null, onSelect }: Props = $props();

	let expandedIds = $state<Set<string>>(new Set());

	// Build tree from flat list
	const categoryTree = $derived.by(() => {
		const map = new Map<string | null, CatalogCategory[]>();
		for (const cat of categories) {
			const parentKey = cat.parent_id;
			if (!map.has(parentKey)) map.set(parentKey, []);
			map.get(parentKey)!.push(cat);
		}
		return map;
	});

	function getRootCategories(): CatalogCategory[] {
		return categoryTree.get(null) ?? [];
	}

	function getChildren(parentId: string): CatalogCategory[] {
		return categoryTree.get(parentId) ?? [];
	}

	function toggleExpand(id: string) {
		const next = new Set(expandedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedIds = next;
	}

	function handleSelect(id: string | null) {
		onSelect(id);
	}
</script>

<nav class="space-y-1" aria-label="Category navigation">
	<button
		class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors {selectedCategoryId === null ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}"
		onclick={() => handleSelect(null)}
	>
		All Categories
	</button>

	{#each getRootCategories() as category (category.id)}
		{@const children = getChildren(category.id)}
		{@const isExpanded = expandedIds.has(category.id)}
		{@const isSelected = selectedCategoryId === category.id}
		<div>
			<div class="flex items-center">
				{#if children.length > 0}
					<button
						class="mr-1 rounded p-0.5 hover:bg-muted"
						onclick={() => toggleExpand(category.id)}
						aria-label={isExpanded ? 'Collapse' : 'Expand'}
					>
						{#if isExpanded}
							<ChevronDown class="h-3.5 w-3.5" />
						{:else}
							<ChevronRight class="h-3.5 w-3.5" />
						{/if}
					</button>
				{:else}
					<span class="mr-1 w-5"></span>
				{/if}
				<button
					class="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors {isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}"
					onclick={() => handleSelect(category.id)}
				>
					{#if isExpanded}
						<FolderOpen class="h-4 w-4" />
					{:else}
						<Folder class="h-4 w-4" />
					{/if}
					{category.name}
				</button>
			</div>

			{#if isExpanded && children.length > 0}
				<div class="ml-5 border-l pl-2">
					{#each children as child (child.id)}
						{@const grandchildren = getChildren(child.id)}
						{@const childExpanded = expandedIds.has(child.id)}
						{@const childSelected = selectedCategoryId === child.id}
						<div>
							<div class="flex items-center">
								{#if grandchildren.length > 0}
									<button
										class="mr-1 rounded p-0.5 hover:bg-muted"
										onclick={() => toggleExpand(child.id)}
										aria-label={childExpanded ? 'Collapse' : 'Expand'}
									>
										{#if childExpanded}
											<ChevronDown class="h-3 w-3" />
										{:else}
											<ChevronRight class="h-3 w-3" />
										{/if}
									</button>
								{:else}
									<span class="mr-1 w-4"></span>
								{/if}
								<button
									class="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors {childSelected ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}"
									onclick={() => handleSelect(child.id)}
								>
									<Folder class="h-3.5 w-3.5" />
									{child.name}
								</button>
							</div>
							{#if childExpanded && grandchildren.length > 0}
								<div class="ml-4 border-l pl-2">
									{#each grandchildren as gc (gc.id)}
										{@const gcSelected = selectedCategoryId === gc.id}
										<button
											class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors {gcSelected ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}"
											onclick={() => handleSelect(gc.id)}
										>
											<Folder class="h-3 w-3" />
											{gc.name}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</nav>
