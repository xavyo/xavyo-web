import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	calculateRoleMetrics: vi.fn()
}));

import { POST } from './+server';
import { calculateRoleMetrics } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/role-mining/metrics/calculate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/role-mining/metrics/calculate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calculates with known fields', async () => {
		vi.mocked(calculateRoleMetrics).mockResolvedValue({ roles_calculated: 1 } as any);
		const response = await POST(makeEvent(JSON.stringify({ role_ids: ['r1'] })) as any);
		expect(response.status).toBe(200);
		expect(calculateRoleMetrics).toHaveBeenCalled();
	});

	it('does not calculate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(calculateRoleMetrics).not.toHaveBeenCalled();
	});

	it('does not calculate when role_ids is not an array of strings', async () => {
		await expect(POST(makeEvent(JSON.stringify({ role_ids: [1] })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(calculateRoleMetrics).not.toHaveBeenCalled();
	});
});
