<script lang="ts">
	import { ShoppingCart } from 'lucide-svelte';

	interface Props {
		count: number;
		href?: string;
	}

	let { count, href = '/governance/catalog/cart' }: Props = $props();
</script>

<a
	{href}
	class="relative inline-flex items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
	aria-label="Shopping cart with {count} items"
	data-testid="cart-badge"
>
	<ShoppingCart class="h-5 w-5" />
	{#if count > 0}
		<span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
			{count > 99 ? '99+' : count}
		</span>
	{/if}
</a>
