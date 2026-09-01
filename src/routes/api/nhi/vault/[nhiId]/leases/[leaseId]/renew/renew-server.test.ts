import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-vault', () => ({
	renewLease: vi.fn()
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
import { renewLease } from '$lib/api/nhi-vault';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { nhiId: 'n1', leaseId: 'l1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/n1/vault/leases/l1/renew', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/:nhiId/vault/leases/:leaseId/renew', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('renews a lease with required fields', async () => {
		vi.mocked(renewLease).mockResolvedValue({ id: 'l1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ extend_secs: 60 })) as any);
		expect(response.status).toBe(200);
		expect(renewLease).toHaveBeenCalled();
	});

	it('does not renew on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(renewLease).not.toHaveBeenCalled();
	});

	it('does not renew when extend_secs is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(renewLease).not.toHaveBeenCalled();
	});

	it('rejects NaN extend_secs instead of forwarding it', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ extend_secs: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(renewLease).not.toHaveBeenCalled();
	});
});
