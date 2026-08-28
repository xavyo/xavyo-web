import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-vault', () => ({
	revokeLease: vi.fn()
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

import { DELETE } from './+server';
import { revokeLease } from '$lib/api/nhi-vault';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('DELETE /api/nhi/:nhiId/vault/leases/:leaseId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(revokeLease).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { nhiId: 'n1', leaseId: 'l1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(revokeLease).toHaveBeenCalledWith('n1', 'l1', TOKEN, TENANT, expect.any(Function));
	});
});
