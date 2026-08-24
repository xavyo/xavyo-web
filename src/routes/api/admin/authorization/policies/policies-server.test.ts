import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/authorization', () => ({
	listPolicies: vi.fn(),
	createPolicy: vi.fn()
}));

import { POST } from './+server';
import { createPolicy } from '$lib/api/authorization';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/authorization/policies', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/admin/authorization/policies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a policy with name and effect', async () => {
		vi.mocked(createPolicy).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'n', effect: 'allow' })) as any);
		expect(response.status).toBe(201);
		expect(createPolicy).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createPolicy).not.toHaveBeenCalled();
	});

	it('does not create when effect is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ name: 'n' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createPolicy).not.toHaveBeenCalled();
	});
});
