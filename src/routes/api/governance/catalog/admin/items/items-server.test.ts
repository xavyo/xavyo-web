import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/catalog', () => ({
	adminListItems: vi.fn(),
	adminCreateItem: vi.fn()
}));

import { GET, POST } from './+server';
import { adminCreateItem, adminListItems } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/catalog/admin/items', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/catalog/admin/items', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminListItems).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/catalog/admin/items')
		} as any);
		expect(response.status).toBe(200);
		expect(adminListItems).toHaveBeenCalled();
	});
});

describe('POST /api/governance/catalog/admin/items', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates an item with required fields', async () => {
		vi.mocked(adminCreateItem).mockResolvedValue({ id: 'i1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'Admin role', item_type: 'role' })) as any
		);
		expect(response.status).toBe(201);
		expect(adminCreateItem).toHaveBeenCalled();
	});

	it('forwards advertised icon on create', async () => {
		vi.mocked(adminCreateItem).mockResolvedValue({ id: 'i1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'Admin role', item_type: 'role', icon: 'shield' })) as any
		);
		expect(response.status).toBe(201);
		expect(adminCreateItem).toHaveBeenCalledWith(
			expect.objectContaining({ icon: 'shield' }),
			TOKEN,
			TENANT,
			expect.anything()
		);
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(adminCreateItem).not.toHaveBeenCalled();
	});

	it('does not create when item_type is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'Admin role', item_type: 'other' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(adminCreateItem).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminCreateItem).mockResolvedValue({ id: 'i1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'Admin role', item_type: 'role' })) as any
		);
		expect(response.status).toBe(201);
		expect(adminCreateItem).toHaveBeenCalled();
	});
});
