import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/social', () => ({
	listSocialProviders: vi.fn()
}));

import { GET } from './+server';
import { listSocialProviders } from '$lib/api/social';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/federation/social/providers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listSocialProviders).mockResolvedValue({ items: [] } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(listSocialProviders).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});
});
