import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/power-of-attorney', () => ({
	adminListPoa: vi.fn()
}));

import { GET } from './+server';
import { adminListPoa } from '$lib/api/power-of-attorney';
import { hasAdminRole } from '$lib/server/auth';

describe('GET /api/governance/power-of-attorney/admin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminListPoa).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			url: new URL('http://localhost/api/governance/power-of-attorney/admin'),
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(adminListPoa).toHaveBeenCalled();
	});
});
