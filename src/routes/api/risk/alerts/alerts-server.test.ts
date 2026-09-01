import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	listRiskAlerts: vi.fn()
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
import { listRiskAlerts } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/risk/alerts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listRiskAlerts).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('forwards advertised threshold_id filter', async () => {
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/risk/alerts?threshold_id=t1')
		} as any);
		expect(response.status).toBe(200);
		expect(listRiskAlerts).toHaveBeenCalledWith(
			expect.objectContaining({ threshold_id: 't1' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
