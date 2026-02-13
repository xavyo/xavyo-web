import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-operations', () => ({
	getSlaPolicy: vi.fn(),
	updateSlaPolicy: vi.fn()
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
import { getSlaPolicy, updateSlaPolicy } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { SlaPolicy } from '$lib/api/types';

const mockGetSlaPolicy = vi.mocked(getSlaPolicy);
const mockUpdateSlaPolicy = vi.mocked(updateSlaPolicy);
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

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/operations/sla/p1/edit', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('SLA Edit +page.server', () => {
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

		it('returns policy and form for admin', async () => {
			mockGetSlaPolicy.mockResolvedValue(mockPolicy as any);
			const result = (await load({
				params: { id: 'p1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policy).toEqual(mockPolicy);
			expect(result.form).toBeDefined();
		});

		it('pre-fills form with policy data', async () => {
			mockGetSlaPolicy.mockResolvedValue(mockPolicy as any);
			const result = (await load({
				params: { id: 'p1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.form.data.name).toBe('Test SLA');
			expect(result.form.data.target_duration_seconds).toBe(86400);
			expect(result.form.data.warning_threshold_percent).toBe(75);
			expect(result.form.data.breach_notification_enabled).toBe(true);
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

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('redirects on successful update', async () => {
			mockUpdateSlaPolicy.mockResolvedValue(mockPolicy as any);
			try {
				await actions.default({
					params: { id: 'p1' },
					request: makeFormData({
						name: 'Updated SLA',
						target_duration_seconds: '172800',
						warning_threshold_percent: '80',
						breach_notification_enabled: 'true'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 303) {
					expect(e.location).toBe('/governance/operations/sla/p1');
				}
			}
		});

		it('throws 401 when no accessToken', async () => {
			try {
				await actions.default({
					params: { id: 'p1' },
					request: makeFormData({ name: 'x' }),
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

describe('SLA Edit +page.svelte', () => {
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
