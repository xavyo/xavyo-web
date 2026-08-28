import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	getNhiRiskSummary: vi.fn()
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
import { getNhiRiskSummary } from '$lib/api/nhi-governance';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/governance/risk/summary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(getNhiRiskSummary).mockResolvedValue({ high: 1 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getNhiRiskSummary).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});
});
