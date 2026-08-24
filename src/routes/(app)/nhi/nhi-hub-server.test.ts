import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-usage', () => ({
	getNhiOverallSummary: vi.fn()
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
import { getNhiOverallSummary } from '$lib/api/nhi-usage';
import { ApiError } from '$lib/api/client';

describe('NHI hub +page.server', () => {
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

	it('returns summary', async () => {
		vi.mocked(getNhiOverallSummary).mockResolvedValue({ total: 5 } as any);

		const result = (await load({
			locals: { accessToken: 'tok', tenantId: 'tid' },
			fetch: vi.fn()
		} as any)) as any;

		expect(result.summary.total).toBe(5);
	});

	it('fails closed when summary API throws', async () => {
		vi.mocked(getNhiOverallSummary).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: { accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(getNhiOverallSummary).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: { accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
