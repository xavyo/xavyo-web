import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/simulations', () => ({
	getPolicySimulation: vi.fn(),
	deletePolicySimulation: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { DELETE } from './+server';
import { deletePolicySimulation } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('DELETE /api/governance/simulations/policy/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deletePolicySimulation).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'sim-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deletePolicySimulation).toHaveBeenCalledWith('sim-1', TOKEN, TENANT, expect.any(Function));
	});
});
