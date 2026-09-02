import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/catalog', () => ({
	addToCart: vi.fn()
}));

import { POST } from './+server';
import { addToCart } from '$lib/api/catalog';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/catalog/cart/items', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/catalog/cart/items', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds an item with catalog_item_id', async () => {
		vi.mocked(addToCart).mockResolvedValue({ id: 'item-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ catalog_item_id: 'cat-1' })) as any);
		expect(response.status).toBe(201);
		expect(addToCart).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addToCart).not.toHaveBeenCalled();
	});

	it('forwards advertised beneficiary_id, parameters, and form_values', async () => {
		vi.mocked(addToCart).mockResolvedValue({ id: 'item-1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					catalog_item_id: 'cat-1',
					beneficiary_id: 'user-1',
					parameters: { dept: 'eng' },
					form_values: { reason: 'needed' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(addToCart).toHaveBeenCalledWith(
			{
				catalog_item_id: 'cat-1',
				beneficiary_id: 'user-1',
				parameters: { dept: 'eng' },
				form_values: { reason: 'needed' }
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not add when parameters is an array', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ catalog_item_id: 'cat-1', parameters: ['x'] })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(addToCart).not.toHaveBeenCalled();
	});

	it('does not add when catalog_item_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(addToCart).not.toHaveBeenCalled();
	});
});
