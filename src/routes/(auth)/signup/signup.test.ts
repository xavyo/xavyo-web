import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$app/environment', () => ({ dev: true }));

vi.mock('$lib/schemas/auth', () => ({
	signupSchema: {
		_type: {} as {
			organizationName: string;
			email: string;
			password: string;
			displayName?: string;
		}
	}
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn(),
	message: vi.fn((_form: unknown, msg: string, opts: unknown) => ({
		message: msg,
		...(opts as object)
	}))
}));

vi.mock('$lib/api/tenants', () => ({
	signupTenant: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		errorType: string;
		constructor(message: string, status: number, errorType?: string) {
			super(message);
			this.status = status;
			this.errorType = errorType ?? '';
		}
	}
}));

import { superValidate } from 'sveltekit-superforms';
import { signupTenant } from '$lib/api/tenants';

const mockSuperValidate = vi.mocked(superValidate);
const mockSignupTenant = vi.mocked(signupTenant);

describe('signup page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('redirects to dashboard if user is already logged in', async () => {
			const { load } = await import('./+page.server');
			await expect(load({ locals: { user: { sub: '123' } } } as any)).rejects.toMatchObject({
				status: 302,
				location: '/dashboard'
			});
		});
	});

	describe('signup action', () => {
		it('redirects to check-email with tenant after POST /tenants/signup', async () => {
			const { actions } = await import('./+page.server');
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					organizationName: 'Acme Corp',
					email: 'new@example.com',
					password: 'a-long-unique-pass',
					displayName: ''
				}
			} as any);
			mockSignupTenant.mockResolvedValue({
				tenant: { id: 'tenant-1', slug: 'acme-corp', name: 'Acme Corp' },
				admin: { id: 'user-1', email: 'new@example.com', email_verified: false },
				oauth_client: { client_id: 'cid', client_secret: 'sec' },
				verification_email_sent: true
			});

			await expect(
				actions.default({
					request: new Request('http://localhost/signup', { method: 'POST' }),
					fetch: vi.fn(),
					cookies: { set: vi.fn(), get: vi.fn() }
				} as any)
			).rejects.toMatchObject({
				status: 302,
				location: '/check-email?email=new%40example.com&tenant=tenant-1&sent=1'
			});

			expect(mockSignupTenant).toHaveBeenCalledWith(
				{
					organization_name: 'Acme Corp',
					email: 'new@example.com',
					password: 'a-long-unique-pass',
					display_name: ''
				},
				expect.any(Function)
			);
		});

		it('does NOT set access_token cookie on signup', async () => {
			const { actions } = await import('./+page.server');
			const cookieSet = vi.fn();
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					organizationName: 'Acme',
					email: 'new@example.com',
					password: 'a-long-unique-pass',
					displayName: ''
				}
			} as any);
			mockSignupTenant.mockResolvedValue({
				tenant: { id: 'tenant-1', slug: 'acme', name: 'Acme' },
				admin: { id: 'user-1', email: 'new@example.com', email_verified: false },
				oauth_client: { client_id: 'cid', client_secret: 'sec' },
				verification_email_sent: true
			});

			try {
				await actions.default({
					request: new Request('http://localhost/signup', { method: 'POST' }),
					fetch: vi.fn(),
					cookies: { set: cookieSet, get: vi.fn() }
				} as any);
			} catch {
				// redirect throws
			}

			expect(cookieSet).toHaveBeenCalledWith(
				'tenant_id',
				'tenant-1',
				expect.objectContaining({ httpOnly: true, path: '/' })
			);
			expect(cookieSet.mock.calls.some((c) => c[0] === 'access_token')).toBe(false);
		});

		it('redirects with sent=0 when verification email was not sent', async () => {
			const { actions } = await import('./+page.server');
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					organizationName: 'Acme',
					email: 'new@example.com',
					password: 'a-long-unique-pass',
					displayName: ''
				}
			} as any);
			mockSignupTenant.mockResolvedValue({
				tenant: { id: 'tenant-1', slug: 'acme', name: 'Acme' },
				admin: { id: 'user-1', email: 'new@example.com', email_verified: false },
				oauth_client: { client_id: 'cid', client_secret: 'sec' },
				verification_email_sent: false
			});

			await expect(
				actions.default({
					request: new Request('http://localhost/signup', { method: 'POST' }),
					fetch: vi.fn(),
					cookies: { set: vi.fn(), get: vi.fn() }
				} as any)
			).rejects.toMatchObject({
				status: 302,
				location: '/check-email?email=new%40example.com&tenant=tenant-1&sent=0'
			});
		});

		it('marks one-org retry when oauth_client is omitted', async () => {
			const { actions } = await import('./+page.server');
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					organizationName: 'Acme',
					email: 'new@example.com',
					password: 'a-long-unique-pass',
					displayName: ''
				}
			} as any);
			mockSignupTenant.mockResolvedValue({
				tenant: { id: 'tenant-1', slug: 'acme', name: 'Acme' },
				admin: { id: 'user-1', email: 'new@example.com', email_verified: false },
				verification_email_sent: true
			});

			await expect(
				actions.default({
					request: new Request('http://localhost/signup', { method: 'POST' }),
					fetch: vi.fn(),
					cookies: { set: vi.fn(), get: vi.fn() }
				} as any)
			).rejects.toMatchObject({
				status: 302,
				location: '/check-email?email=new%40example.com&tenant=tenant-1&sent=1&retry=1'
			});
		});

		it('shows API error on signup failure', async () => {
			const { actions } = await import('./+page.server');
			const { ApiError } = await import('$lib/api/client');
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					organizationName: 'Acme',
					email: 'dup@example.com',
					password: 'a-long-unique-pass',
					displayName: ''
				}
			} as any);
			mockSignupTenant.mockRejectedValue(new ApiError('Email already in use', 409));

			const result = await actions.default({
				request: new Request('http://localhost/signup', { method: 'POST' }),
				fetch: vi.fn(),
				cookies: { set: vi.fn(), get: vi.fn() }
			} as any);

			expect(result).toBeDefined();
		});
	});
});
