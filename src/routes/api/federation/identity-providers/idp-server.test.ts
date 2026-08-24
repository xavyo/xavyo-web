import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	listIdentityProviders: vi.fn(),
	createIdentityProvider: vi.fn()
}));

import { POST } from './+server';
import { createIdentityProvider } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/identity-providers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/federation/identity-providers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates an IdP with required fields', async () => {
		vi.mocked(createIdentityProvider).mockResolvedValue({ id: 'idp-1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'okta',
					provider_type: 'oidc',
					issuer_url: 'https://ex',
					client_id: 'id',
					client_secret: 'sec'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createIdentityProvider).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createIdentityProvider).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ provider_type: 'oidc' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createIdentityProvider).not.toHaveBeenCalled();
	});
});
