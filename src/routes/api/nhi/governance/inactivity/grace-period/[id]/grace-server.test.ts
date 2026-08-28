import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	grantGracePeriod: vi.fn()
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
import { grantGracePeriod } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'n1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/governance/inactivity/grace-period/n1', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/governance/inactivity/grace-period/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('grants a grace period with required fields', async () => {
		vi.mocked(grantGracePeriod).mockResolvedValue(undefined as any);
		const response = await POST(makeEvent(JSON.stringify({ grace_days: 14 })) as any);
		expect(response.status).toBe(204);
		expect(grantGracePeriod).toHaveBeenCalledWith('n1', 14, TOKEN, TENANT, expect.any(Function));
	});

	it('does not grant on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(grantGracePeriod).not.toHaveBeenCalled();
	});

	it('does not grant when grace_days is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(grantGracePeriod).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(grantGracePeriod).mockResolvedValue(undefined as any);
		const response = await POST(makeEvent(JSON.stringify({ grace_days: 14 })) as any);
		expect(response.status).toBe(204);
		expect(grantGracePeriod).toHaveBeenCalled();
	});
});
