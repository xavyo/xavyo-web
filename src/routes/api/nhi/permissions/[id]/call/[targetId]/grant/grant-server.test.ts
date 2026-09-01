import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-permissions', () => ({
	grantNhiPermission: vi.fn()
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
import { grantNhiPermission } from '$lib/api/nhi-permissions';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'nhi-1', targetId: 'nhi-2' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/permissions/nhi-1/call/nhi-2/grant', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/permissions/:id/call/:targetId/grant', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('grants with the requested permission_type', async () => {
		vi.mocked(grantNhiPermission).mockResolvedValue({ id: 'perm-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ permission_type: 'call' })) as any);
		expect(response.status).toBe(201);
		expect(grantNhiPermission).toHaveBeenCalledWith(
			'nhi-1',
			'nhi-2',
			{
				permission_type: 'call',
				allowed_actions: undefined,
				max_calls_per_hour: undefined,
				expires_at: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not grant on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(grantNhiPermission).not.toHaveBeenCalled();
	});

	it('does not grant when permission_type is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(grantNhiPermission).not.toHaveBeenCalled();
	});

	it('rejects NaN max_calls_per_hour instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(JSON.stringify({ permission_type: 'call', max_calls_per_hour: Number.NaN })) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(grantNhiPermission).not.toHaveBeenCalled();
	});
});
