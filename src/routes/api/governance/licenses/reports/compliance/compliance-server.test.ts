import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	generateComplianceReport: vi.fn()
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
import { generateComplianceReport } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string | undefined) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/reports/compliance', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: body ?? ''
		})
	};
}

describe('POST /api/governance/licenses/reports/compliance', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('generates a report from valid JSON', async () => {
		vi.mocked(generateComplianceReport).mockResolvedValue({
			generated_at: 'now',
			pools: [],
			summary: {
				total_pools_reviewed: 0,
				compliant_pools: 0,
				non_compliant_pools: 0,
				total_capacity: 0,
				total_allocated: 0,
				overall_utilization: 0
			}
		} as any);
		const response = await POST(makeEvent(JSON.stringify({ pool_ids: ['p1'] })) as any);
		expect(response.status).toBe(200);
		expect(generateComplianceReport).toHaveBeenCalledWith(
			{ pool_ids: ['p1'] },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not generate on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(generateComplianceReport).not.toHaveBeenCalled();
	});
});
