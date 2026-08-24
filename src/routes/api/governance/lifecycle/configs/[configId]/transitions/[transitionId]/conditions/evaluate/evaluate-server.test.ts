import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	evaluateTransitionConditions: vi.fn()
}));

import { POST } from './+server';
import { evaluateTransitionConditions } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1', transitionId: 'tr1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/lifecycle/configs/cfg1/transitions/tr1/conditions/evaluate',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/governance/lifecycle/configs/:configId/transitions/:transitionId/conditions/evaluate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('evaluates with required fields', async () => {
		vi.mocked(evaluateTransitionConditions).mockResolvedValue({ is_allowed: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ context: { dept: 'eng' } })) as any);
		expect(response.status).toBe(200);
		expect(evaluateTransitionConditions).toHaveBeenCalled();
	});

	it('does not evaluate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(evaluateTransitionConditions).not.toHaveBeenCalled();
	});

	it('does not evaluate when context is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(evaluateTransitionConditions).not.toHaveBeenCalled();
	});
});
