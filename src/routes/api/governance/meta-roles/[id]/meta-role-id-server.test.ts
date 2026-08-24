import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	getMetaRole: vi.fn(),
	updateMetaRole: vi.fn(),
	deleteMetaRole: vi.fn()
}));

import { PUT } from './+server';
import { updateMetaRole } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'm1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles/m1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/meta-roles/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a meta-role with known fields', async () => {
		vi.mocked(updateMetaRole).mockResolvedValue({ id: 'm1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', priority: 2 })) as any);
		expect(response.status).toBe(200);
		expect(updateMetaRole).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateMetaRole).not.toHaveBeenCalled();
	});

	it('does not update when criteria_logic is invalid', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ criteria_logic: 'xor' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(updateMetaRole).not.toHaveBeenCalled();
	});
});
