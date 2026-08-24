import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	updateState: vi.fn(),
	deleteState: vi.fn()
}));

import { PATCH } from './+server';
import { updateState } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1', stateId: 'st1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle/configs/cfg1/states/st1', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PATCH /api/governance/lifecycle/configs/:configId/states/:stateId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a state with known fields', async () => {
		vi.mocked(updateState).mockResolvedValue({ id: 'st1' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ name: 'active' })) as any);
		expect(response.status).toBe(200);
		expect(updateState).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PATCH(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateState).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PATCH(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateState).not.toHaveBeenCalled();
	});
});
