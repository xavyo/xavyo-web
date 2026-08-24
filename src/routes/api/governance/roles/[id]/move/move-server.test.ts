import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	moveRole: vi.fn()
}));

import { POST } from './+server';
import { moveRole } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/r1/move', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles/:id/move', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('moves a role with required fields', async () => {
		vi.mocked(moveRole).mockResolvedValue({ affected_roles_count: 1 } as any);
		const response = await POST(makeEvent(JSON.stringify({ new_parent_id: 'p1', version: 1 })) as any);
		expect(response.status).toBe(200);
		expect(moveRole).toHaveBeenCalled();
	});

	it('does not move on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(moveRole).not.toHaveBeenCalled();
	});

	it('does not move when version is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ new_parent_id: null })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(moveRole).not.toHaveBeenCalled();
	});
});
