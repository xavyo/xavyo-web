import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	getProvisioningScript: vi.fn(),
	updateProvisioningScript: vi.fn(),
	deleteProvisioningScript: vi.fn()
}));

import { PUT } from './+server';
import { updateProvisioningScript } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/s1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/provisioning-scripts/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a script with known fields', async () => {
		vi.mocked(updateProvisioningScript).mockResolvedValue({ id: 's1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n' })) as any);
		expect(response.status).toBe(200);
		expect(updateProvisioningScript).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateProvisioningScript).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateProvisioningScript).not.toHaveBeenCalled();
	});
});
