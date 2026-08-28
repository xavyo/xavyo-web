import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/governance-operations', () => ({
	processFailedOperationRetries: vi.fn()
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
import { processFailedOperationRetries } from '$lib/api/governance-operations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/governance/failed-operations/process-retries', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(processFailedOperationRetries).mockResolvedValue({ retried: 1 } as any);
		const response = await POST({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(processFailedOperationRetries).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});
});
