import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/connectors', () => ({
	getConnector: vi.fn(),
	updateConnector: vi.fn(),
	deleteConnector: vi.fn()
}));

import { PUT } from './+server';
import { updateConnector } from '$lib/api/connectors';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/c1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/connectors/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a connector with known fields', async () => {
		vi.mocked(updateConnector).mockResolvedValue({ id: 'c1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'ldap', config: {} })) as any);
		expect(response.status).toBe(200);
		expect(updateConnector).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateConnector).not.toHaveBeenCalled();
	});

	it('does not update when config is not an object', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ config: [] })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateConnector).not.toHaveBeenCalled();
	});
});
