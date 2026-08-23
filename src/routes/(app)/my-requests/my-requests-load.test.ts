import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '$lib/api/client';

vi.mock('$lib/api/access-requests', () => ({
	listAccessRequests: vi.fn()
}));

import { load } from './+page.server';
import { listAccessRequests } from '$lib/api/access-requests';

describe('My Requests SSR load', () => {
	const fetchFn = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('errors 401 when session is missing', async () => {
		try {
			await load({
				locals: {},
				fetch: fetchFn,
				url: new URL('http://localhost/my-requests')
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
		expect(listAccessRequests).not.toHaveBeenCalled();
	});

	it('loads the current user access-request list with session credentials', async () => {
		vi.mocked(listAccessRequests).mockResolvedValue({
			items: [{ id: 'req-1', status: 'pending' }],
			total: 1
		} as any);

		const result = await load({
			locals: { accessToken: 'user-jwt', tenantId: 'tenant-aaa' },
			fetch: fetchFn,
			url: new URL('http://localhost/my-requests')
		} as any);

		expect(listAccessRequests).toHaveBeenCalledWith(
			{ status: undefined, limit: 20, offset: 0 },
			'user-jwt',
			'tenant-aaa',
			fetchFn
		);
		expect(result.items[0].id).toBe('req-1');
	});

	it('surfaces API 403 as forbidden', async () => {
		vi.mocked(listAccessRequests).mockRejectedValue(new ApiError('admin only', 403, 'forbidden'));
		try {
			await load({
				locals: { accessToken: 'user-jwt', tenantId: 'tenant-aaa' },
				fetch: fetchFn,
				url: new URL('http://localhost/my-requests')
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
