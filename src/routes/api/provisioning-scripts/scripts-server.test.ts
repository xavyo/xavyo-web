import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	listProvisioningScripts: vi.fn(),
	createProvisioningScript: vi.fn()
}));

import { POST } from './+server';
import { createProvisioningScript } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/provisioning-scripts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a script with required fields', async () => {
		vi.mocked(createProvisioningScript).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'map' })) as any);
		expect(response.status).toBe(201);
		expect(createProvisioningScript).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createProvisioningScript).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ description: 'x' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createProvisioningScript).not.toHaveBeenCalled();
	});
});
