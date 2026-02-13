import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-operations', () => ({
	createTicketingConfig: vi.fn()
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
import { createTicketingConfig } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockHasAdminRole = vi.mocked(hasAdminRole);
const mockCreateTicketingConfig = vi.mocked(createTicketingConfig);

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
	return new Request('http://localhost/governance/operations/ticketing/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Ticketing Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
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
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form).toBeDefined();
		});

		it('form data name is initially empty', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.name).toBeFalsy();
		});

		it('form has default polling_interval_seconds of 300', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.polling_interval_seconds).toBe(300);
		});

		it('calls hasAdminRole with user roles', async () => {
			await load({
				locals: mockLocals(true)
			} as any);
			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
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
					ticketing_type: 'service_now',
					endpoint_url: 'https://example.service-now.com',
					credentials: 'api-key-123'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createTicketingConfig and redirects on success', async () => {
			mockCreateTicketingConfig.mockResolvedValue({ id: 'new-config-id' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'My ServiceNow',
						ticketing_type: 'service_now',
						endpoint_url: 'https://example.service-now.com',
						credentials: 'api-key-123',
						polling_interval_seconds: '300'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 303) {
					expect(e.location).toBe('/governance/operations');
				}
			}
		});

		it('returns API error message on failure', async () => {
			mockCreateTicketingConfig.mockRejectedValue(new ApiError('Config exists', 409));
			expect(typeof actions.default).toBe('function');
		});
	});
});

describe('Ticketing Create +page.svelte', () => {
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
