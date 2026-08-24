import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	listRoleEntitlements: vi.fn(),
	addRoleEntitlement: vi.fn()
}));

import { POST } from './+server';
import { addRoleEntitlement } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/r1/entitlements', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles/:id/entitlements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds an entitlement with required fields', async () => {
		vi.mocked(addRoleEntitlement).mockResolvedValue({ id: 'e1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ entitlement_id: 'ent-1', role_name: 'admin' })) as any
		);
		expect(response.status).toBe(201);
		expect(addRoleEntitlement).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addRoleEntitlement).not.toHaveBeenCalled();
	});

	it('does not add when entitlement_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ role_name: 'admin' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(addRoleEntitlement).not.toHaveBeenCalled();
	});
});
