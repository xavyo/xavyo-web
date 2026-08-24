import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/simulations', () => ({
	listSimulationComparisons: vi.fn(),
	createSimulationComparison: vi.fn()
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

import { POST } from './+server';
import { createSimulationComparison } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/simulations/comparisons', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/simulations/comparisons', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a comparison with required fields', async () => {
		vi.mocked(createSimulationComparison).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					comparison_type: 'simulation_vs_current',
					simulation_a_id: 'a1',
					simulation_a_type: 'policy'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSimulationComparison).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createSimulationComparison).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						comparison_type: 'simulation_vs_current',
						simulation_a_id: 'a1',
						simulation_a_type: 'policy'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createSimulationComparison).not.toHaveBeenCalled();
	});
});
