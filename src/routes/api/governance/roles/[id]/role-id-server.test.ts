import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	getRole: vi.fn(),
	updateRole: vi.fn(),
	deleteRole: vi.fn()
}));

import { PUT } from './+server';
import { updateRole } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/r1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/roles/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a role with required fields', async () => {
		vi.mocked(updateRole).mockResolvedValue({ id: 'r1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ version: 1, name: 'n' })) as any);
		expect(response.status).toBe(200);
		expect(updateRole).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateRole).not.toHaveBeenCalled();
	});

	it('does not update when version is missing', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: 'n' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateRole).not.toHaveBeenCalled();
	});

	it('rejects NaN version instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ version: Number.NaN, name: 'n' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateRole).not.toHaveBeenCalled();
	});
});
