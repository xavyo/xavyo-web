import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-discovery', () => ({
	listGateways: vi.fn()
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
import { listGateways } from '$lib/api/nhi-discovery';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/mcp-discovery/gateways', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listGateways).mockResolvedValue({ gateways: [] } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(listGateways).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});
});
