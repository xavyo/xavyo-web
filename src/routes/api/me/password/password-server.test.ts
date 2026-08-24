import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/me', () => ({
	changePassword: vi.fn()
}));

import { PUT } from './+server';
import { changePassword } from '$lib/api/me';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/me/password', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/me/password', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('changes password with required fields', async () => {
		vi.mocked(changePassword).mockResolvedValue({ message: 'ok' } as any);
		const response = await PUT(
			makeEvent(JSON.stringify({ current_password: 'old', new_password: 'new' })) as any
		);
		expect(response.status).toBe(200);
		expect(changePassword).toHaveBeenCalledWith(
			{ current_password: 'old', new_password: 'new', revoke_other_sessions: false },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not change password on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(changePassword).not.toHaveBeenCalled();
	});

	it('does not change password when current_password is missing', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ new_password: 'new' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(changePassword).not.toHaveBeenCalled();
	});
});
