import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	addEntitlement: vi.fn()
}));

import { POST } from './+server';
import { addEntitlement } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'm1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles/m1/entitlements', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/meta-roles/:id/entitlements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds an entitlement with required fields', async () => {
		vi.mocked(addEntitlement).mockResolvedValue({ id: 'e1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ entitlement_id: 'ent-1', permission_type: 'grant' })) as any
		);
		expect(response.status).toBe(201);
		expect(addEntitlement).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addEntitlement).not.toHaveBeenCalled();
	});

	it('does not add when entitlement_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ permission_type: 'grant' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(addEntitlement).not.toHaveBeenCalled();
	});
});
