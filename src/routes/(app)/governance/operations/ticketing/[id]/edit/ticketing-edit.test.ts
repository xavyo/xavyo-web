import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-operations', () => ({
	getTicketingConfig: vi.fn(),
	updateTicketingConfig: vi.fn()
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
import { getTicketingConfig, updateTicketingConfig } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { TicketingConfig } from '$lib/api/types';

const mockGetTicketingConfig = vi.mocked(getTicketingConfig);
const mockUpdateTicketingConfig = vi.mocked(updateTicketingConfig);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockConfig: TicketingConfig = {
	id: 'tc1',
	name: 'Production ServiceNow',
	ticketing_type: 'service_now',
	endpoint_url: 'https://example.service-now.com',
	polling_interval_seconds: 300,
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
	return new Request('http://localhost/governance/operations/ticketing/tc1/edit', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Ticketing Edit +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'tc1' },
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
					params: { id: 'tc1' },
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('returns config and form for admin', async () => {
			mockGetTicketingConfig.mockResolvedValue(mockConfig as any);
			const result = (await load({
				params: { id: 'tc1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.config).toEqual(mockConfig);
			expect(result.form).toBeDefined();
		});

		it('pre-fills form with config data', async () => {
			mockGetTicketingConfig.mockResolvedValue(mockConfig as any);
			const result = (await load({
				params: { id: 'tc1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.form.data.name).toBe('Production ServiceNow');
			expect(result.form.data.endpoint_url).toBe('https://example.service-now.com');
			expect(result.form.data.polling_interval_seconds).toBe(300);
			expect(result.form.data.is_active).toBe(true);
		});

		it('throws error when config not found', async () => {
			mockGetTicketingConfig.mockRejectedValue(new ApiError('Not found', 404));
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
			mockUpdateTicketingConfig.mockResolvedValue(mockConfig as any);
			try {
				await actions.default({
					params: { id: 'tc1' },
					request: makeFormData({
						name: 'Updated ServiceNow',
						endpoint_url: 'https://updated.service-now.com',
						polling_interval_seconds: '600'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 303) {
					expect(e.location).toBe('/governance/operations/ticketing/tc1');
				}
			}
		});
	});
});

describe('Ticketing Edit +page.svelte', () => {
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
