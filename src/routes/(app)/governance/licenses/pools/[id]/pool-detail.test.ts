import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LicensePool } from '$lib/api/types';

vi.mock('$lib/api/licenses', () => ({
	getLicensePool: vi.fn(),
	updateLicensePool: vi.fn(),
	archiveLicensePool: vi.fn(),
	deleteLicensePool: vi.fn()
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

import {
	getLicensePool,
	updateLicensePool,
	archiveLicensePool,
	deleteLicensePool
} from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockGetLicensePool = vi.mocked(getLicensePool);
const mockUpdateLicensePool = vi.mocked(updateLicensePool);
const mockArchiveLicensePool = vi.mocked(archiveLicensePool);
const mockDeleteLicensePool = vi.mocked(deleteLicensePool);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockPool: LicensePool = {
	id: 'pool-1',
	name: 'Microsoft 365 E3',
	vendor: 'Microsoft',
	description: 'Enterprise licenses',
	total_capacity: 100,
	allocated_count: 42,
	available_count: 58,
	utilization_percent: 42.0,
	status: 'active',
	license_type: 'named',
	cost_per_license: 36.0,
	currency: 'USD',
	billing_period: 'monthly',
	expiration_date: '2027-01-01T00:00:00Z',
	expiration_policy: 'block_new',
	warning_days: 60,
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-02-01T00:00:00Z',
	created_by: 'admin-user-id'
};

describe('Pool Detail +page.server', () => {
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
					params: { id: 'pool-1' },
					locals: { user: { roles: ['user'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns pool detail with form', async () => {
			mockGetLicensePool.mockResolvedValue(mockPool as any);
			const { load } = await import('./+page.server');

			const result = (await load({
				params: { id: 'pool-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any)) as any;

			expect(result.pool).toEqual(mockPool);
			expect(result.form).toBeDefined();
		});

		it('returns pool name correctly', async () => {
			mockGetLicensePool.mockResolvedValue(mockPool as any);
			const { load } = await import('./+page.server');

			const result = (await load({
				params: { id: 'pool-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any)) as any;

			expect(result.pool.name).toBe('Microsoft 365 E3');
			expect(result.pool.vendor).toBe('Microsoft');
		});

		it('returns pool capacity and utilization', async () => {
			mockGetLicensePool.mockResolvedValue(mockPool as any);
			const { load } = await import('./+page.server');

			const result = (await load({
				params: { id: 'pool-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any)) as any;

			expect(result.pool.total_capacity).toBe(100);
			expect(result.pool.allocated_count).toBe(42);
			expect(result.pool.utilization_percent).toBe(42.0);
		});

		it('throws error when pool not found', async () => {
			mockGetLicensePool.mockRejectedValue(new ApiError('Not found', 404));
			const { load } = await import('./+page.server');

			await expect(
				load({
					params: { id: 'nonexistent' },
					locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('throws 500 on generic API failure', async () => {
			mockGetLicensePool.mockRejectedValue(new Error('Network error'));
			const { load } = await import('./+page.server');

			await expect(
				load({
					params: { id: 'pool-1' },
					locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('passes correct id to getLicensePool', async () => {
			mockGetLicensePool.mockResolvedValue(mockPool as any);
			const { load } = await import('./+page.server');

			await load({
				params: { id: 'pool-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(mockGetLicensePool).toHaveBeenCalledWith('pool-1', 'tok', 'tid', expect.any(Function));
		});
	});

	describe('actions.archive', () => {
		it('exports archive action', async () => {
			const { actions } = await import('./+page.server');
			expect(actions.archive).toBeDefined();
		});

		it('calls archiveLicensePool on success', async () => {
			mockArchiveLicensePool.mockResolvedValue(mockPool as any);
			const { actions } = await import('./+page.server');

			const result = await actions.archive({
				params: { id: 'pool-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(mockArchiveLicensePool).toHaveBeenCalledWith('pool-1', 'tok', 'tid', expect.any(Function));
			expect(result).toEqual({ success: true, action: 'archived' });
		});

		it('returns error on archive failure', async () => {
			mockArchiveLicensePool.mockRejectedValue(new ApiError('Cannot archive', 400));
			const { actions } = await import('./+page.server');

			const result: any = await actions.archive({
				params: { id: 'pool-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});
	});

	describe('actions.delete', () => {
		it('exports delete action', async () => {
			const { actions } = await import('./+page.server');
			expect(actions.delete).toBeDefined();
		});

		it('calls deleteLicensePool and redirects', async () => {
			mockDeleteLicensePool.mockResolvedValue(undefined);
			const { actions } = await import('./+page.server');

			await expect(
				actions.delete({
					params: { id: 'pool-1' },
					locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();

			expect(mockDeleteLicensePool).toHaveBeenCalledWith('pool-1', 'tok', 'tid', expect.any(Function));
		});

		it('returns error on delete failure', async () => {
			mockDeleteLicensePool.mockRejectedValue(new ApiError('Pool has active assignments', 409));
			const { actions } = await import('./+page.server');

			const result: any = await actions.delete({
				params: { id: 'pool-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(409);
		});
	});

	describe('actions.update', () => {
		it('exports update action', async () => {
			const { actions } = await import('./+page.server');
			expect(actions.update).toBeDefined();
		});
	});
});

describe('Pool Detail +page.svelte', () => {
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
