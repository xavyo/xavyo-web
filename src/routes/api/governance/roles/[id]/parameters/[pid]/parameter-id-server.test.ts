import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	getRoleParameter: vi.fn(),
	updateRoleParameter: vi.fn(),
	deleteRoleParameter: vi.fn()
}));

import { PUT } from './+server';
import { updateRoleParameter } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1', pid: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/r1/parameters/p1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/roles/:id/parameters/:pid', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a parameter with known fields', async () => {
		vi.mocked(updateRoleParameter).mockResolvedValue({ id: 'p1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ is_required: true })) as any);
		expect(response.status).toBe(200);
		expect(updateRoleParameter).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateRoleParameter).not.toHaveBeenCalled();
	});

	it('does not update when is_required is not a boolean', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ is_required: 'yes' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateRoleParameter).not.toHaveBeenCalled();
	});

	it('rejects NaN display_order instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ display_order: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateRoleParameter).not.toHaveBeenCalled();
	});
});
