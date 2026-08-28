import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/scim-targets', () => ({
	listScimProvisioningState: vi.fn()
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
import { listScimProvisioningState } from '$lib/api/scim-targets';
import { hasAdminRole } from '$lib/server/auth';

describe('GET /api/admin/scim-targets/:id/provisioning-state', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listScimProvisioningState).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			params: { id: 's1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/admin/scim-targets/s1/provisioning-state')
		} as any);
		expect(response.status).toBe(200);
		expect(listScimProvisioningState).toHaveBeenCalled();
	});
});
