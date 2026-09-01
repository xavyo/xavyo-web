import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listSimulations: vi.fn(),
	createSimulation: vi.fn()
}));

import { GET } from './+server';
import { listSimulations } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/role-mining/simulations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised target_role_id', async () => {
		vi.mocked(listSimulations).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/role-mining/simulations?status=completed&scenario_type=add_role&target_role_id=role-1'
			)
		} as any);
		expect(listSimulations).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'completed',
				scenario_type: 'add_role',
				target_role_id: 'role-1'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
