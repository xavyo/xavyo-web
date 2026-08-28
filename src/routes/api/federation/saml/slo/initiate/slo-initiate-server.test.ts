import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/federation', () => ({
	initiateSamlSlo: vi.fn()
}));

import { POST } from './+server';
import { initiateSamlSlo } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/federation/saml/slo/initiate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(initiateSamlSlo).mockResolvedValue({ redirect: 'https://idp.example/slo' } as any);
		const response = await POST({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(initiateSamlSlo).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});
});
