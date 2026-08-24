import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/me', () => ({
	verifyEmailChange: vi.fn()
}));

import { POST } from './+server';
import { verifyEmailChange } from '$lib/api/me';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/me/email/verify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/me/email/verify', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('verifies with a required token', async () => {
		vi.mocked(verifyEmailChange).mockResolvedValue({ message: 'ok', new_email: 'a@b.c' } as any);
		const response = await POST(makeEvent(JSON.stringify({ token: 't' })) as any);
		expect(response.status).toBe(200);
		expect(verifyEmailChange).toHaveBeenCalled();
	});

	it('does not verify on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(verifyEmailChange).not.toHaveBeenCalled();
	});

	it('does not verify when token is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(verifyEmailChange).not.toHaveBeenCalled();
	});
});
