import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/licenses', () => ({
	listLicensePools: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { listLicensePools } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';
import type { LicensePool } from '$lib/api/types';

const mockListLicensePools = vi.mocked(listLicensePools);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

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

describe('License Management hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/licenses'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns pools with default pagination', async () => {
			mockListLicensePools.mockResolvedValue({
				items: [mockPool],
				total: 1,
				limit: 20,
				offset: 0
			});

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/licenses'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.pools.items).toHaveLength(1);
			expect(result.pools.items[0].name).toBe('Microsoft 365 E3');
			expect(result.pools.total).toBe(1);
		});

		it('passes vendor filter from URL', async () => {
			mockListLicensePools.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/licenses?vendor=Microsoft'),
				fetch: vi.fn()
			} as any);

			expect(mockListLicensePools).toHaveBeenCalledWith(
				expect.objectContaining({ vendor: 'Microsoft' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('passes license_type filter from URL', async () => {
			mockListLicensePools.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/licenses?license_type=named'),
				fetch: vi.fn()
			} as any);

			expect(mockListLicensePools).toHaveBeenCalledWith(
				expect.objectContaining({ license_type: 'named' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('passes status filter from URL', async () => {
			mockListLicensePools.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/licenses?status=active'),
				fetch: vi.fn()
			} as any);

			expect(mockListLicensePools).toHaveBeenCalledWith(
				expect.objectContaining({ status: 'active' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('reads pagination from URL searchParams', async () => {
			mockListLicensePools.mockResolvedValue({ items: [], total: 50, limit: 10, offset: 40 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/licenses?offset=40&limit=10'),
				fetch: vi.fn()
			} as any);

			expect(mockListLicensePools).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 10, offset: 40 }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty items array when API throws', async () => {
			mockListLicensePools.mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/licenses'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.pools).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
		});

		it('passes correct token and tenantId', async () => {
			mockListLicensePools.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			const mockFetch = vi.fn();

			await load({
				locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
				url: new URL('http://localhost/governance/licenses'),
				fetch: mockFetch
			} as any);

			expect(mockListLicensePools).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});

		it('calls hasAdminRole with user roles', async () => {
			mockListLicensePools.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/licenses'),
				fetch: vi.fn()
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('License Management hub +page.svelte', () => {
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
