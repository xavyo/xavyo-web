import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import CartBadge from './cart-badge.svelte';

describe('CartBadge', () => {
	afterEach(cleanup);

	it('renders cart link with data-testid', () => {
		render(CartBadge, { props: { count: 0 } });
		expect(screen.getByTestId('cart-badge')).toBeTruthy();
	});

	it('does not show count badge when count is 0', () => {
		const { container } = render(CartBadge, { props: { count: 0 } });
		const badge = container.querySelector('.rounded-full');
		expect(badge).toBeFalsy();
	});

	it('shows count badge when count is greater than 0', () => {
		render(CartBadge, { props: { count: 3 } });
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('shows 99+ when count exceeds 99', () => {
		render(CartBadge, { props: { count: 150 } });
		expect(screen.getByText('99+')).toBeTruthy();
	});

	it('uses default href to cart page', () => {
		render(CartBadge, { props: { count: 1 } });
		const link = screen.getByTestId('cart-badge');
		expect(link.getAttribute('href')).toBe('/governance/catalog/cart');
	});

	it('uses custom href when provided', () => {
		render(CartBadge, { props: { count: 1, href: '/custom/cart' } });
		const link = screen.getByTestId('cart-badge');
		expect(link.getAttribute('href')).toBe('/custom/cart');
	});

	it('has accessible aria-label with item count', () => {
		render(CartBadge, { props: { count: 5 } });
		expect(screen.getByLabelText('Shopping cart with 5 items')).toBeTruthy();
	});
});
