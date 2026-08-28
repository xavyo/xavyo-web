import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/approval-workflows', () => ({
	getEscalationPolicy: vi.fn(),
	updateEscalationPolicy: vi.fn(),
	deleteEscalationPolicy: vi.fn(),
	setDefaultEscalationPolicy: vi.fn(),
	addEscalationLevel: vi.fn(),
	removeEscalationLevel: vi.fn()
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
	superValidate: vi.fn(async (data: unknown) => ({ data, valid: true })),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

import { hasAdminRole } from '$lib/server/auth';
import { getEscalationPolicy } from '$lib/api/approval-workflows';

describe('Escalation policy detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getEscalationPolicy).mockResolvedValue({
			id: 'p1',
			name: 'Policy',
			description: '',
			is_default: false,
			levels: []
		} as any);
		const { load } = await import('./+page.server');
		const result = await load({
			params: { id: 'p1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.policy).toBeDefined();
		expect(getEscalationPolicy).toHaveBeenCalled();
	});
});
