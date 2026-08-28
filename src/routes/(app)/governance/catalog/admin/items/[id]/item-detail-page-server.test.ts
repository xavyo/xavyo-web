import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/catalog', () => ({
	getCatalogItem: vi.fn(),
	adminUpdateItem: vi.fn(),
	adminEnableItem: vi.fn(),
	adminDisableItem: vi.fn(),
	adminDeleteItem: vi.fn(),
	adminListCategories: vi.fn()
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn(async (data: unknown) => ({ data, valid: true }))
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

import { hasAdminRole } from '$lib/server/auth';
import { getCatalogItem, adminListCategories } from '$lib/api/catalog';

describe('Catalog admin item detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user on load', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getCatalogItem).mockResolvedValue({ id: 'i1', name: 'Item' } as any);
		vi.mocked(adminListCategories).mockResolvedValue({ items: [], total: 0 } as any);
		const { load } = await import('./+page.server');
		const result = await load({
			params: { id: 'i1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.item).toBeDefined();
		expect(getCatalogItem).toHaveBeenCalled();
	});
});
