import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-operations', () => ({
	listFailedOperations: vi.fn()
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
import { listFailedOperations } from '$lib/api/governance-operations';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/failed-operations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listFailedOperations).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/failed-operations')
		} as any);
		expect(response.status).toBe(200);
		expect(listFailedOperations).toHaveBeenCalled();
	});
});
