import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$app/environment', () => ({ dev: true }));

vi.mock('$lib/schemas/auth', () => ({
	forgotPasswordSchema: {
		_type: {} as { email: string }
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

vi.mock('$lib/api/auth', () => ({
	forgotPassword: vi.fn().mockResolvedValue({ message: 'ok' })
}));

vi.mock('$lib/server/auth', () => ({
	SYSTEM_TENANT_ID: '00000000-0000-0000-0000-000000000001',
	requestTenantId: vi.fn(
		(url: URL, cookies: { get: (name: string) => string | undefined }) =>
			url.searchParams.get('tenant') || cookies.get('tenant_id')
	)
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
import { forgotPassword } from '$lib/api/auth';

const mockSuperValidate = vi.mocked(superValidate);
const mockForgotPassword = vi.mocked(forgotPassword);

function makeCookies() {
	return {
		get: vi.fn(() => undefined),
		set: vi.fn(),
		delete: vi.fn()
	};
}

describe('forgot-password page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('defaults to system tenant when no tenant cookie or query', async () => {
		const { actions } = await import('./+page.server');
		const { SYSTEM_TENANT_ID } = await import('$lib/server/auth');
		mockSuperValidate.mockResolvedValue({
			valid: true,
			data: { email: 'user@example.com' }
		} as any);

		await actions.default({
			request: new Request('http://localhost/forgot-password', { method: 'POST' }),
			cookies: makeCookies(),
			fetch: vi.fn(),
			url: new URL('http://localhost/forgot-password')
		} as any);

		expect(mockForgotPassword).toHaveBeenCalledWith(
			'user@example.com',
			SYSTEM_TENANT_ID,
			expect.any(Function)
		);
	});

	it('sends a UUID ?tenant= instead of the system tenant', async () => {
		const { actions } = await import('./+page.server');
		const tenantId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
		mockSuperValidate.mockResolvedValue({
			valid: true,
			data: { email: 'user@example.com' }
		} as any);

		await actions.default({
			request: new Request(`http://localhost/forgot-password?tenant=${tenantId}`, {
				method: 'POST'
			}),
			cookies: makeCookies(),
			fetch: vi.fn(),
			url: new URL(`http://localhost/forgot-password?tenant=${tenantId}`)
		} as any);

		expect(mockForgotPassword).toHaveBeenCalledWith(
			'user@example.com',
			tenantId,
			expect.any(Function)
		);
	});
});
