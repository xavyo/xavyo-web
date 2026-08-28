import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://localhost:8080' }
}));

import { GET } from './+server';

const TOKEN = 'tok';
const TENANT = 'tid';

const xml = `<?xml version="1.0"?>
<EntityDescriptor entityID="https://idp.example">
  <IDPSSODescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp.example/saml/sso"/>
  </IDPSSODescriptor>
</EntityDescriptor>`;

describe('GET /api/federation/saml/idp-info', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => xml
		});
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: fetchFn,
			url: new URL('http://localhost/api/federation/saml/idp-info')
		} as any);
		expect(response.status).toBe(200);
		expect(fetchFn).toHaveBeenCalled();
	});
});
