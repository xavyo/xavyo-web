<script lang="ts">
	import type { CartItem } from '$lib/api/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Trash2 } from 'lucide-svelte';

	interface Props {
		item: CartItem;
		onRemove?: (itemId: string) => void;
	}

	let { item, onRemove }: Props = $props();
</script>

<div class="flex items-center justify-between rounded-lg border bg-card p-4" data-testid="cart-item-row">
	<div class="flex-1">
		<div class="flex items-center gap-2">
			<h4 class="font-medium">{item.catalog_item_name}</h4>
			<Badge variant="outline">{item.catalog_item_type ? item.catalog_item_type.charAt(0).toUpperCase() + item.catalog_item_type.slice(1) : ''}</Badge>
		</div>
		{#if item.parameters && Object.keys(item.parameters).length > 0}
			<p class="mt-1 text-sm text-muted-foreground">
				Parameters: {JSON.stringify(item.parameters)}
			</p>
		{/if}
		{#if item.form_values && Object.keys(item.form_values).length > 0}
			<p class="mt-1 text-sm text-muted-foreground">
				Form values: {JSON.stringify(item.form_values)}
			</p>
		{/if}
	</div>
	<Button variant="ghost" size="icon" onclick={() => onRemove?.(item.id)} aria-label="Remove item">
		<Trash2 class="h-4 w-4 text-destructive" />
	</Button>
</div>
