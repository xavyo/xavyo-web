import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	bulkReclaimLicenses: vi.fn()
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
import { bulkReclaimLicenses } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/assignments/bulk-reclaim', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/licenses/assignments/bulk-reclaim', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('bulk reclaims with required fields', async () => {
		vi.mocked(bulkReclaimLicenses).mockResolvedValue({ success_count: 1, failure_count: 0 } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					license_pool_id: 'p1',
					assignment_ids: ['a1'],
					reason: 'offboarding'
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(bulkReclaimLicenses).toHaveBeenCalled();
	});

	it('does not reclaim on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(bulkReclaimLicenses).not.toHaveBeenCalled();
	});

	it('does not reclaim when reason is missing', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ license_pool_id: 'p1', assignment_ids: ['a1'] })) as any
		);
		expect(response.status).toBe(400);
		expect(bulkReclaimLicenses).not.toHaveBeenCalled();
	});
});
