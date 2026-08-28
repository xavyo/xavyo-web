import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/federation', () => ({
	removeDomain: vi.fn()
}));

import { DELETE } from './+server';
import { removeDomain } from '$lib/api/federation';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('DELETE /api/federation/identity-providers/:id/domains/:domainId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(removeDomain).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'idp-1', domainId: 'd1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(removeDomain).toHaveBeenCalledWith('idp-1', 'd1', TOKEN, TENANT, expect.any(Function));
	});
});
