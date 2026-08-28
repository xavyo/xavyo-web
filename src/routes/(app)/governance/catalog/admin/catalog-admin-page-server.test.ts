import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/catalog', () => ({
	adminListCategories: vi.fn(),
	adminListItems: vi.fn()
}));

import { hasAdminRole } from '$lib/server/auth';
import { adminListCategories, adminListItems } from '$lib/api/catalog';

describe('Catalog admin hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(adminListCategories).mockResolvedValue({ items: [], total: 0 } as any);
		vi.mocked(adminListItems).mockResolvedValue({ items: [], total: 0 } as any);
		const { load } = await import('./+page.server');
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.categories).toBeDefined();
		expect(adminListCategories).toHaveBeenCalled();
		expect(adminListItems).toHaveBeenCalled();
	});
});
