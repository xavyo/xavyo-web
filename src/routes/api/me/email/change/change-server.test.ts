import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/me', () => ({
	initiateEmailChange: vi.fn()
}));

import { POST } from './+server';
import { initiateEmailChange } from '$lib/api/me';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/me/email/change', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/me/email/change', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('initiates email change with required fields', async () => {
		vi.mocked(initiateEmailChange).mockResolvedValue({ message: 'ok' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ new_email: 'a@b.c', current_password: 'pw' })) as any
		);
		expect(response.status).toBe(200);
		expect(initiateEmailChange).toHaveBeenCalledWith(
			{ new_email: 'a@b.c', current_password: 'pw' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not change email on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(initiateEmailChange).not.toHaveBeenCalled();
	});

	it('does not change email when new_email is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ current_password: 'pw' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(initiateEmailChange).not.toHaveBeenCalled();
	});
});
