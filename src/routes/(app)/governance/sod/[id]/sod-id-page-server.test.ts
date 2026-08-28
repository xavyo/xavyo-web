import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/governance', () => ({
	getSodRule: vi.fn(),
	updateSodRule: vi.fn(),
	deleteSodRule: vi.fn(),
	enableSodRule: vi.fn(),
	disableSodRule: vi.fn()
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
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('$lib/schemas/governance', () => ({
	updateSodRuleSchema: {}
}));

import { load } from './+page.server';
import { getSodRule } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';

describe('SoD rule +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getSodRule).mockResolvedValue({ id: 'r1' } as any);
		const result = await load({
			params: { id: 'r1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.rule).toEqual({ id: 'r1' });
		expect(getSodRule).toHaveBeenCalled();
	});
});
