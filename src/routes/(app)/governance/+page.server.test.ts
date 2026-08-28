import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

import { load } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';

describe('Governance hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			url: new URL('http://localhost/governance?tab=campaigns')
		} as any);
		expect(result.tab).toBe('campaigns');
	});
});
