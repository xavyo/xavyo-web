import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/simulations', () => ({
	updatePolicySimulationNotes: vi.fn()
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

import { PATCH } from './+server';
import { updatePolicySimulationNotes } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/simulations/policy/p1/notes', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PATCH /api/governance/simulations/policy/:id/notes', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates notes with required fields', async () => {
		vi.mocked(updatePolicySimulationNotes).mockResolvedValue({ id: 'p1' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ notes: 'ok' })) as any);
		expect(response.status).toBe(200);
		expect(updatePolicySimulationNotes).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PATCH(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updatePolicySimulationNotes).not.toHaveBeenCalled();
	});

	it('does not update when notes is missing', async () => {
		await expect(PATCH(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(updatePolicySimulationNotes).not.toHaveBeenCalled();
	});
});
