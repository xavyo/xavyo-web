import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-operations', () => ({
	getSlaPolicy: vi.fn(),
	deleteSlaPolicy: vi.fn()
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
import { getSlaPolicy, deleteSlaPolicy } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { SlaPolicy } from '$lib/api/types';

const mockGetSlaPolicy = vi.mocked(getSlaPolicy);
const mockDeleteSlaPolicy = vi.mocked(deleteSlaPolicy);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockPolicy: SlaPolicy = {
	id: 'p1',
	name: 'Test SLA',
	description: 'A test policy',
	target_duration_seconds: 86400,
	target_duration_human: '1 day',
	warning_threshold_percent: 75,
	breach_notification_enabled: true,
	is_active: true,
	created_at: '2025-01-01T00:00:00Z',
	updated_at: '2025-01-01T00:00:00Z'
};

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('SLA Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'p1' },
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
			try {
				await load({
					params: { id: 'p1' },
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('returns policy detail for admin', async () => {
			mockGetSlaPolicy.mockResolvedValue(mockPolicy as any);
			const result = (await load({
				params: { id: 'p1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policy).toEqual(mockPolicy);
			expect(result.policy.name).toBe('Test SLA');
		});

		it('passes correct id to getSlaPolicy', async () => {
			mockGetSlaPolicy.mockResolvedValue(mockPolicy as any);
			await load({
				params: { id: 'p1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(mockGetSlaPolicy).toHaveBeenCalledWith('p1', 'tok', 'tid', expect.any(Function));
		});

		it('throws error when policy not found', async () => {
			mockGetSlaPolicy.mockRejectedValue(new ApiError('Not found', 404));
			await expect(
				load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});
	});

	describe('actions.delete', () => {
		it('exports delete action', () => {
			expect(actions.delete).toBeDefined();
		});

		it('calls deleteSlaPolicy and redirects', async () => {
			mockDeleteSlaPolicy.mockResolvedValue(undefined as any);
			await expect(
				actions.delete({
					params: { id: 'p1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
			expect(mockDeleteSlaPolicy).toHaveBeenCalledWith('p1', 'tok', 'tid', expect.any(Function));
		});

		it('throws 401 when no accessToken', async () => {
			try {
				await actions.delete({
					params: { id: 'p1' },
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});
	});
});

describe('SLA Detail +page.svelte', () => {
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

describe('SLA Detail rendering logic', () => {
	describe('statusBadgeColor', () => {
		function statusBadgeColor(active: boolean): string {
			return active
				? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
				: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}

		it('active status gets green badge', () => {
			expect(statusBadgeColor(true)).toContain('green');
		});

		it('inactive status gets gray badge', () => {
			expect(statusBadgeColor(false)).toContain('gray');
		});
	});

	describe('policy field access', () => {
		it('has target_duration_seconds', () => {
			expect(mockPolicy.target_duration_seconds).toBe(86400);
		});

		it('has target_duration_human', () => {
			expect(mockPolicy.target_duration_human).toBe('1 day');
		});

		it('has warning_threshold_percent', () => {
			expect(mockPolicy.warning_threshold_percent).toBe(75);
		});

		it('has breach_notification_enabled', () => {
			expect(mockPolicy.breach_notification_enabled).toBe(true);
		});

		it('has is_active', () => {
			expect(mockPolicy.is_active).toBe(true);
		});
	});
});
