import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/lifecycle', () => ({
	createLifecycleConfig: vi.fn()
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
import { createLifecycleConfig } from '$lib/api/lifecycle';
import { ApiError } from '$lib/api/client';

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
	return new Request('http://localhost/governance/lifecycle/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Lifecycle Config Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

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
	});

	// --- Action ---

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing name', async () => {
			const result: any = await actions.default({
				request: makeFormData({ name: '', object_type: 'user' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for invalid object_type', async () => {
			const result: any = await actions.default({
				request: makeFormData({ name: 'Test Config', object_type: 'InvalidType' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createLifecycleConfig and redirects on success', async () => {
			vi.mocked(createLifecycleConfig).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({ name: 'Employee Lifecycle', object_type: 'user' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/governance/lifecycle');
			}
			expect(createLifecycleConfig).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Employee Lifecycle',
					object_type: 'user'
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createLifecycleConfig).mockRejectedValue(
				new ApiError('Config name exists', 409)
			);
			const result: any = await actions.default({
				request: makeFormData({ name: 'Duplicate Config', object_type: 'user' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});

		it('returns generic error for non-API errors', async () => {
			vi.mocked(createLifecycleConfig).mockRejectedValue(new Error('network error'));
			const result: any = await actions.default({
				request: makeFormData({ name: 'Some Config', object_type: 'role' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(500);
		});

		it('sends correct body to createLifecycleConfig', async () => {
			vi.mocked(createLifecycleConfig).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Entitlement Lifecycle',
						object_type: 'entitlement',
						description: 'Manages entitlement states',
						auto_assign_initial_state: 'on'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect expected
			}
			expect(createLifecycleConfig).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Entitlement Lifecycle',
					object_type: 'entitlement',
					description: 'Manages entitlement states',
					auto_assign_initial_state: true
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});
});
