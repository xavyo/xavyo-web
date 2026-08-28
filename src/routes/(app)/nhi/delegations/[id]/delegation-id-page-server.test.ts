import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-delegations', () => ({
	getDelegationGrant: vi.fn(),
	revokeDelegationGrant: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(status: number, message: string) {
			super(message);
			this.status = status;
		}
	}
}));

import { load, actions } from './+page.server';
import { getDelegationGrant, revokeDelegationGrant } from '$lib/api/nhi-delegations';
import { hasAdminRole } from '$lib/server/auth';

describe('NHI delegation detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getDelegationGrant).mockResolvedValue({ id: 'g1', status: 'active' } as any);
		vi.mocked(revokeDelegationGrant).mockResolvedValue({} as any);
	});

	it('does not 403 a non-admin JWT user on load', async () => {
		const result = await load({
			params: { id: 'g1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.grant).toEqual({ id: 'g1', status: 'active' });
	});

	it('does not 403 a non-admin JWT user on revoke', async () => {
		try {
			await actions.revoke({
				params: { id: 'g1' },
				locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
				fetch: vi.fn()
			} as any);
			expect.fail('should have redirected');
		} catch (e: any) {
			expect(e.status).not.toBe(403);
			expect(e.status).toBe(303);
			expect(revokeDelegationGrant).toHaveBeenCalled();
		}
	});
});
