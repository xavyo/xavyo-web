import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/mfa', () => ({
	regenerateRecoveryCodes: vi.fn()
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
import { regenerateRecoveryCodes } from '$lib/api/mfa';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/mfa/recovery/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/mfa/recovery/generate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('regenerates codes with a password', async () => {
		vi.mocked(regenerateRecoveryCodes).mockResolvedValue({ recovery_codes: [] } as any);
		const response = await POST(makeEvent(JSON.stringify({ password: 'pw' })) as any);
		expect(response.status).toBe(200);
		expect(regenerateRecoveryCodes).toHaveBeenCalledWith(
			{ password: 'pw' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not regenerate on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(regenerateRecoveryCodes).not.toHaveBeenCalled();
	});

	it('does not regenerate when password is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(regenerateRecoveryCodes).not.toHaveBeenCalled();
	});
});
