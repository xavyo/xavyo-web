import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	setEntitlementOwner: vi.fn(),
	removeEntitlementOwner: vi.fn()
}));

import { PUT } from './+server';
import { setEntitlementOwner } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'e1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/entitlements/e1/owner', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/entitlements/:id/owner', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('sets owner with required fields', async () => {
		vi.mocked(setEntitlementOwner).mockResolvedValue({ id: 'e1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ owner_id: 'u1' })) as any);
		expect(response.status).toBe(200);
		expect(setEntitlementOwner).toHaveBeenCalled();
	});

	it('does not set owner on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(setEntitlementOwner).not.toHaveBeenCalled();
	});

	it('does not set owner when owner_id is missing', async () => {
		await expect(PUT(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(setEntitlementOwner).not.toHaveBeenCalled();
	});
});
