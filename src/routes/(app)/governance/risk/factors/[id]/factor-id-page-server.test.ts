import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/risk', () => ({
	getRiskFactor: vi.fn(),
	updateRiskFactor: vi.fn(),
	deleteRiskFactor: vi.fn()
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
import { getRiskFactor } from '$lib/api/risk';
import { hasAdminRole } from '$lib/server/auth';

describe('Risk factor detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getRiskFactor).mockResolvedValue({
			id: 'fac-1',
			name: 'Privileged access',
			category: 'access',
			factor_type: 'privileged',
			weight: 1,
			description: '',
			is_enabled: true
		} as any);

		const result = await load({
			params: { id: 'fac-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);

		expect(result.factor.id).toBe('fac-1');
		expect(getRiskFactor).toHaveBeenCalled();
	});
});
