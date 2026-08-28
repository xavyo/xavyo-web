import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/governance', () => ({
	getApplication: vi.fn(),
	updateApplication: vi.fn(),
	deleteApplication: vi.fn()
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
import { getApplication } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';

describe('Application detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getApplication).mockResolvedValue({
			id: 'app-1',
			name: 'Payroll',
			status: 'active',
			description: null,
			external_id: null,
			is_delegable: false
		} as any);

		const result = await load({
			params: { id: 'app-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);

		expect(result.application.id).toBe('app-1');
		expect(getApplication).toHaveBeenCalled();
	});
});
