import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	getInducedRoles: vi.fn()
}));

import { GET } from './+server';
import { getInducedRoles } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/roles/:id/induced-roles', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(getInducedRoles).mockResolvedValue({ items: [] } as any);
		const response = await GET({
			params: { id: 'r1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getInducedRoles).toHaveBeenCalledWith('r1', TOKEN, TENANT, expect.any(Function));
	});
});
