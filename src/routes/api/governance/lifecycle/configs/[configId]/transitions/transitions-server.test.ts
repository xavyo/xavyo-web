import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	createTransition: vi.fn()
}));

import { POST } from './+server';
import { createTransition } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle/configs/cfg1/transitions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/lifecycle/configs/:configId/transitions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a transition with required fields', async () => {
		vi.mocked(createTransition).mockResolvedValue({ id: 'tr1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'hire', from_state_id: 's1', to_state_id: 's2' })) as any
		);
		expect(response.status).toBe(201);
		expect(createTransition).toHaveBeenCalled();
	});

	it('forwards advertised approval_workflow_id', async () => {
		vi.mocked(createTransition).mockResolvedValue({ id: 'tr1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'hire',
					from_state_id: 's1',
					to_state_id: 's2',
					requires_approval: true,
					approval_workflow_id: 'wf-1'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createTransition).toHaveBeenCalledWith(
			'cfg1',
			{
				name: 'hire',
				from_state_id: 's1',
				to_state_id: 's2',
				requires_approval: true,
				approval_workflow_id: 'wf-1'
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createTransition).not.toHaveBeenCalled();
	});

	it('does not create when from_state_id is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'hire', to_state_id: 's2' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createTransition).not.toHaveBeenCalled();
	});

	it('rejects NaN grace_period_hours instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'hire',
						from_state_id: 's1',
						to_state_id: 's2',
						grace_period_hours: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTransition).not.toHaveBeenCalled();
	});
});
