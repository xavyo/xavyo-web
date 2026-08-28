import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/birthright', () => ({
	listBirthrightPolicies: vi.fn()
}));

import { load } from './+page.server';
import { listBirthrightPolicies } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';

describe('Birthright policies +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listBirthrightPolicies).mockResolvedValue({ items: [], total: 0 } as any);
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/governance/birthright-policies')
		} as any);
		expect(result.policies).toEqual([]);
		expect(listBirthrightPolicies).toHaveBeenCalled();
	});
});
