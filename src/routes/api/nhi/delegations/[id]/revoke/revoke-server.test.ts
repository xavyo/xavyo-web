import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-delegations', () => ({
	revokeDelegationGrant: vi.fn()
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
import { revokeDelegationGrant } from '$lib/api/nhi-delegations';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'del-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/delegations/del-1/revoke', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/delegations/:id/revoke', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('revokes with a valid body', async () => {
		vi.mocked(revokeDelegationGrant).mockResolvedValue({ id: 'del-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ revoked_by: 'admin-1' })) as any);
		expect(response.status).toBe(200);
		expect(revokeDelegationGrant).toHaveBeenCalledWith(
			'del-1',
			{ revoked_by: 'admin-1' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not revoke on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(revokeDelegationGrant).not.toHaveBeenCalled();
	});
});
