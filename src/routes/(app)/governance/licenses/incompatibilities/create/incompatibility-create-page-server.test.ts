import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/licenses', () => ({
	listLicensePools: vi.fn(),
	createLicenseIncompatibility: vi.fn()
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('$lib/schemas/licenses', () => ({
	createIncompatibilitySchema: {}
}));

import { load } from './+page.server';
import { listLicensePools } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

describe('License incompatibility create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listLicensePools).mockResolvedValue({ items: [] } as any);
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
