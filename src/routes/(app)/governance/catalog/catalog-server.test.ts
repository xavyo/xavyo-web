import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/catalog', () => ({
	listCategories: vi.fn(),
	listCatalogItems: vi.fn(),
	getCart: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { load } from './+page.server';
import { listCategories, listCatalogItems, getCart } from '$lib/api/catalog';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['user'] }
});

describe('Catalog browse +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('throws 401 when unauthenticated', async () => {
		try {
			await load({
				locals: { accessToken: null, tenantId: 'tid' },
				url: new URL('http://localhost/governance/catalog'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('returns categories, items, and cart count', async () => {
		vi.mocked(listCategories).mockResolvedValue({
			items: [{ id: 'cat-1', name: 'Roles' }],
			total: 1,
			limit: 100,
			offset: 0
		} as any);
		vi.mocked(listCatalogItems).mockResolvedValue({
			items: [{ id: 'item-1', name: 'Engineer' }],
			total: 1,
			limit: 50,
			offset: 0
		} as any);
		vi.mocked(getCart).mockResolvedValue({ item_count: 2 } as any);

		const result = (await load({
			locals: mockLocals(),
			url: new URL('http://localhost/governance/catalog'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.categories).toHaveLength(1);
		expect(result.items).toHaveLength(1);
		expect(result.itemsTotal).toBe(1);
		expect(result.cartItemCount).toBe(2);
	});

	it('fails closed when items API throws', async () => {
		vi.mocked(listCategories).mockResolvedValue({
			items: [],
			total: 0,
			limit: 100,
			offset: 0
		} as any);
		vi.mocked(listCatalogItems).mockRejectedValue(new Error('network'));
		vi.mocked(getCart).mockResolvedValue({ item_count: 0 } as any);

		try {
			await load({
				locals: mockLocals(),
				url: new URL('http://localhost/governance/catalog'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listCategories).mockRejectedValue(new ApiError('Forbidden', 403));
		vi.mocked(listCatalogItems).mockResolvedValue({
			items: [],
			total: 0,
			limit: 50,
			offset: 0
		} as any);
		vi.mocked(getCart).mockResolvedValue({ item_count: 0 } as any);

		try {
			await load({
				locals: mockLocals(),
				url: new URL('http://localhost/governance/catalog'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
