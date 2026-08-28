import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/licenses', () => ({
	archiveLicensePool: vi.fn()
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

import { POST } from './+server';
import { archiveLicensePool } from '$lib/api/licenses';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/governance/licenses/pools/:id/archive', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(archiveLicensePool).mockResolvedValue({ id: 'p1', archived: true } as any);
		const response = await POST({
			params: { id: 'p1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(archiveLicensePool).toHaveBeenCalledWith('p1', TOKEN, TENANT, expect.any(Function));
	});
});
