import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/mfa', () => ({
	verifyTotpSetup: vi.fn()
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

import { POST } from './+server';
import { verifyTotpSetup } from '$lib/api/mfa';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/mfa/totp/verify-setup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/mfa/totp/verify-setup', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('verifies with a code', async () => {
		vi.mocked(verifyTotpSetup).mockResolvedValue({ recovery_codes: [] } as any);
		const response = await POST(makeEvent(JSON.stringify({ code: '123456' })) as any);
		expect(response.status).toBe(200);
		expect(verifyTotpSetup).toHaveBeenCalledWith(
			{ code: '123456' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not verify on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(verifyTotpSetup).not.toHaveBeenCalled();
	});

	it('does not verify when code is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(verifyTotpSetup).not.toHaveBeenCalled();
	});
});
