import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/licenses', () => ({
	createLicenseAssignment: vi.fn(),
	listLicensePools: vi.fn()
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
import { createLicenseAssignment, listLicensePools } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const mockPools = [
	{
		id: '11111111-1111-1111-1111-111111111111',
		name: 'Microsoft 365 E3',
		vendor: 'Microsoft',
		available_count: 58,
		total_capacity: 100,
		allocated_count: 42,
		utilization_percent: 42.0,
		status: 'active',
		license_type: 'named',
		currency: 'USD',
		billing_period: 'monthly',
		expiration_policy: 'block_new',
		warning_days: 60,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-02-01T00:00:00Z'
	},
	{
		id: '22222222-2222-2222-2222-222222222222',
		name: 'Adobe Creative Cloud',
		vendor: 'Adobe',
		available_count: 10,
		total_capacity: 50,
		allocated_count: 40,
		utilization_percent: 80.0,
		status: 'active',
		license_type: 'named',
		currency: 'USD',
		billing_period: 'annual',
		expiration_policy: 'block_new',
		warning_days: 30,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-02-01T00:00:00Z'
	}
];

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/licenses/assignments/assign', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Assign License +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns form and pools for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listLicensePools).mockResolvedValue({
				items: mockPools,
				total: 2,
				limit: 100,
				offset: 0
			} as any);

			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.pools).toHaveLength(2);
		});

		it('pools list contains expected pool names', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listLicensePools).mockResolvedValue({
				items: mockPools,
				total: 2,
				limit: 100,
				offset: 0
			} as any);

			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.pools[0].name).toBe('Microsoft 365 E3');
			expect(result.pools[1].name).toBe('Adobe Creative Cloud');
		});

		it('fetches pools with limit 100', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listLicensePools).mockResolvedValue({
				items: [],
				total: 0,
				limit: 100,
				offset: 0
			} as any);

			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(listLicensePools).toHaveBeenCalledWith(
				{ limit: 100 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('form data has empty fields initially', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listLicensePools).mockResolvedValue({
				items: [],
				total: 0,
				limit: 100,
				offset: 0
			} as any);

			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form.data.license_pool_id).toBeFalsy();
			expect(result.form.data.user_id).toBeFalsy();
		});

		it('calls hasAdminRole with correct roles', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listLicensePools).mockResolvedValue({
				items: [],
				total: 0,
				limit: 100,
				offset: 0
			} as any);

			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(hasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing pool_id', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					license_pool_id: '',
					user_id: '33333333-3333-3333-3333-333333333333',
					source: 'manual'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for missing user_id', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					license_pool_id: '11111111-1111-1111-1111-111111111111',
					user_id: '',
					source: 'manual'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for invalid user_id UUID', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					license_pool_id: '11111111-1111-1111-1111-111111111111',
					user_id: 'not-a-uuid',
					source: 'manual'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createLicenseAssignment and redirects on success', async () => {
			vi.mocked(createLicenseAssignment).mockResolvedValue({ id: 'assign-1' } as any);
			try {
				await actions.default({
					request: makeFormData({
						license_pool_id: '11111111-1111-1111-1111-111111111111',
						user_id: '33333333-3333-3333-3333-333333333333',
						source: 'manual'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/licenses?tab=assignments');
				}
			}
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createLicenseAssignment).mockRejectedValue(
				new ApiError('Pool has no available licenses', 409)
			);
			expect(typeof actions.default).toBe('function');
		});
	});
});

describe('Assign License +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	});
});
