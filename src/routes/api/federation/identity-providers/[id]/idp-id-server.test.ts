import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	getIdentityProvider: vi.fn(),
	updateIdentityProvider: vi.fn(),
	deleteIdentityProvider: vi.fn()
}));

import { PUT } from './+server';
import { updateIdentityProvider } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'idp-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/identity-providers/idp-1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/federation/identity-providers/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates an IdP with known fields', async () => {
		vi.mocked(updateIdentityProvider).mockResolvedValue({ id: 'idp-1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'okta', sync_on_login: true })) as any);
		expect(response.status).toBe(200);
		expect(updateIdentityProvider).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateIdentityProvider).not.toHaveBeenCalled();
	});

	it('does not update when claim_mapping is not an object', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ claim_mapping: [] })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateIdentityProvider).not.toHaveBeenCalled();
	});
});
