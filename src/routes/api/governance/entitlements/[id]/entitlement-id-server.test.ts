import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	getEntitlement: vi.fn(),
	updateEntitlement: vi.fn(),
	deleteEntitlement: vi.fn()
}));

import { PUT } from './+server';
import { updateEntitlement } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'e1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/entitlements/e1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/entitlements/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates an entitlement with known fields', async () => {
		vi.mocked(updateEntitlement).mockResolvedValue({ id: 'e1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Admin' })) as any);
		expect(response.status).toBe(200);
		expect(updateEntitlement).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateEntitlement).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateEntitlement).not.toHaveBeenCalled();
	});

	it('rejects NaN retention_period_days instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ retention_period_days: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateEntitlement).not.toHaveBeenCalled();
	});
});
