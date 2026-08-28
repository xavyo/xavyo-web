import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	enableTriggerRule: vi.fn()
}));

import { POST } from './+server';
import { enableTriggerRule } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/governance/micro-certifications/triggers/:id/enable', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(enableTriggerRule).mockResolvedValue({ id: 'tr1', enabled: true } as any);
		const response = await POST({
			params: { id: 'tr1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(enableTriggerRule).toHaveBeenCalledWith('tr1', TOKEN, TENANT, expect.any(Function));
	});
});
