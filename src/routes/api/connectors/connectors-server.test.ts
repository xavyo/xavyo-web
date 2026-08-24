import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/connectors', () => ({
	listConnectors: vi.fn(),
	createConnector: vi.fn()
}));

import { POST } from './+server';
import { createConnector } from '$lib/api/connectors';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/connectors', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a connector with required fields', async () => {
		vi.mocked(createConnector).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'ldap',
					connector_type: 'ldap',
					config: {},
					credentials: {}
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createConnector).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createConnector).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ connector_type: 'ldap', config: {}, credentials: {} })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createConnector).not.toHaveBeenCalled();
	});
});
