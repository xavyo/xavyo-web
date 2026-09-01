import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/oauth-clients', () => ({
	getOAuthClient: vi.fn(),
	updateOAuthClient: vi.fn(),
	deleteOAuthClient: vi.fn()
}));

import { PUT } from './+server';
import { updateOAuthClient } from '$lib/api/oauth-clients';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/oauth-clients/c1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/admin/oauth-clients/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a client with known fields', async () => {
		vi.mocked(updateOAuthClient).mockResolvedValue({ id: 'c1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'app', is_active: false })) as any);
		expect(response.status).toBe(200);
		expect(updateOAuthClient).toHaveBeenCalled();
	});

	it('forwards advertised security fields instead of dropping them', async () => {
		vi.mocked(updateOAuthClient).mockResolvedValue({ id: 'c1' } as any);
		const response = await PUT(
			makeEvent(
				JSON.stringify({
					require_dpop: true,
					fapi_profile: false,
					jwks: { keys: [] },
					tls_client_cert_thumbprint: 'thumb',
					nhi_id: '11111111-1111-1111-1111-111111111111'
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(updateOAuthClient).toHaveBeenCalledWith(
			'c1',
			expect.objectContaining({
				require_dpop: true,
				fapi_profile: false,
				jwks: { keys: [] },
				tls_client_cert_thumbprint: 'thumb',
				nhi_id: '11111111-1111-1111-1111-111111111111'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateOAuthClient).not.toHaveBeenCalled();
	});

	it('does not update when redirect_uris is not a string array', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ redirect_uris: [1] })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateOAuthClient).not.toHaveBeenCalled();
	});
});
