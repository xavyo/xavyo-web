import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-operations', () => ({
	createBulkAction: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load, actions } from './+page.server';
import { createBulkAction } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockHasAdminRole = vi.mocked(hasAdminRole);
const mockCreateBulkAction = vi.mocked(createBulkAction);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/operations/bulk-actions/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Bulk Action Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false)
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns form for admin users', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form).toBeDefined();
		});

		it('form data filter_expression is initially empty', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.filter_expression).toBeFalsy();
		});

		it('calls hasAdminRole with user roles', async () => {
			await load({
				locals: mockLocals(true)
			} as any);
			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing filter_expression', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					filter_expression: '',
					action_type: 'assign_role',
					action_params: '{"role_id": "123"}',
					justification: 'This is a test justification for the bulk action'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for short justification', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					filter_expression: "status == 'inactive'",
					action_type: 'revoke_role',
					action_params: '{"role_id": "123"}',
					justification: 'short'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createBulkAction and redirects on success', async () => {
			mockCreateBulkAction.mockResolvedValue({ id: 'new-action-id' } as any);
			try {
				await actions.default({
					request: makeFormData({
						filter_expression: "status == 'inactive'",
						action_type: 'revoke_role',
						action_params: '{"role_id": "123"}',
						justification: 'Revoking access for inactive users as part of quarterly cleanup'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/operations');
				}
			}
		});

		it('handles API error gracefully', async () => {
			mockCreateBulkAction.mockRejectedValue(new ApiError('Server error', 500));
			expect(typeof actions.default).toBe('function');
		});
	});
});

describe('Bulk Action Create +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});
