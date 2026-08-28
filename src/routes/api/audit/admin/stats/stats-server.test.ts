import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/audit', () => ({
	fetchAdminLoginStats: vi.fn()
}));

import { GET } from './+server';
import { fetchAdminLoginStats } from '$lib/api/audit';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/audit/admin/stats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(fetchAdminLoginStats).mockResolvedValue({
			total: 0,
			successful: 0,
			failed: 0
		} as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/audit/admin/stats?start_date=2026-01-01T00:00:00Z&end_date=2026-01-31T23:59:59Z'
			)
		} as any);
		expect(response.status).toBe(200);
		expect(fetchAdminLoginStats).toHaveBeenCalled();
	});
});
