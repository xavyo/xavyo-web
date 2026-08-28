import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	analyzeImpact: vi.fn()
}));

import { POST } from './+server';
import { analyzeImpact } from '$lib/api/birthright';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/governance/birthright-policies/:id/impact', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(analyzeImpact).mockResolvedValue({ affected_users: 3 } as any);
		const response = await POST({
			params: { id: 'b1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(analyzeImpact).toHaveBeenCalledWith('b1', TOKEN, TENANT, expect.any(Function));
	});
});
