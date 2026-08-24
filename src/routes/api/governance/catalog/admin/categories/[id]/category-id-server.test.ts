import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/catalog', () => ({
	adminUpdateCategory: vi.fn(),
	adminDeleteCategory: vi.fn()
}));

import { PUT } from './+server';
import { adminUpdateCategory } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/catalog/admin/categories/c1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/catalog/admin/categories/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a category with known fields', async () => {
		vi.mocked(adminUpdateCategory).mockResolvedValue({ id: 'c1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Access' })) as any);
		expect(response.status).toBe(200);
		expect(adminUpdateCategory).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(adminUpdateCategory).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(adminUpdateCategory).not.toHaveBeenCalled();
	});
});
