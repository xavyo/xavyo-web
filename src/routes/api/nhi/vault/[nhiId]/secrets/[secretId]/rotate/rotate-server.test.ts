import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-vault', () => ({
	rotateSecret: vi.fn()
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
import { rotateSecret } from '$lib/api/nhi-vault';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { nhiId: 'n1', secretId: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/n1/vault/secrets/s1/rotate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/:nhiId/vault/secrets/:secretId/rotate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('rotates a secret with required fields', async () => {
		vi.mocked(rotateSecret).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ value: 'new' })) as any);
		expect(response.status).toBe(200);
		expect(rotateSecret).toHaveBeenCalled();
	});

	it('does not rotate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(rotateSecret).not.toHaveBeenCalled();
	});

	it('does not rotate when value is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(rotateSecret).not.toHaveBeenCalled();
	});
});
