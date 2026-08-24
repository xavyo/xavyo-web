import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/authorization', () => ({
	getPolicy: vi.fn(),
	updatePolicy: vi.fn(),
	deletePolicy: vi.fn()
}));

import { PUT } from './+server';
import { updatePolicy } from '$lib/api/authorization';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/authorization/policies/p1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/admin/authorization/policies/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a policy with known fields', async () => {
		vi.mocked(updatePolicy).mockResolvedValue({ id: 'p1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', effect: 'deny' })) as any);
		expect(response.status).toBe(200);
		expect(updatePolicy).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updatePolicy).not.toHaveBeenCalled();
	});

	it('does not update when effect is invalid', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ effect: 'maybe' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updatePolicy).not.toHaveBeenCalled();
	});
});
