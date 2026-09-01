import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listRoleMetrics: vi.fn()
}));

import { GET } from './+server';
import { listRoleMetrics } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/role-mining/metrics', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised role_id and utilization filters', async () => {
		vi.mocked(listRoleMetrics).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/role-mining/metrics?role_id=role-1&min_utilization=0.2&max_utilization=0.9&trend_direction=increasing'
			)
		} as any);
		expect(listRoleMetrics).toHaveBeenCalledWith(
			expect.objectContaining({
				role_id: 'role-1',
				min_utilization: 0.2,
				max_utilization: 0.9,
				trend_direction: 'increasing'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
