<script lang="ts">
	import type { CatalogItem } from '$lib/api/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ShoppingCart, Lock, Tag } from 'lucide-svelte';

	interface Props {
		item: CatalogItem;
		onAddToCart?: (item: CatalogItem) => void;
	}

	let { item, onAddToCart }: Props = $props();

	const typeBadgeVariant = $derived(
		item.item_type === 'role' ? 'default' :
		item.item_type === 'entitlement' ? 'secondary' : 'outline'
	);
	const typeLabel = $derived(item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1));
</script>

<div class="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md" data-testid="catalog-item-card">
	<div class="mb-2 flex items-start justify-between">
		<div class="flex-1">
			<h3 class="font-semibold text-card-foreground">{item.name}</h3>
			{#if item.description}
				<p class="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
			{/if}
		</div>
		<Badge variant={typeBadgeVariant}>{typeLabel}</Badge>
	</div>

	{#if item.tags.length > 0}
		<div class="mb-3 flex flex-wrap gap-1">
			{#each item.tags.slice(0, 5) as tag}
				<span class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
					<Tag class="h-2.5 w-2.5" />
					{tag}
				</span>
			{/each}
			{#if item.tags.length > 5}
				<span class="text-xs text-muted-foreground">+{item.tags.length - 5} more</span>
			{/if}
		</div>
	{/if}

	<div class="flex items-center justify-between">
		{#if item.can_request}
			<Button size="sm" onclick={() => onAddToCart?.(item)}>
				<ShoppingCart class="mr-1.5 h-3.5 w-3.5" />
				Add to Cart
			</Button>
		{:else}
			<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
				<Lock class="h-3.5 w-3.5" />
				{item.cannot_request_reason ?? 'Not available'}
			</div>
		{/if}
	</div>
</div>
