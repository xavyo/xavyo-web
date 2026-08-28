import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/siem', () => ({
	getSiemHealthHistory: vi.fn()
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
import { getSiemHealthHistory } from '$lib/api/siem';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/siem/destinations/:id/health/history', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getSiemHealthHistory).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			params: { id: 'd1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/siem/destinations/d1/health/history')
		} as any);
		expect(response.status).toBe(200);
		expect(getSiemHealthHistory).toHaveBeenCalled();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(getSiemHealthHistory).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			params: { id: 'd1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/siem/destinations/d1/health/history?limit=abc&offset=nope'
			)
		} as any);
		expect(getSiemHealthHistory).toHaveBeenCalledWith(
			'd1',
			{},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
