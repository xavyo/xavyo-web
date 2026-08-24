import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/catalog', () => ({
	updateCartItem: vi.fn(),
	removeCartItem: vi.fn()
}));

import { PUT } from './+server';
import { updateCartItem } from '$lib/api/catalog';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { itemId: 'ci1' },
		url: new URL('http://localhost/api/governance/catalog/cart/items/ci1'),
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/catalog/cart/items/ci1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/catalog/cart/items/:itemId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a cart item with known fields', async () => {
		vi.mocked(updateCartItem).mockResolvedValue({ id: 'ci1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ parameters: { a: 1 } })) as any);
		expect(response.status).toBe(200);
		expect(updateCartItem).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateCartItem).not.toHaveBeenCalled();
	});

	it('does not update when parameters is not an object', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ parameters: [] })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateCartItem).not.toHaveBeenCalled();
	});
});
