import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	assignRole: vi.fn(),
	revokeRole: vi.fn(),
	checkUserHasRole: vi.fn()
}));

import { POST } from './+server';
import { assignRole } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		params: { id: 'role-1', userId: 'user-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/role-1/assignments/user-1', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles/:id/assignments/:userId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('assigns with valid JSON', async () => {
		vi.mocked(assignRole).mockResolvedValue({ role_id: 'role-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ justification: 'need' })) as any);
		expect(response.status).toBe(201);
		expect(assignRole).toHaveBeenCalledWith(
			'role-1',
			'user-1',
			{ justification: 'need', expires_at: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not assign on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(assignRole).not.toHaveBeenCalled();
	});
});
