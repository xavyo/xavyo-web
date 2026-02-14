import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules
vi.mock('$app/environment', () => ({ dev: true }));

vi.mock('$lib/schemas/auth', () => ({
	signupSchema: {
		_type: {} as { email: string; password: string; displayName?: string }
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
	signup: vi.fn()
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
import { signup } from '$lib/api/auth';

const mockSuperValidate = vi.mocked(superValidate);
const mockSignup = vi.mocked(signup);

describe('signup page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('redirects to dashboard if user is already logged in', async () => {
			const { load } = await import('./+page.server');
			await expect(
				load({ locals: { user: { sub: '123' } } } as any)
			).rejects.toMatchObject({ status: 302, location: '/dashboard' });
		});
	});

	describe('signup action', () => {
		it('redirects to check-email page on success (not onboarding)', async () => {
			const { actions } = await import('./+page.server');
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email: 'new@example.com', password: 'Pass1234!', displayName: '' }
			} as any);
			mockSignup.mockResolvedValue({} as any);

			await expect(
				actions.default({
					request: new Request('http://localhost/signup', { method: 'POST' }),
					fetch: vi.fn(),
					cookies: { set: vi.fn(), get: vi.fn() }
				} as any)
			).rejects.toMatchObject({
				status: 302,
				location: '/check-email?email=new%40example.com'
			});
		});

		it('does NOT set access_token cookie on signup', async () => {
			const { actions } = await import('./+page.server');
			const cookieSet = vi.fn();
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email: 'new@example.com', password: 'Pass1234!', displayName: '' }
			} as any);
			mockSignup.mockResolvedValue({} as any);

			try {
				await actions.default({
					request: new Request('http://localhost/signup', { method: 'POST' }),
					fetch: vi.fn(),
					cookies: { set: cookieSet, get: vi.fn() }
				} as any);
			} catch {
				// redirect throws
			}

			// Ensure no cookies were set (no auto-login)
			expect(cookieSet).not.toHaveBeenCalled();
		});

		it('shows API error on signup failure', async () => {
			const { actions } = await import('./+page.server');
			const { ApiError } = await import('$lib/api/client');
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { email: 'dup@example.com', password: 'Pass1234!', displayName: '' }
			} as any);
			mockSignup.mockRejectedValue(new ApiError('Email already in use', 409));

			const result = await actions.default({
				request: new Request('http://localhost/signup', { method: 'POST' }),
				fetch: vi.fn(),
				cookies: { set: vi.fn(), get: vi.fn() }
			} as any);

			expect(result).toBeDefined();
		});
	});
});
