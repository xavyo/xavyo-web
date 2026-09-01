import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/oauth-clients', () => ({
	listOAuthClients: vi.fn(),
	createOAuthClient: vi.fn()
}));

import { POST } from './+server';
import { createOAuthClient } from '$lib/api/oauth-clients';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/oauth-clients', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/admin/oauth-clients', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a client with required fields', async () => {
		vi.mocked(createOAuthClient).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'app',
					client_type: 'confidential',
					redirect_uris: ['https://ex'],
					grant_types: ['authorization_code'],
					scopes: ['openid']
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createOAuthClient).toHaveBeenCalled();
	});

	it('forwards advertised security fields instead of dropping them', async () => {
		vi.mocked(createOAuthClient).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'app',
					client_type: 'confidential',
					redirect_uris: ['https://ex'],
					grant_types: ['authorization_code'],
					scopes: ['openid'],
					post_logout_redirect_uris: ['https://ex/logout'],
					nhi_id: '11111111-1111-1111-1111-111111111111',
					require_dpop: true,
					fapi_profile: true,
					jwks: { keys: [] },
					tls_client_cert_thumbprint: 'thumb'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createOAuthClient).toHaveBeenCalledWith(
			expect.objectContaining({
				post_logout_redirect_uris: ['https://ex/logout'],
				nhi_id: '11111111-1111-1111-1111-111111111111',
				require_dpop: true,
				fapi_profile: true,
				jwks: { keys: [] },
				tls_client_cert_thumbprint: 'thumb'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects non-boolean require_dpop', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'app',
						client_type: 'confidential',
						redirect_uris: ['https://ex'],
						grant_types: ['authorization_code'],
						scopes: ['openid'],
						require_dpop: 'yes'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createOAuthClient).not.toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createOAuthClient).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ client_type: 'public' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createOAuthClient).not.toHaveBeenCalled();
	});
});
