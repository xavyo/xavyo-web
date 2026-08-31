import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/catalog', () => ({
	adminUpdateItem: vi.fn(),
	adminDeleteItem: vi.fn()
}));

import { DELETE, PUT } from './+server';
import { adminDeleteItem, adminUpdateItem } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'i1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/catalog/admin/items/i1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/catalog/admin/items/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates an item with known fields', async () => {
		vi.mocked(adminUpdateItem).mockResolvedValue({ id: 'i1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Admin role' })) as any);
		expect(response.status).toBe(200);
		expect(adminUpdateItem).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(adminUpdateItem).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(adminUpdateItem).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminUpdateItem).mockResolvedValue({ id: 'i1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Admin role' })) as any);
		expect(response.status).toBe(200);
		expect(adminUpdateItem).toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/catalog/admin/items/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminDeleteItem).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'i1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(adminDeleteItem).toHaveBeenCalled();
	});
});
