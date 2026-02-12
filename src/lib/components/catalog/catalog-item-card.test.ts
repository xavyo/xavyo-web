import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import CatalogItemCard from './catalog-item-card.svelte';
import type { CatalogItem } from '$lib/api/types';

function makeItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
	return {
		id: 'item-1',
		category_id: 'cat-1',
		item_type: 'role',
		name: 'Developer Access',
		description: 'Standard developer role with repo access',
		reference_id: null,
		requestability_rules: null,
		form_fields: [],
		tags: ['engineering', 'dev'],
		icon: null,
		is_enabled: true,
		can_request: true,
		cannot_request_reason: null,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		...overrides
	};
}

describe('CatalogItemCard', () => {
	afterEach(cleanup);

	it('renders item name and description', () => {
		render(CatalogItemCard, { props: { item: makeItem() } });
		expect(screen.getByText('Developer Access')).toBeTruthy();
		expect(screen.getByText('Standard developer role with repo access')).toBeTruthy();
	});

	it('renders type badge for Role', () => {
		render(CatalogItemCard, { props: { item: makeItem({ item_type: 'role' }) } });
		expect(screen.getByText('Role')).toBeTruthy();
	});

	it('renders tags', () => {
		render(CatalogItemCard, {
			props: { item: makeItem({ tags: ['engineering', 'dev'] }) }
		});
		expect(screen.getByText('engineering')).toBeTruthy();
		expect(screen.getByText('dev')).toBeTruthy();
	});

	it('shows "Add to Cart" button when can_request is true', () => {
		render(CatalogItemCard, { props: { item: makeItem({ can_request: true }) } });
		expect(screen.getByText('Add to Cart')).toBeTruthy();
	});

	it('shows lock message when can_request is false', () => {
		render(CatalogItemCard, {
			props: {
				item: makeItem({
					can_request: false,
					cannot_request_reason: 'Missing prerequisite'
				})
			}
		});
		expect(screen.getByText('Missing prerequisite')).toBeTruthy();
		expect(screen.queryByText('Add to Cart')).toBeFalsy();
	});

	it('calls onAddToCart when "Add to Cart" is clicked', async () => {
		const onAddToCart = vi.fn();
		const item = makeItem({ can_request: true });
		render(CatalogItemCard, { props: { item, onAddToCart } });
		await fireEvent.click(screen.getByText('Add to Cart'));
		expect(onAddToCart).toHaveBeenCalledWith(item);
	});

	it('renders data-testid attribute', () => {
		render(CatalogItemCard, { props: { item: makeItem() } });
		expect(screen.getByTestId('catalog-item-card')).toBeTruthy();
	});

	it('shows overflow tag count when more than 5 tags', () => {
		const tags = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
		render(CatalogItemCard, { props: { item: makeItem({ tags }) } });
		expect(screen.getByText('+2 more')).toBeTruthy();
	});
});
