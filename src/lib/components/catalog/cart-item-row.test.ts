import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import CartItemRow from './cart-item-row.svelte';
import type { CartItem } from '$lib/api/types';

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
	return {
		id: 'cart-item-1',
		catalog_item_id: 'item-1',
		catalog_item_name: 'Developer Access',
		catalog_item_type: 'role',
		parameters: {},
		form_values: {},
		added_at: '2025-01-01T00:00:00Z',
		...overrides
	};
}

describe('CartItemRow', () => {
	afterEach(cleanup);

	it('renders item name and type badge', () => {
		render(CartItemRow, { props: { item: makeCartItem() } });
		expect(screen.getByText('Developer Access')).toBeTruthy();
		expect(screen.getByText('Role')).toBeTruthy();
	});

	it('renders data-testid attribute', () => {
		render(CartItemRow, { props: { item: makeCartItem() } });
		expect(screen.getByTestId('cart-item-row')).toBeTruthy();
	});

	it('renders remove button with aria-label', () => {
		render(CartItemRow, { props: { item: makeCartItem() } });
		expect(screen.getByLabelText('Remove item')).toBeTruthy();
	});

	it('calls onRemove with item id when remove button is clicked', async () => {
		const onRemove = vi.fn();
		render(CartItemRow, { props: { item: makeCartItem(), onRemove } });
		await fireEvent.click(screen.getByLabelText('Remove item'));
		expect(onRemove).toHaveBeenCalledWith('cart-item-1');
	});

	it('shows parameters when present', () => {
		render(CartItemRow, {
			props: { item: makeCartItem({ parameters: { env: 'production' } }) }
		});
		expect(screen.getByText(/Parameters:/)).toBeTruthy();
	});

	it('does not show parameters section when empty', () => {
		render(CartItemRow, { props: { item: makeCartItem({ parameters: {} }) } });
		expect(screen.queryByText(/Parameters:/)).toBeFalsy();
	});
});
