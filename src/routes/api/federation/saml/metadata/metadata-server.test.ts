import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://localhost:8080' }
}));

import { GET } from './+server';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/federation/saml/metadata', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => '<EntityDescriptor/>'
		});
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: fetchFn
		} as any);
		expect(response.status).toBe(200);
		expect(fetchFn).toHaveBeenCalled();
	});
});
