import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	toggleIdentityProvider: vi.fn()
}));

import { POST } from './+server';
import { toggleIdentityProvider } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'idp-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/identity-providers/idp-1/toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/federation/identity-providers/:id/toggle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('toggles with is_enabled', async () => {
		vi.mocked(toggleIdentityProvider).mockResolvedValue({ id: 'idp-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ is_enabled: true })) as any);
		expect(response.status).toBe(200);
		expect(toggleIdentityProvider).toHaveBeenCalledWith(
			'idp-1',
			{ is_enabled: true },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not toggle on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(toggleIdentityProvider).not.toHaveBeenCalled();
	});

	it('does not toggle when is_enabled is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(toggleIdentityProvider).not.toHaveBeenCalled();
	});
});
