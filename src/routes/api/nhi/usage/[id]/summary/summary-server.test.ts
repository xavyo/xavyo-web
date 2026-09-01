import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-usage', () => ({
	getNhiUsageSummary: vi.fn()
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

import { GET } from './+server';
import { getNhiUsageSummary } from '$lib/api/nhi-usage';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/usage/:id/summary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getNhiUsageSummary).mockResolvedValue({ nhi_id: 'nhi-1' } as any);
	});

	it('forwards advertised period_days', async () => {
		const response = await GET({
			params: { id: 'nhi-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/usage/nhi-1/summary?period_days=90')
		} as any);
		expect(response.status).toBe(200);
		expect(getNhiUsageSummary).toHaveBeenCalledWith(
			'nhi-1',
			TOKEN,
			TENANT,
			expect.any(Function),
			{ period_days: 90 }
		);
	});

	it('does not forward NaN period_days', async () => {
		await GET({
			params: { id: 'nhi-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/usage/nhi-1/summary?period_days=abc')
		} as any);
		expect(getNhiUsageSummary).toHaveBeenCalledWith(
			'nhi-1',
			TOKEN,
			TENANT,
			expect.any(Function),
			{ period_days: undefined }
		);
	});
});
