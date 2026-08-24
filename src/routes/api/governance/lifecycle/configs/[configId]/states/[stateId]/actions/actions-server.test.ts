import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	getStateActions: vi.fn(),
	updateStateActions: vi.fn()
}));

import { PUT } from './+server';
import { updateStateActions } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1', stateId: 'st1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/lifecycle/configs/cfg1/states/st1/actions',
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('PUT /api/governance/lifecycle/configs/:configId/states/:stateId/actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates actions with known fields', async () => {
		vi.mocked(updateStateActions).mockResolvedValue({ entry_actions: [] } as any);
		const response = await PUT(
			makeEvent(JSON.stringify({ entry_actions: [{ action_type: 'notify', parameters: {} }] })) as any
		);
		expect(response.status).toBe(200);
		expect(updateStateActions).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateStateActions).not.toHaveBeenCalled();
	});

	it('does not update when entry_actions is not an array', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ entry_actions: {} })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateStateActions).not.toHaveBeenCalled();
	});
});
