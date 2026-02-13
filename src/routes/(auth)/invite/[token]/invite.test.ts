import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/imports', () => ({
	validateInvitation: vi.fn(),
	acceptInvitation: vi.fn()
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

import { load, actions } from './+page.server';
import { validateInvitation, acceptInvitation } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/invite/test-token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Invite [token] +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('load', () => {
		it('valid token returns email and form data', async () => {
			vi.mocked(validateInvitation).mockResolvedValue({
				valid: true,
				email: 'user@example.com',
				tenant_name: 'Acme Corp',
				reason: null,
				message: null
			});

			const result: any = await load({
				params: { token: 'valid-token' },
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.validation.valid).toBe(true);
			expect(result.validation.email).toBe('user@example.com');
			expect(result.validation.tenant_name).toBe('Acme Corp');
			expect(validateInvitation).toHaveBeenCalledWith('valid-token', expect.any(Function));
		});

		it('expired token returns validation result with reason', async () => {
			vi.mocked(validateInvitation).mockResolvedValue({
				valid: false,
				email: null,
				tenant_name: null,
				reason: 'expired',
				message: 'This invitation has expired'
			});

			const result: any = await load({
				params: { token: 'expired-token' },
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.validation.valid).toBe(false);
			expect(result.validation.reason).toBe('expired');
		});

		it('invalid token returns validation result', async () => {
			vi.mocked(validateInvitation).mockRejectedValue(new Error('not found'));

			const result: any = await load({
				params: { token: 'bad-token' },
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.validation.valid).toBe(false);
			expect(result.validation.reason).toBe('invalid');
		});
	});

	describe('default action', () => {
		it('valid password calls acceptInvitation and redirects', async () => {
			vi.mocked(acceptInvitation).mockResolvedValue({
				success: true,
				message: null,
				redirect_url: '/login'
			});

			try {
				await actions.default({
					request: makeFormData({
						password: 'StrongP@ss1',
						confirm_password: 'StrongP@ss1'
					}),
					params: { token: 'valid-token' },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}

			expect(acceptInvitation).toHaveBeenCalledWith(
				'valid-token',
				'StrongP@ss1',
				expect.any(Function)
			);
		});

		it('short password returns validation error', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					password: 'short',
					confirm_password: 'short'
				}),
				params: { token: 'valid-token' },
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
			expect(acceptInvitation).not.toHaveBeenCalled();
		});

		it('mismatched passwords returns validation error', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					password: 'StrongP@ss1',
					confirm_password: 'DifferentP@ss2'
				}),
				params: { token: 'valid-token' },
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
			expect(acceptInvitation).not.toHaveBeenCalled();
		});

		it('backend error returns error message', async () => {
			vi.mocked(acceptInvitation).mockRejectedValue(
				new ApiError('Token expired', 410)
			);

			const result: any = await actions.default({
				request: makeFormData({
					password: 'StrongP@ss1',
					confirm_password: 'StrongP@ss1'
				}),
				params: { token: 'expired-token' },
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(410);
		});
	});
});

describe('Invite [token] +page.svelte', () => {
	it('page component is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
