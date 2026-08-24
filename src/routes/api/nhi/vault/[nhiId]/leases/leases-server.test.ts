import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-vault', () => ({
	listLeases: vi.fn(),
	createLease: vi.fn()
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
import { createLease } from '$lib/api/nhi-vault';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { nhiId: 'n1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/n1/vault/leases', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/:nhiId/vault/leases', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a lease with required fields', async () => {
		vi.mocked(createLease).mockResolvedValue({ id: 'l1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ secret_id: 's1', lessee_nhi_id: 'n2' })) as any
		);
		expect(response.status).toBe(200);
		expect(createLease).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createLease).not.toHaveBeenCalled();
	});

	it('does not create when secret_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ lessee_nhi_id: 'n2' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(createLease).not.toHaveBeenCalled();
	});
});
