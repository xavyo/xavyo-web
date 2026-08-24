import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/mfa', () => ({
	listWebauthnCredentials: vi.fn(),
	updateWebauthnCredential: vi.fn(),
	deleteWebauthnCredential: vi.fn()
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

import { PATCH } from './+server';
import { updateWebauthnCredential } from '$lib/api/mfa';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string, id = 'c1') {
	return {
		url: new URL(`http://localhost/api/mfa/webauthn/credentials?id=${id}`),
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request(`http://localhost/api/mfa/webauthn/credentials?id=${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PATCH /api/mfa/webauthn/credentials', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renames a credential with required fields', async () => {
		vi.mocked(updateWebauthnCredential).mockResolvedValue({ message: 'ok' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ name: 'yubikey' })) as any);
		expect(response.status).toBe(200);
		expect(updateWebauthnCredential).toHaveBeenCalled();
	});

	it('does not rename on invalid JSON', async () => {
		const response = await PATCH(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(updateWebauthnCredential).not.toHaveBeenCalled();
	});

	it('does not rename when name is missing', async () => {
		const response = await PATCH(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(updateWebauthnCredential).not.toHaveBeenCalled();
	});
});
