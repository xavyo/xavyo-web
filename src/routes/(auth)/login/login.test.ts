import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules
vi.mock('$app/environment', () => ({ dev: true }));

vi.mock('$lib/schemas/auth', () => ({
	loginSchema: {
		_type: {} as { email: string; password: string }
	}
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn(),
	message: vi.fn((_form: unknown, msg: string, opts: unknown) => ({ message: msg, ...opts as object }))
}));

vi.mock('$lib/api/auth', () => ({
	login: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	setCookies: vi.fn(),
	SYSTEM_TENANT_ID: '00000000-0000-0000-0000-000000000001',
	decodeAccessToken: vi.fn(() => ({ tid: 'tenant-123' }))
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
import { login } from '$lib/api/auth';

const mockSuperValidate = vi.mocked(superValidate);
const mockLogin = vi.mocked(login);

function makeCookies() {
	return {
		get: vi.fn(() => undefined),
		set: vi.fn(),
		delete: vi.fn()
	};
}

describe('login page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('redirects to dashboard if user is already logged in', async () => {
			const { load } = await import('./+page.server');
			await expect(
				load({
					locals: { user: { sub: '123' } },
					url: new URL('http://localhost/login')
				} as any)
			).rejects.toMatchObject({ status: 302, location: '/dashboard' });
		});
	});

	describe('login action', () => {
		it('redirects to dashboard on successful login', async () => {
			const { actions } = await import('./+page.server');
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email: 'user@example.com', password: 'Pass1234!' }
			} as any);
			mockLogin.mockResolvedValue({
				access_token: 'tok',
				refresh_token: 'rt',
				token_type: 'Bearer',
				expires_in: 3600
			});

			await expect(
				actions.default({
					request: new Request('http://localhost/login', { method: 'POST' }),
					cookies: makeCookies(),
					fetch: vi.fn(),
					url: new URL('http://localhost/login')
				} as any)
			).rejects.toMatchObject({ status: 302, location: '/dashboard' });
		});

		it('redirects to check-email when email not verified (403 with error type)', async () => {
			const { actions } = await import('./+page.server');
			const { ApiError } = await import('$lib/api/client');

			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email: 'unverified@example.com', password: 'Pass1234!' }
			} as any);
			mockLogin.mockRejectedValue(
				new ApiError(
					'Please verify your email address before proceeding.',
					403,
					'https://xavyo.net/errors/email-not-verified'
				)
			);

			await expect(
				actions.default({
					request: new Request('http://localhost/login', { method: 'POST' }),
					cookies: makeCookies(),
					fetch: vi.fn(),
					url: new URL('http://localhost/login')
				} as any)
			).rejects.toMatchObject({
				status: 302,
				location: '/check-email?email=unverified%40example.com'
			});
		});

		it('shows inline error for other 403 errors (not email-not-verified)', async () => {
			const { actions } = await import('./+page.server');
			const { ApiError } = await import('$lib/api/client');

			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email: 'user@example.com', password: 'Pass1234!' }
			} as any);
			mockLogin.mockRejectedValue(
				new ApiError(
					'Account restricted due to elevated risk.',
					403,
					'https://xavyo.net/errors/account-restricted'
				)
			);

			const result = await actions.default({
				request: new Request('http://localhost/login', { method: 'POST' }),
				cookies: makeCookies(),
				fetch: vi.fn(),
				url: new URL('http://localhost/login')
			} as any);

			// Should NOT redirect, should return message
			expect(result).toBeDefined();
		});

		it('shows inline error for 401 invalid credentials', async () => {
			const { actions } = await import('./+page.server');
			const { ApiError } = await import('$lib/api/client');

			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email: 'user@example.com', password: 'wrong' }
			} as any);
			mockLogin.mockRejectedValue(
				new ApiError(
					'The provided credentials are invalid.',
					401,
					'https://xavyo.net/errors/invalid-credentials'
				)
			);

			const result = await actions.default({
				request: new Request('http://localhost/login', { method: 'POST' }),
				cookies: makeCookies(),
				fetch: vi.fn(),
				url: new URL('http://localhost/login')
			} as any);

			expect(result).toBeDefined();
		});
	});
});
