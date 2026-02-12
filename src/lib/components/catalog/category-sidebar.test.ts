import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import CategorySidebar from './category-sidebar.svelte';
import type { CatalogCategory } from '$lib/api/types';

function makeCategory(overrides: Partial<CatalogCategory> = {}): CatalogCategory {
	return {
		id: 'cat-1',
		name: 'Applications',
		description: null,
		parent_id: null,
		icon: null,
		display_order: 0,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		...overrides
	};
}

describe('CategorySidebar', () => {
	afterEach(cleanup);

	it('renders "All Categories" button', () => {
		const onSelect = vi.fn();
		render(CategorySidebar, { props: { categories: [], onSelect } });
		expect(screen.getByText('All Categories')).toBeTruthy();
	});

	it('renders root categories', () => {
		const onSelect = vi.fn();
		const categories = [
			makeCategory({ id: 'cat-1', name: 'Applications' }),
			makeCategory({ id: 'cat-2', name: 'Infrastructure' })
		];
		render(CategorySidebar, { props: { categories, onSelect } });
		expect(screen.getByText('Applications')).toBeTruthy();
		expect(screen.getByText('Infrastructure')).toBeTruthy();
	});

	it('calls onSelect with null when "All Categories" is clicked', async () => {
		const onSelect = vi.fn();
		render(CategorySidebar, {
			props: { categories: [], selectedCategoryId: 'cat-1', onSelect }
		});
		await fireEvent.click(screen.getByText('All Categories'));
		expect(onSelect).toHaveBeenCalledWith(null);
	});

	it('calls onSelect with category id when a category is clicked', async () => {
		const onSelect = vi.fn();
		const categories = [makeCategory({ id: 'cat-1', name: 'Applications' })];
		render(CategorySidebar, { props: { categories, onSelect } });
		await fireEvent.click(screen.getByText('Applications'));
		expect(onSelect).toHaveBeenCalledWith('cat-1');
	});

	it('has navigation landmark with aria-label', () => {
		const onSelect = vi.fn();
		render(CategorySidebar, { props: { categories: [], onSelect } });
		expect(screen.getByRole('navigation', { name: 'Category navigation' })).toBeTruthy();
	});
});
