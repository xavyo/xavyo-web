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
