import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listSimulations: vi.fn(),
	createSimulation: vi.fn()
}));

import { POST } from './+server';
import { createSimulation } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/role-mining/simulations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/role-mining/simulations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a simulation with required fields', async () => {
		vi.mocked(createSimulation).mockResolvedValue({ id: 'sim1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'add access',
					scenario_type: 'add_entitlement',
					changes: { entitlement_id: 'e1' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSimulation).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createSimulation).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({ scenario_type: 'add_entitlement', changes: {} })
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createSimulation).not.toHaveBeenCalled();
	});
});
