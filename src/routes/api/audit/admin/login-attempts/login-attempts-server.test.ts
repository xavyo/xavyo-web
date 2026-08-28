import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/audit', () => ({
	fetchAdminLoginAttempts: vi.fn()
}));

import { GET } from './+server';
import { fetchAdminLoginAttempts } from '$lib/api/audit';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/audit/admin/login-attempts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(fetchAdminLoginAttempts).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/audit/admin/login-attempts')
		} as any);
		expect(response.status).toBe(200);
		expect(fetchAdminLoginAttempts).toHaveBeenCalled();
	});
});
