import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('$lib/api/auth', () => ({
	verifyEmail: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	setCookies: vi.fn()
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

import { verifyEmail } from '$lib/api/auth';
import { setCookies } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockVerifyEmail = vi.mocked(verifyEmail);
const mockSetCookies = vi.mocked(setCookies);

function makeFormRequest(data: Record<string, string>): Request {
	const formData = new FormData();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/verify-email', {
		method: 'POST',
		body: formData
	});
}

function makeCookies() {
	return {
		get: vi.fn(() => undefined),
		set: vi.fn(),
		delete: vi.fn()
	};
}

describe('verify-email page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('returns hasToken when token query param is present', async () => {
			const { load } = await import('./+page.server');
			const result = (await load({
				url: new URL('http://localhost/verify-email?token=tok-abc')
			} as any)) as {
				hasToken: boolean;
				verified: boolean;
				error: string | null;
			};

			expect(result).toEqual({
				hasToken: true,
				verified: false,
				error: null
			});
			expect(mockVerifyEmail).not.toHaveBeenCalled();
		});

		it('returns missing-token error when token is absent', async () => {
			const { load } = await import('./+page.server');
			const result = (await load({
				url: new URL('http://localhost/verify-email')
			} as any)) as {
				hasToken: boolean;
				verified: boolean;
				error: string | null;
			};

			expect(result).toEqual({
				hasToken: false,
				verified: false,
				error: 'No verification token provided.'
			});
			expect(mockVerifyEmail).not.toHaveBeenCalled();
		});

		it('does not auto-verify on GET (scanner-safe click-to-confirm)', async () => {
			const { load } = await import('./+page.server');
			await load({
				url: new URL('http://localhost/verify-email?token=scanner-prey')
			} as any);

			expect(mockVerifyEmail).not.toHaveBeenCalled();
		});
	});

	describe('default action', () => {
		it('fails when token is missing from the form', async () => {
			const { actions } = await import('./+page.server');
			const result = (await actions.default({
				request: makeFormRequest({}),
				fetch: vi.fn(),
				cookies: makeCookies()
			} as any)) as { status: number; data: Record<string, unknown> };

			expect(result.status).toBe(400);
			expect(result.data).toEqual({
				verified: false,
				error: 'Missing verification token.'
			});
			expect(mockVerifyEmail).not.toHaveBeenCalled();
		});

		it('sets session cookies and redirects to dashboard on fresh verify', async () => {
			const { actions } = await import('./+page.server');
			const cookies = makeCookies();
			mockVerifyEmail.mockResolvedValue({
				message: 'Email verified',
				already_verified: false,
				access_token: 'at',
				refresh_token: 'rt',
				token_type: 'Bearer',
				expires_in: 3600
			});

			await expect(
				actions.default({
					request: makeFormRequest({ token: 'tok-fresh' }),
					fetch: vi.fn(),
					cookies
				} as any)
			).rejects.toMatchObject({
				status: 303,
				location: '/dashboard'
			});

			expect(mockVerifyEmail).toHaveBeenCalledWith('tok-fresh', expect.any(Function));
			expect(mockSetCookies).toHaveBeenCalledWith(cookies, {
				access_token: 'at',
				refresh_token: 'rt',
				token_type: 'Bearer',
				expires_in: 3600
			});
		});

		it('returns verified result when API omits session tokens', async () => {
			const { actions } = await import('./+page.server');
			mockVerifyEmail.mockResolvedValue({
				message: 'Already done',
				already_verified: true
			});

			const result = await actions.default({
				request: makeFormRequest({ token: 'tok-again' }),
				fetch: vi.fn(),
				cookies: makeCookies()
			} as any);

			expect(result).toEqual({
				verified: true,
				alreadyVerified: true,
				message: 'Already done',
				error: null
			});
			expect(mockSetCookies).not.toHaveBeenCalled();
		});

		it('surfaces ApiError status and message', async () => {
			const { actions } = await import('./+page.server');
			mockVerifyEmail.mockRejectedValue(new ApiError('Token expired', 410));

			const result = (await actions.default({
				request: makeFormRequest({ token: 'tok-old' }),
				fetch: vi.fn(),
				cookies: makeCookies()
			} as any)) as { status: number; data: Record<string, unknown> };

			expect(result.status).toBe(410);
			expect(result.data).toEqual({
				verified: false,
				error: 'Token expired'
			});
		});

		it('fails closed on unexpected errors', async () => {
			const { actions } = await import('./+page.server');
			mockVerifyEmail.mockRejectedValue(new Error('network down'));

			const result = (await actions.default({
				request: makeFormRequest({ token: 'tok-x' }),
				fetch: vi.fn(),
				cookies: makeCookies()
			} as any)) as { status: number; data: Record<string, unknown> };

			expect(result.status).toBe(500);
			expect(result.data).toEqual({
				verified: false,
				error: 'An unexpected error occurred.'
			});
		});
	});
});

describe('verify-email +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 20000);

	it('pins click-to-confirm UI (no auto-POST on GET)', () => {
		const src = readFileSync('src/routes/(auth)/verify-email/+page.svelte', 'utf8');
		expect(src).toContain('FunnelSteps');
		expect(src).toContain('current={2}');
		expect(src).toContain('Verify your email');
		expect(src).toContain('Verify email');
		expect(src).toContain('Verifying…');
		expect(src).toContain('method="POST"');
		expect(src).toContain('use:enhance');
		expect(src).toContain('email scanners do not');
		expect(src).toContain('name="token"');
		expect(src).not.toContain('onMount');
		expect(src).not.toContain('requestSubmit');
		expect(src).not.toContain('.submit(');
	});
});
