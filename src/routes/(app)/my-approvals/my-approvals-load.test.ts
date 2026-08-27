import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '$lib/api/client';

vi.mock('$lib/api/my-approvals', () => ({
	listMyApprovals: vi.fn()
}));

import { load } from './+page.server';
import { listMyApprovals } from '$lib/api/my-approvals';

describe('My Approvals SSR load', () => {
	const fetchFn = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('errors 401 when session is missing', async () => {
		try {
			await load({
				locals: {},
				fetch: fetchFn,
				url: new URL('http://localhost/my-approvals')
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
		expect(listMyApprovals).not.toHaveBeenCalled();
	});

	it('loads approvals with the session token and tenant', async () => {
		vi.mocked(listMyApprovals).mockResolvedValue({
			items: [{ id: 'appr-1', status: 'pending' }],
			total: 1
		} as any);

		const result = (await load({
			locals: { accessToken: 'user-jwt', tenantId: 'tenant-aaa' },
			fetch: fetchFn,
			url: new URL('http://localhost/my-approvals?status=pending&limit=20&offset=0')
		} as any)) as { items: unknown[]; total: number };

		expect(listMyApprovals).toHaveBeenCalledWith(
			{ status: 'pending', limit: 20, offset: 0 },
			'user-jwt',
			'tenant-aaa',
			fetchFn
		);
		expect(result.items).toHaveLength(1);
		expect(result.total).toBe(1);
	});

	it('surfaces API 403 as forbidden (non-admin must not be treated as empty success)', async () => {
		vi.mocked(listMyApprovals).mockRejectedValue(new ApiError('admin only', 403, 'forbidden'));
		try {
			await load({
				locals: { accessToken: 'user-jwt', tenantId: 'tenant-aaa' },
				fetch: fetchFn,
				url: new URL('http://localhost/my-approvals')
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
