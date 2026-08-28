import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/licenses', () => ({
	listLicensePools: vi.fn(),
	createLicenseEntitlementLink: vi.fn()
}));

vi.mock('$lib/api/governance', () => ({
	listEntitlements: vi.fn()
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('$lib/schemas/licenses', () => ({
	createEntitlementLinkSchema: {}
}));

import { load } from './+page.server';
import { listLicensePools } from '$lib/api/licenses';
import { listEntitlements } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';

describe('License entitlement-link create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listLicensePools).mockResolvedValue({ items: [] } as any);
		vi.mocked(listEntitlements).mockResolvedValue({ items: [] } as any);
	});

	it('does not redirect a non-admin JWT user', async () => {
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.form).toBeDefined();
		expect(result.pools).toEqual([]);
	});
});
