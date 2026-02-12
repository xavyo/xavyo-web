import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listCategories,
	getCategory,
	listCatalogItems,
	getCatalogItem,
	getCart,
	addToCart,
	updateCartItem,
	removeCartItem,
	clearCart,
	validateCart,
	submitCart,
	adminListCategories,
	adminCreateCategory,
	adminUpdateCategory,
	adminDeleteCategory,
	adminListItems,
	adminCreateItem,
	adminUpdateItem,
	adminEnableItem,
	adminDisableItem,
	adminDeleteItem
} from './catalog';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('Catalog API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Catalog Browsing ---

	describe('listCategories', () => {
		it('calls GET /governance/catalog/categories', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCategories({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/categories',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCategories({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});

		it('includes parent_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCategories({ parent_id: 'cat-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('parent_id=cat-1');
		});

		it('excludes parent_id when null', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCategories({ parent_id: null }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).not.toContain('parent_id');
		});
	});

	describe('getCategory', () => {
		it('calls GET /governance/catalog/categories/:id', async () => {
			const mockResponse = { id: 'cat-1', name: 'Roles', display_order: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCategory('cat-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/categories/cat-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('listCatalogItems', () => {
		it('calls GET /governance/catalog/items', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCatalogItems({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/items',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes category_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCatalogItems({ category_id: 'cat-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('category_id=cat-1');
		});

		it('includes item_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCatalogItems({ item_type: 'role' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('item_type=role');
		});

		it('includes search query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCatalogItems({ search: 'admin' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('search=admin');
		});

		it('includes tag query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCatalogItems({ tag: 'core' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('tag=core');
		});

		it('includes beneficiary_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCatalogItems({ beneficiary_id: 'user-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('beneficiary_id=user-1');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCatalogItems({ limit: 25, offset: 50 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=25');
			expect(calledPath).toContain('offset=50');
		});
	});

	describe('getCatalogItem', () => {
		it('calls GET /governance/catalog/items/:id', async () => {
			const mockResponse = { id: 'item-1', name: 'Admin Role', item_type: 'role' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCatalogItem('item-1', undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/items/item-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes beneficiary_id query param when provided', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await getCatalogItem('item-1', 'user-1', token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('beneficiary_id=user-1');
		});
	});

	// --- Shopping Cart ---

	describe('getCart', () => {
		it('calls GET /governance/catalog/cart', async () => {
			const mockResponse = { items: [], total_items: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCart(undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/cart',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes beneficiary_id query param when provided', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await getCart('user-1', token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('beneficiary_id=user-1');
		});
	});

	describe('addToCart', () => {
		it('calls POST /governance/catalog/cart/items with body', async () => {
			const body = { catalog_item_id: 'item-1', beneficiary_id: 'user-1' };
			const mockResponse = { id: 'cart-item-1', catalog_item_id: 'item-1' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await addToCart(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/cart/items',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCartItem', () => {
		it('calls PUT /governance/catalog/cart/items/:itemId with body', async () => {
			const body = { parameters: { env: 'prod' } };
			const mockResponse = { id: 'cart-item-1', parameters: { env: 'prod' } };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateCartItem('cart-item-1', body as any, undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/cart/items/cart-item-1',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes beneficiary_id query param when provided', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await updateCartItem('cart-item-1', {} as any, 'user-1', token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('beneficiary_id=user-1');
		});
	});

	describe('removeCartItem', () => {
		it('calls DELETE /governance/catalog/cart/items/:itemId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeCartItem('cart-item-1', undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/cart/items/cart-item-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});

		it('includes beneficiary_id query param when provided', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeCartItem('cart-item-1', 'user-1', token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('beneficiary_id=user-1');
		});
	});

	describe('clearCart', () => {
		it('calls DELETE /governance/catalog/cart', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await clearCart(undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/cart',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});

		it('includes beneficiary_id query param when provided', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await clearCart('user-1', token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('beneficiary_id=user-1');
		});
	});

	describe('validateCart', () => {
		it('calls POST /governance/catalog/cart/validate', async () => {
			const mockResponse = { valid: true, violations: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await validateCart(undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/cart/validate',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes beneficiary_id query param when provided', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await validateCart('user-1', token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('beneficiary_id=user-1');
		});
	});

	describe('submitCart', () => {
		it('calls POST /governance/catalog/cart/submit with body', async () => {
			const body = { beneficiary_id: 'user-1', global_justification: 'Need access' };
			const mockResponse = { request_ids: ['req-1', 'req-2'] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await submitCart(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/catalog/cart/submit',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Catalog Admin ---

	describe('adminListCategories', () => {
		it('calls GET /governance/admin/catalog/categories', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminListCategories({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/categories',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes limit, offset, and parent_id query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await adminListCategories({ limit: 10, offset: 5, parent_id: 'cat-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=5');
			expect(calledPath).toContain('parent_id=cat-1');
		});
	});

	describe('adminCreateCategory', () => {
		it('calls POST /governance/admin/catalog/categories with body', async () => {
			const body = { name: 'New Category', display_order: 1 };
			const mockResponse = { id: 'cat-1', name: 'New Category', display_order: 1 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminCreateCategory(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/categories',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('adminUpdateCategory', () => {
		it('calls PUT /governance/admin/catalog/categories/:id with body', async () => {
			const body = { name: 'Updated Category' };
			const mockResponse = { id: 'cat-1', name: 'Updated Category' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminUpdateCategory('cat-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/categories/cat-1',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('adminDeleteCategory', () => {
		it('calls DELETE /governance/admin/catalog/categories/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await adminDeleteCategory('cat-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/categories/cat-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('adminListItems', () => {
		it('calls GET /governance/admin/catalog/items', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminListItems({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/items',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes category_id, item_type, enabled, search, tag, limit, offset params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await adminListItems(
				{ category_id: 'cat-1', item_type: 'role', enabled: true, search: 'admin', tag: 'core', limit: 10, offset: 5 },
				token, tenantId, mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('category_id=cat-1');
			expect(calledPath).toContain('item_type=role');
			expect(calledPath).toContain('enabled=true');
			expect(calledPath).toContain('search=admin');
			expect(calledPath).toContain('tag=core');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=5');
		});
	});

	describe('adminCreateItem', () => {
		it('calls POST /governance/admin/catalog/items with body', async () => {
			const body = { name: 'New Item', item_type: 'role' };
			const mockResponse = { id: 'item-1', name: 'New Item', item_type: 'role' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminCreateItem(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/items',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('adminUpdateItem', () => {
		it('calls PUT /governance/admin/catalog/items/:id with body', async () => {
			const body = { name: 'Updated Item' };
			const mockResponse = { id: 'item-1', name: 'Updated Item' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminUpdateItem('item-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/items/item-1',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('adminEnableItem', () => {
		it('calls POST /governance/admin/catalog/items/:id/enable', async () => {
			const mockResponse = { id: 'item-1', enabled: true };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminEnableItem('item-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/items/item-1/enable',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('adminDisableItem', () => {
		it('calls POST /governance/admin/catalog/items/:id/disable', async () => {
			const mockResponse = { id: 'item-1', enabled: false };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await adminDisableItem('item-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/items/item-1/disable',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('adminDeleteItem', () => {
		it('calls DELETE /governance/admin/catalog/items/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await adminDeleteItem('item-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/admin/catalog/items/item-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(listCategories({}, token, tenantId, mockFetch)).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(addToCart({} as any, token, tenantId, mockFetch)).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				adminUpdateCategory('cat-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				adminDeleteCategory('cat-1', token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for cart operations', async () => {
			mockApiClient.mockRejectedValue(new Error('Cart not found'));

			await expect(getCart(undefined, token, tenantId, mockFetch)).rejects.toThrow('Cart not found');
		});

		it('propagates errors from apiClient for submit cart', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation failed'));

			await expect(submitCart({} as any, token, tenantId, mockFetch)).rejects.toThrow('Validation failed');
		});

		it('propagates errors from apiClient for admin item operations', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(adminEnableItem('item-1', token, tenantId, mockFetch)).rejects.toThrow('Unauthorized');
		});

		it('propagates errors from apiClient for validate cart', async () => {
			mockApiClient.mockRejectedValue(new Error('Service unavailable'));

			await expect(validateCart(undefined, token, tenantId, mockFetch)).rejects.toThrow('Service unavailable');
		});
	});
});
