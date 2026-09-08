import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/auth', () => ({
	requestMagicLink: vi.fn()
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

import { actions } from './+page.server';
import { requestMagicLink } from '$lib/api/auth';

const TENANT = '11111111-1111-4111-8111-111111111111';

function makeFormData(data: Record<string, string>): Request {
	const body = new URLSearchParams(data);
	return new Request('http://localhost/passwordless/magic-link', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: body.toString()
	});
}

function cookieStub() {
	return { get: () => undefined, set: vi.fn(), delete: vi.fn() };
}

describe('magic-link request action', () => {
	beforeEach(() => vi.resetAllMocks());

	it('preserves tenant from the query in the /sent redirect', async () => {
		vi.mocked(requestMagicLink).mockResolvedValue({} as never);
		try {
			await actions.default({
				request: makeFormData({ email: 'user@example.com' }),
				cookies: cookieStub(),
				url: new URL(`http://localhost/passwordless/magic-link?tenant=${TENANT}`),
				fetch: vi.fn()
			} as never);
			expect.fail('should have redirected');
		} catch (e) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(302);
			expect(err.location).toBe(`/passwordless/magic-link/sent?tenant=${TENANT}`);
		}
		expect(requestMagicLink).toHaveBeenCalledWith('user@example.com', TENANT, expect.any(Function));
	});

	it('redirects without tenant when none is provided', async () => {
		vi.mocked(requestMagicLink).mockResolvedValue({} as never);
		try {
			await actions.default({
				request: makeFormData({ email: 'user@example.com' }),
				cookies: cookieStub(),
				url: new URL('http://localhost/passwordless/magic-link'),
				fetch: vi.fn()
			} as never);
			expect.fail('should have redirected');
		} catch (e) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(302);
			expect(err.location).toBe('/passwordless/magic-link/sent');
		}
	});
});
