import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-roles', () => ({
	listRoleInducements: vi.fn(),
	createRoleInducement: vi.fn()
}));

import { POST } from './+server';
import { createRoleInducement } from '$lib/api/governance-roles';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/r1/inducements', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles/:id/inducements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates an inducement with required fields', async () => {
		vi.mocked(createRoleInducement).mockResolvedValue({ id: 'i1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ induced_role_id: 'r2' })) as any);
		expect(response.status).toBe(201);
		expect(createRoleInducement).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createRoleInducement).not.toHaveBeenCalled();
	});

	it('does not create when induced_role_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ description: 'x' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createRoleInducement).not.toHaveBeenCalled();
	});
});
