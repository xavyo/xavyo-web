import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	getMicroCertificationStats: vi.fn()
}));

import { GET } from './+server';
import { getMicroCertificationStats } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/micro-certifications/stats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(getMicroCertificationStats).mockResolvedValue({ pending: 1 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getMicroCertificationStats).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});
});
