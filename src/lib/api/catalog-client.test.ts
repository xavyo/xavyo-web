import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('catalog-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- listCategoriesClient ---

	describe('listCategoriesClient', () => {
		it('fetches from /api/governance/catalog/categories', async () => {
			const data = { items: [], total: 0, limit: 50, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listCategoriesClient } = await import('./catalog-client');

			const result = await listCategoriesClient({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/categories');
			expect(result).toEqual(data);
		});

		it('includes limit and offset query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { listCategoriesClient } = await import('./catalog-client');

			await listCategoriesClient({ limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('includes parent_id query param', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { listCategoriesClient } = await import('./catalog-client');

			await listCategoriesClient({ parent_id: 'cat-1' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('parent_id=cat-1');
		});

		it('excludes parent_id when null', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { listCategoriesClient } = await import('./catalog-client');

			await listCategoriesClient({ parent_id: null }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).not.toContain('parent_id');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { listCategoriesClient } = await import('./catalog-client');

			await expect(listCategoriesClient({}, mockFetch)).rejects.toThrow('Failed to fetch categories: 500');
		});
	});

	// --- listCatalogItemsClient ---

	describe('listCatalogItemsClient', () => {
		it('fetches from /api/governance/catalog/items', async () => {
			const data = { items: [], total: 0, limit: 50, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listCatalogItemsClient } = await import('./catalog-client');

			const result = await listCatalogItemsClient({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/items');
			expect(result).toEqual(data);
		});

		it('includes all query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { listCatalogItemsClient } = await import('./catalog-client');

			await listCatalogItemsClient(
				{ category_id: 'cat-1', item_type: 'role', search: 'admin', tag: 'core', beneficiary_id: 'user-1', limit: 10, offset: 5 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('category_id=cat-1');
			expect(calledUrl).toContain('item_type=role');
			expect(calledUrl).toContain('search=admin');
			expect(calledUrl).toContain('tag=core');
			expect(calledUrl).toContain('beneficiary_id=user-1');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { listCatalogItemsClient } = await import('./catalog-client');

			await expect(listCatalogItemsClient({}, mockFetch)).rejects.toThrow('Failed to fetch catalog items: 403');
		});
	});

	// --- getCatalogItemClient ---

	describe('getCatalogItemClient', () => {
		it('fetches from /api/governance/catalog/items/:id', async () => {
			const data = { id: 'item-1', name: 'Admin Role', item_type: 'role' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getCatalogItemClient } = await import('./catalog-client');

			const result = await getCatalogItemClient('item-1', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/items/item-1');
			expect(result).toEqual(data);
		});

		it('includes beneficiary_id when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ id: 'item-1' }));
			const { getCatalogItemClient } = await import('./catalog-client');

			await getCatalogItemClient('item-1', 'user-1', mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('beneficiary_id=user-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { getCatalogItemClient } = await import('./catalog-client');

			await expect(getCatalogItemClient('bad', undefined, mockFetch)).rejects.toThrow('Failed to fetch catalog item: 404');
		});
	});

	// --- getCartClient ---

	describe('getCartClient', () => {
		it('fetches from /api/governance/catalog/cart', async () => {
			const data = { items: [], total_items: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getCartClient } = await import('./catalog-client');

			const result = await getCartClient(undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart');
			expect(result).toEqual(data);
		});

		it('includes beneficiary_id when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [] }));
			const { getCartClient } = await import('./catalog-client');

			await getCartClient('user-1', mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('beneficiary_id=user-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { getCartClient } = await import('./catalog-client');

			await expect(getCartClient(undefined, mockFetch)).rejects.toThrow('Failed to fetch cart: 500');
		});
	});

	// --- addToCartClient ---

	describe('addToCartClient', () => {
		it('sends POST to /api/governance/catalog/cart/items', async () => {
			const data = { id: 'cart-item-1', catalog_item_id: 'item-1' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { addToCartClient } = await import('./catalog-client');

			const result = await addToCartClient('item-1', 'user-1', { env: 'prod' }, { reason: 'test' }, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					catalog_item_id: 'item-1',
					beneficiary_id: 'user-1',
					parameters: { env: 'prod' },
					form_values: { reason: 'test' }
				})
			});
			expect(result).toEqual(data);
		});

		it('sends POST without optional fields', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ id: 'cart-item-1' }));
			const { addToCartClient } = await import('./catalog-client');

			await addToCartClient('item-1', undefined, undefined, undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					catalog_item_id: 'item-1',
					beneficiary_id: undefined,
					parameters: undefined,
					form_values: undefined
				})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addToCartClient } = await import('./catalog-client');

			await expect(addToCartClient('item-1', undefined, undefined, undefined, mockFetch)).rejects.toThrow('Failed to add to cart: 400');
		});
	});

	// --- updateCartItemClient ---

	describe('updateCartItemClient', () => {
		it('sends PUT to /api/governance/catalog/cart/items/:itemId', async () => {
			const body = { parameters: { env: 'staging' } };
			const data = { id: 'cart-item-1', parameters: { env: 'staging' } };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateCartItemClient } = await import('./catalog-client');

			const result = await updateCartItemClient('cart-item-1', body, undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart/items/cart-item-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('includes beneficiary_id when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ id: 'cart-item-1' }));
			const { updateCartItemClient } = await import('./catalog-client');

			await updateCartItemClient('cart-item-1', {}, 'user-1', mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('beneficiary_id=user-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateCartItemClient } = await import('./catalog-client');

			await expect(updateCartItemClient('cart-item-1', {}, undefined, mockFetch)).rejects.toThrow('Failed to update cart item: 422');
		});
	});

	// --- removeCartItemClient ---

	describe('removeCartItemClient', () => {
		it('sends DELETE to /api/governance/catalog/cart/items/:itemId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeCartItemClient } = await import('./catalog-client');

			await removeCartItemClient('cart-item-1', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart/items/cart-item-1', {
				method: 'DELETE'
			});
		});

		it('includes beneficiary_id when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeCartItemClient } = await import('./catalog-client');

			await removeCartItemClient('cart-item-1', 'user-1', mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('beneficiary_id=user-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeCartItemClient } = await import('./catalog-client');

			await expect(removeCartItemClient('bad', undefined, mockFetch)).rejects.toThrow('Failed to remove cart item: 404');
		});
	});

	// --- clearCartClient ---

	describe('clearCartClient', () => {
		it('sends DELETE to /api/governance/catalog/cart', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { clearCartClient } = await import('./catalog-client');

			await clearCartClient(undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart', {
				method: 'DELETE'
			});
		});

		it('includes beneficiary_id when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { clearCartClient } = await import('./catalog-client');

			await clearCartClient('user-1', mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('beneficiary_id=user-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { clearCartClient } = await import('./catalog-client');

			await expect(clearCartClient(undefined, mockFetch)).rejects.toThrow('Failed to clear cart: 500');
		});
	});

	// --- validateCartClient ---

	describe('validateCartClient', () => {
		it('sends POST to /api/governance/catalog/cart/validate', async () => {
			const data = { valid: true, violations: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { validateCartClient } = await import('./catalog-client');

			const result = await validateCartClient(undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart/validate', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('includes beneficiary_id when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ valid: true }));
			const { validateCartClient } = await import('./catalog-client');

			await validateCartClient('user-1', mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('beneficiary_id=user-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { validateCartClient } = await import('./catalog-client');

			await expect(validateCartClient(undefined, mockFetch)).rejects.toThrow('Failed to validate cart: 500');
		});
	});

	// --- submitCartClient ---

	describe('submitCartClient', () => {
		it('sends POST to /api/governance/catalog/cart/submit with body', async () => {
			const body = { beneficiary_id: 'user-1', global_justification: 'Need access' };
			const data = { request_ids: ['req-1', 'req-2'] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { submitCartClient } = await import('./catalog-client');

			const result = await submitCartClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('sends POST with empty body', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ request_ids: [] }));
			const { submitCartClient } = await import('./catalog-client');

			await submitCartClient({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/catalog/cart/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { submitCartClient } = await import('./catalog-client');

			await expect(submitCartClient({}, mockFetch)).rejects.toThrow('Failed to submit cart: 400');
		});
	});
});
