import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/simulations', () => ({
	executePolicySimulation: vi.fn()
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
import { executePolicySimulation } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string | undefined) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'sim-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/simulations/policy/sim-1/execute', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: body ?? ''
		})
	};
}

describe('POST /api/governance/simulations/policy/:id/execute', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('executes with user_ids when JSON is valid', async () => {
		vi.mocked(executePolicySimulation).mockResolvedValue({ id: 'sim-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ user_ids: ['u1'] })) as any);
		expect(response.status).toBe(200);
		expect(executePolicySimulation).toHaveBeenCalledWith(
			'sim-1',
			{ user_ids: ['u1'] },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('executes with an empty body as no filter', async () => {
		vi.mocked(executePolicySimulation).mockResolvedValue({ id: 'sim-1' } as any);
		const response = await POST(makeEvent('') as any);
		expect(response.status).toBe(200);
		expect(executePolicySimulation).toHaveBeenCalledWith(
			'sim-1',
			undefined,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not execute on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(executePolicySimulation).not.toHaveBeenCalled();
	});
});
