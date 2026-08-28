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

import { GET } from './+server';
import { getNhiOverallSummary } from '$lib/api/nhi-usage';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/summary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin self-service user', async () => {
		vi.mocked(getNhiOverallSummary).mockResolvedValue({ total: 3 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getNhiOverallSummary).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 without a token', async () => {
		const response = await GET({
			locals: { tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(401);
		expect(getNhiOverallSummary).not.toHaveBeenCalled();
	});
});
