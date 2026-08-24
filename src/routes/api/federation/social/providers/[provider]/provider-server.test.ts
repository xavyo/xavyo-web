import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/social', () => ({
	updateSocialProvider: vi.fn(),
	deleteSocialProvider: vi.fn()
}));

import { PUT } from './+server';
import { updateSocialProvider } from '$lib/api/social';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { provider: 'google' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/social/providers/google', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/federation/social/providers/:provider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a provider with known fields', async () => {
		vi.mocked(updateSocialProvider).mockResolvedValue({ provider: 'google' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ enabled: true, client_id: 'id' })) as any);
		expect(response.status).toBe(200);
		expect(updateSocialProvider).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateSocialProvider).not.toHaveBeenCalled();
	});

	it('does not update when scopes is not a string array', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ scopes: [1] })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateSocialProvider).not.toHaveBeenCalled();
	});
});
