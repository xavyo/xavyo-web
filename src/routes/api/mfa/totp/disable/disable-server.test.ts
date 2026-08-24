import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/mfa', () => ({
	disableTotp: vi.fn()
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

import { DELETE } from './+server';
import { disableTotp } from '$lib/api/mfa';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/mfa/totp/disable', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('DELETE /api/mfa/totp/disable', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('disables TOTP with password and code', async () => {
		vi.mocked(disableTotp).mockResolvedValue({ message: 'ok' } as any);
		const response = await DELETE(
			makeEvent(JSON.stringify({ password: 'pw', code: '123456' })) as any
		);
		expect(response.status).toBe(200);
		expect(disableTotp).toHaveBeenCalledWith(
			{ password: 'pw', code: '123456' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not disable on invalid JSON', async () => {
		const response = await DELETE(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(disableTotp).not.toHaveBeenCalled();
	});

	it('does not disable when password is missing', async () => {
		const response = await DELETE(makeEvent(JSON.stringify({ code: '123456' })) as any);
		expect(response.status).toBe(400);
		expect(disableTotp).not.toHaveBeenCalled();
	});
});
