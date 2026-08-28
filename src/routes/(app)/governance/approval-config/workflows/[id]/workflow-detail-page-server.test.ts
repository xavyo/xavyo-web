import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/approval-workflows', () => ({
	getApprovalWorkflow: vi.fn(),
	updateApprovalWorkflow: vi.fn(),
	deleteApprovalWorkflow: vi.fn(),
	setDefaultWorkflow: vi.fn()
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
import { getApprovalWorkflow } from '$lib/api/approval-workflows';

describe('Approval workflow detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getApprovalWorkflow).mockResolvedValue({
			id: 'w1',
			name: 'Workflow',
			description: '',
			is_active: true,
			is_default: false
		} as any);
		const { load } = await import('./+page.server');
		const result = await load({
			params: { id: 'w1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.workflow).toBeDefined();
		expect(getApprovalWorkflow).toHaveBeenCalled();
	});
});
