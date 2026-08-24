import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/devices', () => ({
	renameDevice: vi.fn(),
	removeDevice: vi.fn()
}));

import { PUT } from './+server';
import { renameDevice } from '$lib/api/devices';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'd1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/devices/d1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/devices/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renames a device with required fields', async () => {
		vi.mocked(renameDevice).mockResolvedValue({ id: 'd1', device_name: 'laptop' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ device_name: 'laptop' })) as any);
		expect(response.status).toBe(200);
		expect(renameDevice).toHaveBeenCalled();
	});

	it('does not rename on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(renameDevice).not.toHaveBeenCalled();
	});

	it('does not rename when device_name is missing', async () => {
		await expect(PUT(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(renameDevice).not.toHaveBeenCalled();
	});
});
