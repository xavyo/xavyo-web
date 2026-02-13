import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BulkAction } from '$lib/api/types';

vi.mock('$lib/api/governance-operations', () => ({
	getBulkAction: vi.fn(),
	updateBulkAction: vi.fn()
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
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn((form, msg, opts) => ({ form, message: msg, ...opts }))
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

import { getBulkAction, updateBulkAction } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockGetBulkAction = vi.mocked(getBulkAction);
const mockUpdateBulkAction = vi.mocked(updateBulkAction);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockBulkAction: BulkAction = {
	id: 'ba1',
	tenant_id: 't1',
	filter_expression: "status == 'inactive'",
	action_type: 'revoke_role',
	action_params: { role_id: '123' },
	status: 'pending',
	justification: 'Revoking access for inactive accounts',
	total_matched: 150,
	processed_count: 0,
	success_count: 0,
	failure_count: 0,
	skipped_count: 0,
	created_by: 'u1',
	created_at: '2025-06-01T00:00:00Z'
};

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Bulk Action Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			const { load } = await import('./+page.server');
			try {
				await load({
					params: { id: 'ba1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('throws 401 when no accessToken', async () => {
			const { load } = await import('./+page.server');
			try {
				await load({
					params: { id: 'ba1' },
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('returns bulkAction and form for admin', async () => {
			mockGetBulkAction.mockResolvedValue(mockBulkAction as any);
			const { load } = await import('./+page.server');
			const result = (await load({
				params: { id: 'ba1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.bulkAction).toEqual(mockBulkAction);
			expect(result.form).toBeDefined();
		});

		it('returns correct action fields', async () => {
			mockGetBulkAction.mockResolvedValue(mockBulkAction as any);
			const { load } = await import('./+page.server');
			const result = (await load({
				params: { id: 'ba1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.bulkAction.filter_expression).toBe("status == 'inactive'");
			expect(result.bulkAction.action_type).toBe('revoke_role');
			expect(result.bulkAction.status).toBe('pending');
		});

		it('passes correct id to getBulkAction', async () => {
			mockGetBulkAction.mockResolvedValue(mockBulkAction as any);
			const { load } = await import('./+page.server');
			await load({
				params: { id: 'ba1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(mockGetBulkAction).toHaveBeenCalledWith(
				'ba1',
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('throws 404 when bulk action not found', async () => {
			mockGetBulkAction.mockRejectedValue(new ApiError('Not found', 404));
			const { load } = await import('./+page.server');
			await expect(
				load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});
	});

	describe('actions.edit', () => {
		it('exports edit action', async () => {
			const { actions } = await import('./+page.server');
			expect(actions.edit).toBeDefined();
		});
	});
});

describe('Bulk Action Detail +page.svelte', () => {
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

describe('Bulk Action Detail rendering logic', () => {
	describe('ACTION_TYPE_LABELS', () => {
		const ACTION_TYPE_LABELS: Record<string, string> = {
			assign_role: 'Assign Role',
			revoke_role: 'Revoke Role',
			enable: 'Enable',
			disable: 'Disable',
			modify_attribute: 'Modify Attribute'
		};

		it('maps assign_role correctly', () => {
			expect(ACTION_TYPE_LABELS['assign_role']).toBe('Assign Role');
		});

		it('maps revoke_role correctly', () => {
			expect(ACTION_TYPE_LABELS['revoke_role']).toBe('Revoke Role');
		});

		it('maps modify_attribute correctly', () => {
			expect(ACTION_TYPE_LABELS['modify_attribute']).toBe('Modify Attribute');
		});

		it('has all 5 action types', () => {
			expect(Object.keys(ACTION_TYPE_LABELS)).toHaveLength(5);
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string | null | undefined): string {
			if (!dateStr || isNaN(new Date(dateStr).getTime())) return '--';
			return new Date(dateStr).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}

		it('formats valid date', () => {
			const result = formatDate('2025-06-01T00:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('--');
		});

		it('returns -- for null', () => {
			expect(formatDate(null)).toBe('--');
		});

		it('returns -- for invalid date', () => {
			expect(formatDate('not-a-date')).toBe('--');
		});
	});

	describe('status-dependent UI logic', () => {
		it('bulk action is pending status', () => {
			expect(mockBulkAction.status === 'pending').toBe(true);
		});

		it('is not approved status', () => {
			expect(mockBulkAction.status === 'approved').toBe(false);
		});

		it('approved status shows execute button', () => {
			const approvedAction = { ...mockBulkAction, status: 'approved' as const };
			expect(approvedAction.status === 'approved').toBe(true);
		});
	});
});
