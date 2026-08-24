import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	bulkAssignLicenses: vi.fn()
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
import { bulkAssignLicenses } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/assignments/bulk', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/licenses/assignments/bulk', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('bulk assigns with required fields', async () => {
		vi.mocked(bulkAssignLicenses).mockResolvedValue({ success_count: 2, failure_count: 0 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ license_pool_id: 'p1', user_ids: ['u1', 'u2'] })) as any
		);
		expect(response.status).toBe(200);
		expect(bulkAssignLicenses).toHaveBeenCalled();
	});

	it('does not assign on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(bulkAssignLicenses).not.toHaveBeenCalled();
	});

	it('does not assign when user_ids is empty', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ license_pool_id: 'p1', user_ids: [] })) as any
		);
		expect(response.status).toBe(400);
		expect(bulkAssignLicenses).not.toHaveBeenCalled();
	});
});
