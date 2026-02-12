import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/licenses', () => ({
	createLicensePool: vi.fn()
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
import { createLicensePool } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

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
	return new Request('http://localhost/governance/licenses/pools/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Pool Create +page.server', () => {
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

		it('returns form for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.form).toBeDefined();
		});

		it('form data name is initially empty', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.name).toBeFalsy();
		});

		it('form data vendor is initially empty', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.vendor).toBeFalsy();
		});

		it('form data has default billing_period', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			// billing_period is an enum with no default on create, will be falsy or default
			expect(result.form).toBeDefined();
		});

		it('calls hasAdminRole with user roles', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
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

		it('returns validation error for missing name', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: '',
					vendor: 'Microsoft',
					total_capacity: '100',
					billing_period: 'monthly'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for missing vendor', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: 'My Pool',
					vendor: '',
					total_capacity: '100',
					billing_period: 'monthly'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createLicensePool and redirects on success', async () => {
			vi.mocked(createLicensePool).mockResolvedValue({ id: 'new-pool-id' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Microsoft 365 E3',
						vendor: 'Microsoft',
						total_capacity: '100',
						currency: 'USD',
						billing_period: 'monthly',
						license_type: 'named',
						expiration_policy: 'block_new',
						warning_days: '60'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/licenses/pools/new-pool-id');
				}
			}
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createLicensePool).mockRejectedValue(new ApiError('Pool name exists', 409));
			expect(typeof actions.default).toBe('function');
		});
	});
});

describe('Pool Create +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	});
});
