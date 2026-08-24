import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/catalog', () => ({
	adminListItems: vi.fn(),
	adminCreateItem: vi.fn()
}));

import { POST } from './+server';
import { adminCreateItem } from '$lib/api/catalog';
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
});
