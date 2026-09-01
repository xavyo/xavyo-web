import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-usage', () => ({
	getNhiUsageHistory: vi.fn()
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
import { getNhiUsageHistory } from '$lib/api/nhi-usage';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/usage/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getNhiUsageHistory).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('forwards advertised usage list filters', async () => {
		const response = await GET({
			params: { id: 'nhi-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/nhi/usage/nhi-1?target_resource=api/users&outcome=success&start_date=2024-01-01T00:00:00Z&end_date=2024-02-01T00:00:00Z'
			)
		} as any);
		expect(response.status).toBe(200);
		expect(getNhiUsageHistory).toHaveBeenCalledWith(
			'nhi-1',
			expect.objectContaining({
				target_resource: 'api/users',
				outcome: 'success',
				start_date: '2024-01-01T00:00:00Z',
				end_date: '2024-02-01T00:00:00Z'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
