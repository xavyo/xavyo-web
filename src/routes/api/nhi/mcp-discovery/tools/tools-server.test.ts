import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-discovery', () => ({
	discoverTools: vi.fn()
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
import { discoverTools } from '$lib/api/nhi-discovery';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/mcp-discovery/tools', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(discoverTools).mockResolvedValue({ tools: [] } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/mcp-discovery/tools')
		} as any);
		expect(response.status).toBe(200);
		expect(discoverTools).toHaveBeenCalledWith(undefined, TOKEN, TENANT, expect.any(Function));
	});
});
