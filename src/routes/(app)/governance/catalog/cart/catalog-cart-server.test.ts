import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/catalog', () => ({
	getCart: vi.fn(),
	submitCart: vi.fn(),
	removeCartItem: vi.fn(),
	clearCart: vi.fn(),
	validateCart: vi.fn()
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
import { getCart } from '$lib/api/catalog';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['user'] }
});

describe('Catalog cart +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('throws 401 when unauthenticated', async () => {
		try {
			await load({
				locals: { accessToken: null, tenantId: 'tid' },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('returns cart', async () => {
		vi.mocked(getCart).mockResolvedValue({
			requester_id: 'u1',
			items: [{ id: 'item-1' }],
			item_count: 1
		} as any);

		const result = (await load({
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.cart.item_count).toBe(1);
	});

	it('fails closed when cart API throws', async () => {
		vi.mocked(getCart).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(getCart).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
