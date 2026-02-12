import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	getDuplicate: vi.fn(),
	dismissDuplicate: vi.fn()
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

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: { reason: '' } }),
	message: vi.fn((form, msg, opts) => ({ form, message: msg, ...opts }))
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

import { getDuplicate, dismissDuplicate } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockGetDuplicate = vi.mocked(getDuplicate);
const mockDismissDuplicate = vi.mocked(dismissDuplicate);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockDuplicate = {
	id: 'dup-1',
	identity_a_id: 'a1',
	identity_b_id: 'b1',
	confidence_score: 85,
	identity_a: { id: 'a1', email: 'john@example.com', display_name: 'John', department: 'Eng', attributes: {} },
	identity_b: { id: 'b1', email: 'j.doe@example.com', display_name: 'J. Doe', department: 'Eng', attributes: {} },
	attribute_comparison: [
		{ attribute: 'email', value_a: 'john@example.com', value_b: 'j.doe@example.com', is_different: true }
	],
	rule_matches: [
		{ rule_id: 'r1', rule_name: 'Email similarity', attribute: 'email', similarity: 0.82, weighted_score: 41 }
	]
};

describe('dedup detail page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admins', async () => {
			mockHasAdminRole.mockReturnValue(false);
			const { load } = await import('./+page.server');

			await expect(
				load({
					params: { id: 'dup-1' },
					locals: { user: { roles: ['user'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('returns duplicate detail', async () => {
			mockGetDuplicate.mockResolvedValue(mockDuplicate);
			const { load } = await import('./+page.server');

			const result = await load({
				params: { id: 'dup-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect((result as any).duplicate).toEqual(mockDuplicate);
		});
	});

	describe('actions.dismiss', () => {
		it('rejects empty reason', async () => {
			const { superValidate } = await import('sveltekit-superforms');
			vi.mocked(superValidate).mockResolvedValueOnce({ valid: false, data: { reason: '' } } as any);

			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.set('reason', '');

			const result = await actions.dismiss({
				params: { id: 'dup-1' },
				request: { formData: () => Promise.resolve(formData) } as any,
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result).toHaveProperty('message', 'Reason is required');
		});

		it('returns error on ApiError', async () => {
			const { superValidate } = await import('sveltekit-superforms');
			vi.mocked(superValidate).mockResolvedValueOnce({ valid: true, data: { reason: 'test' } } as any);
			mockDismissDuplicate.mockRejectedValue(new ApiError('Not found', 404));

			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.set('reason', 'test');

			const result = await actions.dismiss({
				params: { id: 'dup-1' },
				request: { formData: () => Promise.resolve(formData) } as any,
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result).toHaveProperty('message', 'Not found');
		});
	});
});
