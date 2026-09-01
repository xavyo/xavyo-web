import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/catalog', () => ({
	adminUpdateCategory: vi.fn(),
	adminDeleteCategory: vi.fn()
}));

import { DELETE, PUT } from './+server';
import { adminDeleteCategory, adminUpdateCategory } from '$lib/api/catalog';
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

	it('accepts numeric-string display_order', async () => {
		vi.mocked(adminUpdateCategory).mockResolvedValue({ id: 'c1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ display_order: '4' })) as any);
		expect(response.status).toBe(200);
		expect(adminUpdateCategory).toHaveBeenCalledWith(
			'c1',
			expect.objectContaining({ display_order: 4 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN display_order instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ display_order: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(adminUpdateCategory).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(adminUpdateCategory).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminUpdateCategory).mockResolvedValue({ id: 'c1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Access' })) as any);
		expect(response.status).toBe(200);
		expect(adminUpdateCategory).toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/catalog/admin/categories/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminDeleteCategory).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'c1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(adminDeleteCategory).toHaveBeenCalled();
	});
});
