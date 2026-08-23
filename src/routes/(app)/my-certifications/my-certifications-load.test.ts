import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '$lib/api/client';

vi.mock('$lib/api/my-certifications', () => ({
	listMyCertifications: vi.fn()
}));

import { load } from './+page.server';
import { listMyCertifications } from '$lib/api/my-certifications';

describe('My Certifications SSR load', () => {
	const fetchFn = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('errors 401 when session is missing', async () => {
		try {
			await load({
				locals: {},
				fetch: fetchFn,
				url: new URL('http://localhost/my-certifications')
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('loads reviewer certifications with session credentials', async () => {
		vi.mocked(listMyCertifications).mockResolvedValue({
			items: [{ id: 'item-1', status: 'pending' }],
			total: 1
		} as any);

		const result = await load({
			locals: { accessToken: 'user-jwt', tenantId: 'tenant-aaa' },
			fetch: fetchFn,
			url: new URL('http://localhost/my-certifications')
		} as any);

		expect(listMyCertifications).toHaveBeenCalledWith(
			{ status: 'pending', page: 1, page_size: 20 },
			'user-jwt',
			'tenant-aaa',
			fetchFn
		);
		expect(result.items).toHaveLength(1);
	});

	it('surfaces API 403 as forbidden', async () => {
		vi.mocked(listMyCertifications).mockRejectedValue(new ApiError('admin only', 403, 'forbidden'));
		try {
			await load({
				locals: { accessToken: 'user-jwt', tenantId: 'tenant-aaa' },
				fetch: fetchFn,
				url: new URL('http://localhost/my-certifications')
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
