import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-permissions', () => ({
	revokeUserPermission: vi.fn()
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
import { revokeUserPermission } from '$lib/api/nhi-permissions';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'nhi-1', userId: 'user-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/permissions/nhi-1/users/user-1/revoke', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/permissions/:id/users/:userId/revoke', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('revokes the requested permission_type', async () => {
		vi.mocked(revokeUserPermission).mockResolvedValue({ revoked: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ permission_type: 'admin' })) as any);
		expect(response.status).toBe(200);
		expect(revokeUserPermission).toHaveBeenCalledWith(
			'nhi-1',
			'user-1',
			{ permission_type: 'admin' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not revoke on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(revokeUserPermission).not.toHaveBeenCalled();
	});

	it('does not revoke when permission_type is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(revokeUserPermission).not.toHaveBeenCalled();
	});
});
