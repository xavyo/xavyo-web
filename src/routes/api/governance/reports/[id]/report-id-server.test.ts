import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/governance-reporting', () => ({
	getReport: vi.fn(),
	deleteReport: vi.fn()
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

import { GET, DELETE } from './+server';
import { getReport, deleteReport } from '$lib/api/governance-reporting';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/reports/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(getReport).mockResolvedValue({ id: 'r1' } as any);
		const response = await GET({
			params: { id: 'r1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getReport).toHaveBeenCalledWith('r1', TOKEN, TENANT, expect.any(Function));
	});
});

describe('DELETE /api/governance/reports/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteReport).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'r1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteReport).toHaveBeenCalledWith('r1', TOKEN, TENANT, expect.any(Function));
	});
});
