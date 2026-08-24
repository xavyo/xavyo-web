import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/catalog', () => ({
	adminListCategories: vi.fn(),
	adminCreateCategory: vi.fn()
}));

import { POST } from './+server';
import { adminCreateCategory } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/catalog/admin/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/catalog/admin/categories', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a category with required fields', async () => {
		vi.mocked(adminCreateCategory).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Access' })) as any);
		expect(response.status).toBe(201);
		expect(adminCreateCategory).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(adminCreateCategory).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(adminCreateCategory).not.toHaveBeenCalled();
	});
});
