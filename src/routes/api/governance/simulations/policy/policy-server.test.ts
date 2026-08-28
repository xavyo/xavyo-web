import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/simulations', () => ({
	listPolicySimulations: vi.fn(),
	createPolicySimulation: vi.fn()
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

import { GET, POST } from './+server';
import { createPolicySimulation, listPolicySimulations } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/simulations/policy', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/simulations/policy', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listPolicySimulations).mockResolvedValue({ items: [], total: 0, limit: 10, offset: 10 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/simulations/policy?page=2&page_size=10')
		} as any);
		expect(listPolicySimulations).toHaveBeenCalledWith(
			{
				simulation_type: undefined,
				status: undefined,
				created_by: undefined,
				include_archived: undefined,
				limit: 10,
				offset: 10
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/simulations/policy', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a simulation with required fields', async () => {
		vi.mocked(createPolicySimulation).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					simulation_type: 'sod_rule',
					policy_config: { k: 'v' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createPolicySimulation).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createPolicySimulation).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ simulation_type: 'sod_rule', policy_config: {} })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createPolicySimulation).not.toHaveBeenCalled();
	});
});
