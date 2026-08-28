import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/federation', () => ({
	validateIdentityProvider: vi.fn()
}));

import { POST } from './+server';
import { validateIdentityProvider } from '$lib/api/federation';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/federation/identity-providers/:id/validate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(validateIdentityProvider).mockResolvedValue({ valid: true } as any);
		const response = await POST({
			params: { id: 'idp-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(validateIdentityProvider).toHaveBeenCalledWith(
			'idp-1',
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
