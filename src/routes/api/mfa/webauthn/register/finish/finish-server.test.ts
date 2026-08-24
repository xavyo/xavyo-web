import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/mfa', () => ({
	finishWebauthnRegistration: vi.fn()
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
import { finishWebauthnRegistration } from '$lib/api/mfa';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/mfa/webauthn/register/finish', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/mfa/webauthn/register/finish', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('finishes registration with a valid object', async () => {
		vi.mocked(finishWebauthnRegistration).mockResolvedValue({ id: 'cred-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ id: 'cred' })) as any);
		expect(response.status).toBe(200);
		expect(finishWebauthnRegistration).toHaveBeenCalled();
	});

	it('does not finish on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(finishWebauthnRegistration).not.toHaveBeenCalled();
	});
});
