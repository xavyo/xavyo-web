import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-discovery', () => ({
	listGateways: vi.fn()
}));

import { load } from './+page.server';
import { listGateways } from '$lib/api/nhi-discovery';
import { hasAdminRole } from '$lib/server/auth';

describe('NHI discover +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listGateways).mockResolvedValue([]);
	});

	it('does not redirect a non-admin JWT user', async () => {
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.gateways).toEqual([]);
		expect(listGateways).toHaveBeenCalled();
	});
});
