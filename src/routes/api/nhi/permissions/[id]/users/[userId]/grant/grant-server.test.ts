import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-permissions', () => ({
	grantUserPermission: vi.fn()
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
import { grantUserPermission } from '$lib/api/nhi-permissions';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'nhi-1', userId: 'user-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/permissions/nhi-1/users/user-1/grant', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/permissions/:id/users/:userId/grant', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('grants with the requested permission_type', async () => {
		vi.mocked(grantUserPermission).mockResolvedValue({ id: 'perm-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ permission_type: 'admin' })) as any);
		expect(response.status).toBe(201);
		expect(grantUserPermission).toHaveBeenCalledWith(
			'nhi-1',
			'user-1',
			{ permission_type: 'admin', expires_at: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not grant on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(grantUserPermission).not.toHaveBeenCalled();
	});

	it('forwards advertised expires_at', async () => {
		vi.mocked(grantUserPermission).mockResolvedValue({ id: 'perm-1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ permission_type: 'admin', expires_at: '2026-12-01T00:00:00Z' })) as any
		);
		expect(response.status).toBe(201);
		expect(grantUserPermission).toHaveBeenCalledWith(
			'nhi-1',
			'user-1',
			{ permission_type: 'admin', expires_at: '2026-12-01T00:00:00Z' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not grant when expires_at is not a string', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ permission_type: 'admin', expires_at: 123 })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(grantUserPermission).not.toHaveBeenCalled();
	});

	it('does not grant when permission_type is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(grantUserPermission).not.toHaveBeenCalled();
	});
});
