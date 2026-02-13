<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import CartItemRow from '$lib/components/catalog/cart-item-row.svelte';
	import ValidationResults from '$lib/components/catalog/validation-results.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { Button } from '$lib/components/ui/button';
	import { addToast } from '$lib/stores/toast.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { ShoppingCart, Trash2, CheckCircle, Send } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let cart = $derived(data.cart);
	let validation = $derived(form?.validation ?? null);
	let justification = $state('');

	function handleRemove(itemId: string) {
		const formEl = document.createElement('form');
		formEl.method = 'POST';
		formEl.action = '?/remove';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'itemId';
		input.value = itemId;
		formEl.appendChild(input);
		document.body.appendChild(formEl);
		formEl.requestSubmit();
		document.body.removeChild(formEl);
	}
</script>

<PageHeader title="Shopping Cart" description="Review your access requests before submission">
	<a href="/governance/catalog" class="text-sm text-primary hover:underline">
		&larr; Back to Catalog
	</a>
</PageHeader>

{#if cart.items.length === 0}
	<EmptyState
		title="Your cart is empty"
		description="Browse the catalog to add items to your cart."
		actionLabel="Browse Catalog"
		actionHref="/governance/catalog"
	/>
{:else}
	<div class="mt-6 space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in cart</h3>
			<form method="POST" action="?/clear" use:enhance={() => {
				return async ({ update }) => {
					await update();
					addToast('success', 'Cart cleared');
				};
			}}>
				<Button variant="outline" size="sm" type="submit">
					<Trash2 class="mr-1.5 h-3.5 w-3.5" />
					Clear Cart
				</Button>
			</form>
		</div>

		<div class="space-y-3">
			{#each cart.items as item (item.id)}
				<CartItemRow {item} onRemove={handleRemove} />
			{/each}
		</div>

		<!-- Validation -->
		<div class="border-t pt-4">
			<form method="POST" action="?/validate" use:enhance>
				<Button variant="outline" type="submit">
					<CheckCircle class="mr-1.5 h-4 w-4" />
					Validate Cart
				</Button>
			</form>

			{#if validation}
				<div class="mt-4">
					<ValidationResults {validation} />
				</div>
			{/if}
		</div>

		<!-- Submit -->
		<div class="border-t pt-4">
			<form method="POST" action="?/submit" use:enhance={() => {
				return async ({ update }) => {
					await update();
					addToast('success', 'Access requests submitted successfully');
				};
			}}>
				<div class="mb-4">
					<label for="justification" class="mb-1 block text-sm font-medium">Justification (optional)</label>
					<textarea
						id="justification"
						name="justification"
						bind:value={justification}
						placeholder="Why do you need this access?"
						rows="3"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm"
					></textarea>
				</div>
				<Button type="submit">
					<Send class="mr-1.5 h-4 w-4" />
					Submit Requests
				</Button>
			</form>
		</div>
	</div>
{/if}
