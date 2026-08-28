import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/governance', () => ({
	getEntitlement: vi.fn(),
	updateEntitlement: vi.fn(),
	deleteEntitlement: vi.fn(),
	setEntitlementOwner: vi.fn(),
	removeEntitlementOwner: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

import { load } from './+page.server';
import { getEntitlement } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';

describe('Entitlement detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getEntitlement).mockResolvedValue({
			id: 'ent-1',
			name: 'VPN',
			description: null,
			risk_level: 'low',
			data_protection_classification: 'public',
			legal_basis: null,
			is_delegable: false,
			retention_period_days: null,
			data_controller: null,
			data_processor: null,
			purposes: []
		} as any);

		const result = await load({
			params: { id: 'ent-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);

		expect(result.entitlement.id).toBe('ent-1');
		expect(getEntitlement).toHaveBeenCalled();
	});
});
