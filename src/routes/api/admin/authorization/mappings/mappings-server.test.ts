import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/authorization', () => ({
	listMappings: vi.fn(),
	createMapping: vi.fn()
}));

import { POST } from './+server';
import { createMapping } from '$lib/api/authorization';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/authorization/mappings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/admin/authorization/mappings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a mapping with required fields', async () => {
		vi.mocked(createMapping).mockResolvedValue({ id: 'm1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ entitlement_id: 'e1', action: 'read', resource_type: 'user' })) as any
		);
		expect(response.status).toBe(201);
		expect(createMapping).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createMapping).not.toHaveBeenCalled();
	});

	it('does not create when entitlement_id is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ action: 'read', resource_type: 'user' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createMapping).not.toHaveBeenCalled();
	});
});
