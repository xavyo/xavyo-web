import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/catalog', () => ({
	adminEnableItem: vi.fn()
}));

import { POST } from './+server';
import { adminEnableItem } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

describe('POST /api/governance/catalog/admin/items/:id/enable', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminEnableItem).mockResolvedValue({ id: 'i1' } as any);
		const response = await POST({
			params: { id: 'i1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(adminEnableItem).toHaveBeenCalled();
	});
});
