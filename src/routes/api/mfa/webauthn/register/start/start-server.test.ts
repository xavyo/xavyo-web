import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/mfa', () => ({
	startWebauthnRegistration: vi.fn()
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
import { startWebauthnRegistration } from '$lib/api/mfa';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/mfa/webauthn/register/start', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/mfa/webauthn/register/start', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('starts registration with an optional name', async () => {
		vi.mocked(startWebauthnRegistration).mockResolvedValue({ challenge: 'c' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'laptop' })) as any);
		expect(response.status).toBe(200);
		expect(startWebauthnRegistration).toHaveBeenCalled();
	});

	it('does not start on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(startWebauthnRegistration).not.toHaveBeenCalled();
	});

	it('does not start when name is empty', async () => {
		const response = await POST(makeEvent(JSON.stringify({ name: '' })) as any);
		expect(response.status).toBe(400);
		expect(startWebauthnRegistration).not.toHaveBeenCalled();
	});
});
