import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	getTransitionConditions: vi.fn(),
	updateTransitionConditions: vi.fn()
}));

import { PUT } from './+server';
import { updateTransitionConditions } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1', transitionId: 'tr1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/lifecycle/configs/cfg1/transitions/tr1/conditions',
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('PUT /api/governance/lifecycle/configs/:configId/transitions/:transitionId/conditions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates conditions with required fields', async () => {
		vi.mocked(updateTransitionConditions).mockResolvedValue({ conditions: [] } as any);
		const response = await PUT(
			makeEvent(
				JSON.stringify({
					conditions: [
						{ condition_type: 'attr', attribute_path: 'dept', expression: 'eq:eng' }
					]
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(updateTransitionConditions).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateTransitionConditions).not.toHaveBeenCalled();
	});

	it('does not update when conditions is missing', async () => {
		await expect(PUT(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(updateTransitionConditions).not.toHaveBeenCalled();
	});
});
