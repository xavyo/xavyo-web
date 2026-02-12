import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/meta-roles', () => ({
	createMetaRole: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

import { load, actions } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import { createMetaRole } from '$lib/api/meta-roles';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeFormData(data: Record<string, string | string[]>): Request {
	const fd = new FormData();
	for (const [k, v] of Object.entries(data)) {
		if (Array.isArray(v)) {
			for (const item of v) {
				fd.append(k, item);
			}
		} else {
			fd.append(k, v);
		}
	}
	// Return a mock request that preserves FormData correctly
	return { formData: () => Promise.resolve(fd) } as unknown as Request;
}

const VALID_CRITERIA = {
	criteria_field: ['risk_level'],
	criteria_operator: ['eq'],
	criteria_value: ['high']
};

describe('Meta-Roles Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
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
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true)
			} as any);

			expect(result.form).toBeDefined();
		});
	});

	// --- Action ---

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing name', async () => {
			const result: any = await actions.default({
				request: makeFormData({ name: '', priority: '10' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for missing priority', async () => {
			const result: any = await actions.default({
				request: makeFormData({ name: 'Test Role', priority: '0' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns error when no criteria provided', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: 'Finance Admin',
					priority: '10',
					criteria_logic: 'and'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createMetaRole and redirects on success', async () => {
			vi.mocked(createMetaRole).mockResolvedValue({ id: 'new-id', name: 'Finance Admin' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Finance Admin',
						priority: '10',
						criteria_logic: 'and',
						...VALID_CRITERIA
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/governance/meta-roles/new-id');
			}
			expect(createMetaRole).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Finance Admin',
					priority: 10,
					criteria_logic: 'and',
					criteria: [{ field: 'risk_level', operator: 'eq', value: 'high' }]
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createMetaRole).mockRejectedValue(new ApiError('Duplicate name', 409));
			const result: any = await actions.default({
				request: makeFormData({
					name: 'Existing Name',
					priority: '10',
					criteria_logic: 'and',
					...VALID_CRITERIA
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});

		it('returns generic error for non-API errors', async () => {
			vi.mocked(createMetaRole).mockRejectedValue(new Error('network error'));
			const result: any = await actions.default({
				request: makeFormData({
					name: 'Some Role',
					priority: '10',
					criteria_logic: 'or',
					...VALID_CRITERIA
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(500);
		});
	});
});
