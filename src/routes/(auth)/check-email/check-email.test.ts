import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules
vi.mock('$lib/server/auth', () => ({
	SYSTEM_TENANT_ID: '00000000-0000-0000-0000-000000000001'
}));

vi.mock('$lib/api/client', () => ({
	apiClient: vi.fn(),
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

import { apiClient } from '$lib/api/client';

const mockApiClient = vi.mocked(apiClient);

describe('check-email page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('returns email from URL search params', async () => {
			const { load } = await import('./+page.server');
			const url = new URL('http://localhost/check-email?email=test@example.com');
			const result = await load({ url } as any) as { email: string };
			expect(result.email).toBe('test@example.com');
		});

		it('returns empty string when no email param', async () => {
			const { load } = await import('./+page.server');
			const url = new URL('http://localhost/check-email');
			const result = await load({ url } as any) as { email: string };
			expect(result.email).toBe('');
		});

		it('handles encoded email correctly', async () => {
			const { load } = await import('./+page.server');
			const url = new URL('http://localhost/check-email?email=user%2Btag%40example.com');
			const result = await load({ url } as any) as { email: string };
			expect(result.email).toBe('user+tag@example.com');
		});
	});

	describe('resend action', () => {
		it('calls backend resend-verification endpoint', async () => {
			const { actions } = await import('./+page.server');
			mockApiClient.mockResolvedValue({ message: 'ok' });

			const formData = new FormData();
			formData.set('email', 'test@example.com');
			const request = new Request('http://localhost/check-email?/resend', {
				method: 'POST',
				body: formData
			});

			const result = await actions.resend({
				request,
				fetch: vi.fn() as unknown as typeof globalThis.fetch
			} as any);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/resend-verification', {
				method: 'POST',
				body: { email: 'test@example.com' },
				tenantId: '00000000-0000-0000-0000-000000000001',
				fetch: expect.any(Function)
			});
			expect(result).toEqual({ success: true });
		});

		it('returns success even on API error (anti-enumeration)', async () => {
			const { actions } = await import('./+page.server');
			mockApiClient.mockRejectedValue(new Error('server error'));

			const formData = new FormData();
			formData.set('email', 'nonexistent@example.com');
			const request = new Request('http://localhost/check-email?/resend', {
				method: 'POST',
				body: formData
			});

			const result = await actions.resend({
				request,
				fetch: vi.fn() as unknown as typeof globalThis.fetch
			} as any);

			expect(result).toEqual({ success: true });
		});

		it('returns error when email is missing', async () => {
			const { actions } = await import('./+page.server');

			const formData = new FormData();
			const request = new Request('http://localhost/check-email?/resend', {
				method: 'POST',
				body: formData
			});

			const result = await actions.resend({
				request,
				fetch: vi.fn() as unknown as typeof globalThis.fetch
			} as any);

			expect(result).toEqual({ success: false, error: 'Email is required' });
		});
	});
});
