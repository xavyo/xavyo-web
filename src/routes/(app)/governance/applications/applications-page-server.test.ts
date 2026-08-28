import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/governance', () => ({
	listApplications: vi.fn()
}));

import { load } from './+page.server';
import { listApplications } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';

describe('Applications +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(listApplications).mockResolvedValue({
			items: [{ id: 'app-1', name: 'Payroll' }],
			total: 1
		} as any);

		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/governance/applications')
		} as any);

		expect(result.applications).toHaveLength(1);
		expect(listApplications).toHaveBeenCalled();
	});
});
