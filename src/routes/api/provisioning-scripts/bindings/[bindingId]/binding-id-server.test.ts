import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	getHookBinding: vi.fn(),
	updateHookBinding: vi.fn(),
	deleteHookBinding: vi.fn()
}));

import { PUT } from './+server';
import { updateHookBinding } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { bindingId: 'b1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/bindings/b1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/provisioning-scripts/bindings/:bindingId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a binding with known fields', async () => {
		vi.mocked(updateHookBinding).mockResolvedValue({ id: 'b1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ enabled: true })) as any);
		expect(response.status).toBe(200);
		expect(updateHookBinding).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateHookBinding).not.toHaveBeenCalled();
	});

	it('does not update when enabled is not a boolean', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ enabled: 'yes' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateHookBinding).not.toHaveBeenCalled();
	});
});
