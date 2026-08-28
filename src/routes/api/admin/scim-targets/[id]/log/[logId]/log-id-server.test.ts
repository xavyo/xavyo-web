import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/scim-targets', () => ({
	getScimProvisioningLogDetail: vi.fn()
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
import { getScimProvisioningLogDetail } from '$lib/api/scim-targets';
import { hasAdminRole } from '$lib/server/auth';

describe('GET /api/admin/scim-targets/:id/log/:logId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getScimProvisioningLogDetail).mockResolvedValue({ id: 'l1' } as any);
		const response = await GET({
			params: { id: 's1', logId: 'l1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getScimProvisioningLogDetail).toHaveBeenCalled();
	});
});
