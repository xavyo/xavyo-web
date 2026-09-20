import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	requestTenantId: vi.fn(
		(url: URL, cookies: { get: (name: string) => string | undefined }) =>
			url.searchParams.get('tenant') || cookies.get('tenant_id')
	),
	tenantIdFromQuery: vi.fn((value: string | null | undefined) => {
		if (!value) return undefined;
		const trimmed = value.trim();
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)
			? trimmed
			: undefined;
	}),
	stampTenantCookieFromQuery: vi.fn(
		(cookies: { set: (n: string, v: string) => void }, url: URL) => {
			const tid = url.searchParams.get('tenant');
			if (
				tid &&
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tid)
			) {
				cookies.set('tenant_id', tid);
				return tid;
			}
			return undefined;
		}
	)
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
			const result = (await load({
				url,
				cookies: { get: () => undefined, set: vi.fn() }
			} as any)) as {
				email: string;
				verificationEmailSent: boolean;
			};
			expect(result.email).toBe('test@example.com');
			expect(result.verificationEmailSent).toBe(true);
		});

		it('returns empty string when no email param', async () => {
			const { load } = await import('./+page.server');
			const url = new URL('http://localhost/check-email');
			const result = (await load({
				url,
				cookies: { get: () => undefined, set: vi.fn() }
			} as any)) as { email: string };
			expect(result.email).toBe('');
		});

		it('handles encoded email correctly', async () => {
			const { load } = await import('./+page.server');
			const url = new URL('http://localhost/check-email?email=user%2Btag%40example.com');
			const result = (await load({
				url,
				cookies: { get: () => undefined, set: vi.fn() }
			} as any)) as { email: string };
			expect(result.email).toBe('user+tag@example.com');
		});

		it('flags verificationEmailSent false when sent=0', async () => {
			const { load } = await import('./+page.server');
			const url = new URL(
				'http://localhost/check-email?email=a@b.com&tenant=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee&sent=0'
			);
			const cookieSet = vi.fn();
			const result = (await load({
				url,
				cookies: { get: () => undefined, set: cookieSet }
			} as any)) as {
				verificationEmailSent: boolean;
				tenant: string;
			};
			expect(result.verificationEmailSent).toBe(false);
			expect(result.tenant).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
			expect(cookieSet).toHaveBeenCalledWith('tenant_id', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
		});

		it('flags isRetry when retry=1', async () => {
			const { load } = await import('./+page.server');
			const url = new URL(
				'http://localhost/check-email?email=a@b.com&tenant=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee&sent=1&retry=1'
			);
			const result = (await load({
				url,
				cookies: { get: () => undefined, set: vi.fn() }
			} as any)) as { isRetry: boolean };
			expect(result.isRetry).toBe(true);
		});

		it('defaults isRetry false', async () => {
			const { load } = await import('./+page.server');
			const url = new URL('http://localhost/check-email?email=a@b.com');
			const result = (await load({
				url,
				cookies: { get: () => undefined, set: vi.fn() }
			} as any)) as { isRetry: boolean };
			expect(result.isRetry).toBe(false);
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
				url: new URL('http://localhost/check-email'),
				cookies: { get: () => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' },
				fetch: vi.fn() as unknown as typeof globalThis.fetch
			} as any);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/resend-verification', {
				method: 'POST',
				body: { email: 'test@example.com' },
				tenantId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
				fetch: expect.any(Function)
			});
			expect(result).toEqual({ success: true });
		});

		it('prefers form tenant over cookie when both present', async () => {
			const { actions } = await import('./+page.server');
			mockApiClient.mockResolvedValue({ message: 'ok' });

			const formData = new FormData();
			formData.set('email', 'same@example.com');
			formData.set('tenant', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
			const request = new Request('http://localhost/check-email?/resend', {
				method: 'POST',
				body: formData
			});

			await actions.resend({
				request,
				url: new URL('http://localhost/check-email'),
				cookies: { get: () => '11111111-2222-3333-4444-555555555555' },
				fetch: vi.fn() as unknown as typeof globalThis.fetch
			} as any);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/resend-verification', {
				method: 'POST',
				body: { email: 'same@example.com' },
				tenantId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
				fetch: expect.any(Function)
			});
		});

		it('does not send the system tenant when no tenant cookie is set', async () => {
			const { actions } = await import('./+page.server');
			mockApiClient.mockResolvedValue({ message: 'ok' });

			const formData = new FormData();
			formData.set('email', 'test@example.com');
			const request = new Request('http://localhost/check-email?/resend', {
				method: 'POST',
				body: formData
			});

			await actions.resend({
				request,
				url: new URL('http://localhost/check-email'),
				cookies: { get: () => undefined },
				fetch: vi.fn() as unknown as typeof globalThis.fetch
			} as any);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/resend-verification', {
				method: 'POST',
				body: { email: 'test@example.com' },
				fetch: expect.any(Function)
			});
			expect(mockApiClient.mock.calls[0][1]).not.toHaveProperty(
				'tenantId',
				'00000000-0000-0000-0000-000000000001'
			);
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
				url: new URL('http://localhost/check-email'),
				cookies: { get: () => undefined },
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
				url: new URL('http://localhost/check-email'),
				cookies: { get: () => undefined },
				fetch: vi.fn() as unknown as typeof globalThis.fetch
			} as any);

			expect(result).toEqual({ success: false, error: 'Email is required' });
		});
	});
});
