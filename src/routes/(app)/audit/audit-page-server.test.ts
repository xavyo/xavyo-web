import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { hasAdminRole } from '$lib/server/auth';

describe('Audit hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		const { load } = await import('./+page.server');
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } }
		} as any);
		expect(result).toEqual({});
	});
});
