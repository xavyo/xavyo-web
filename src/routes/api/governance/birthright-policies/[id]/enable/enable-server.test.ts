import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/birthright', () => ({
	enableBirthrightPolicy: vi.fn()
}));

import { POST } from './+server';
import { enableBirthrightPolicy } from '$lib/api/birthright';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/governance/birthright-policies/:id/enable', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(enableBirthrightPolicy).mockResolvedValue({ id: 'p1', enabled: true } as any);
		const response = await POST({
			params: { id: 'p1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(enableBirthrightPolicy).toHaveBeenCalledWith('p1', TOKEN, TENANT, expect.any(Function));
	});
});
