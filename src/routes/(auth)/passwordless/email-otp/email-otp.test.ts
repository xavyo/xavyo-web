import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/auth', () => ({
	requestEmailOtp: vi.fn(),
	verifyEmailOtp: vi.fn()
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
import { verifyEmailOtp } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

const TENANT = '11111111-1111-4111-8111-111111111111';

function makeFormData(data: Record<string, string>): Request {
	return new Request(`http://localhost/passwordless/email-otp?tenant=${TENANT}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(data).toString()
	});
}

const cookies = { get: () => undefined, set: vi.fn(), delete: vi.fn() };

describe('email-otp verify action', () => {
	beforeEach(() => vi.resetAllMocks());

	it('keeps the user on the code-entry step (codeSent + email) on a wrong code', async () => {
		vi.mocked(verifyEmailOtp).mockRejectedValue(new ApiError('Invalid code', 401));

		const result = (await actions.verify({
			request: makeFormData({ email: 'user@example.com', code: '000000' }),
			cookies,
			url: new URL(`http://localhost/passwordless/email-otp?tenant=${TENANT}`),
			fetch: vi.fn()
		} as never)) as { status: number; data: Record<string, unknown> };

		expect(result.status).toBe(401);
		// Must NOT bounce back to the email-request form.
		expect(result.data.codeSent).toBe(true);
		expect(result.data.email).toBe('user@example.com');
		expect(result.data.error).toBe('Invalid code');
	});

	it('keeps the code-entry step on a malformed (client-invalid) code', async () => {
		const result = (await actions.verify({
			request: makeFormData({ email: 'user@example.com', code: '12' }),
			cookies,
			url: new URL(`http://localhost/passwordless/email-otp?tenant=${TENANT}`),
			fetch: vi.fn()
		} as never)) as { status: number; data: Record<string, unknown> };

		expect(result.status).toBe(400);
		expect(result.data.codeSent).toBe(true);
		expect(verifyEmailOtp).not.toHaveBeenCalled();
	});
});
