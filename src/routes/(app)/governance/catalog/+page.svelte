<script lang="ts">
	import type { PageData } from './$types';
	import type { CatalogItem } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import CategorySidebar from '$lib/components/catalog/category-sidebar.svelte';
	import CatalogItemCard from '$lib/components/catalog/catalog-item-card.svelte';
	import CartBadge from '$lib/components/catalog/cart-badge.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import { addToCartClient } from '$lib/api/catalog-client';
	import { goto } from '$app/navigation';
	import { Search, Filter } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	let categories = $derived(data.categories);
	let items = $derived(data.items);
	let cartItemCount = $state(data.cartItemCount);

	let selectedCategoryId = $state<string | null>(data.filters.category_id ?? null);
	let searchQuery = $state(data.filters.search ?? '');
	let selectedType = $state(data.filters.item_type ?? '');

	function applyFilters() {
		const params = new URLSearchParams();
		if (selectedCategoryId) params.set('category_id', selectedCategoryId);
		if (selectedType) params.set('item_type', selectedType);
		if (searchQuery.trim()) params.set('search', searchQuery.trim());
		const qs = params.toString();
		goto(`/governance/catalog${qs ? `?${qs}` : ''}`, { invalidateAll: true });
	}

	function handleCategorySelect(categoryId: string | null) {
		selectedCategoryId = categoryId;
		applyFilters();
	}

	async function handleAddToCart(item: CatalogItem) {
		try {
			await addToCartClient(item.id);
			cartItemCount++;
			addToast('success', `"${item.name}" added to cart`);
		} catch (err) {
			addToast('error', 'Failed to add item to cart');
		}
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		applyFilters();
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Request Catalog" description="Browse and request access to roles, entitlements, and resources" />
	<CartBadge count={cartItemCount} />
</div>

<div class="mt-6 flex gap-6">
	<!-- Sidebar -->
	<aside class="hidden w-64 shrink-0 md:block">
		<h3 class="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Categories</h3>
		<CategorySidebar {categories} {selectedCategoryId} onSelect={handleCategorySelect} />
	</aside>

	<!-- Main content -->
	<div class="flex-1">
		<!-- Search and filters -->
		<form class="mb-6 flex gap-3" onsubmit={handleSearch}>
			<div class="relative flex-1">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search catalog items..."
					bind:value={searchQuery}
					class="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
				/>
			</div>
			<select
				bind:value={selectedType}
				onchange={applyFilters}
				class="rounded-md border bg-background px-3 py-2 text-sm"
			>
				<option value="">All Types</option>
				<option value="role">Role</option>
				<option value="entitlement">Entitlement</option>
				<option value="resource">Resource</option>
			</select>
		</form>

		<!-- Items grid -->
		{#if items.length === 0}
			<EmptyState
				title="No items found"
				description={searchQuery || selectedCategoryId ? 'Try adjusting your search or category filter.' : 'No catalog items are available yet.'}
			/>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as item (item.id)}
					<CatalogItemCard {item} onAddToCart={handleAddToCart} />
				{/each}
			</div>
		{/if}
	</div>
</div>
