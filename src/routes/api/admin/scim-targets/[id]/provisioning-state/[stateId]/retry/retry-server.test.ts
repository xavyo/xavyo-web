import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/scim-targets', () => ({
	retryScimProvisioning: vi.fn()
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
import { retryScimProvisioning } from '$lib/api/scim-targets';
import { hasAdminRole } from '$lib/server/auth';

describe('POST /api/admin/scim-targets/:id/provisioning-state/:stateId/retry', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(retryScimProvisioning).mockResolvedValue(undefined as any);
		const response = await POST({
			params: { id: 's1', stateId: 'st1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(retryScimProvisioning).toHaveBeenCalled();
	});
});
