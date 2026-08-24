import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	simulateAllPolicies: vi.fn()
}));

import { POST } from './+server';
import { simulateAllPolicies } from '$lib/api/birthright';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/birthright-policies/simulate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/birthright-policies/simulate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('simulates with required fields', async () => {
		vi.mocked(simulateAllPolicies).mockResolvedValue({ matching_policies: [] } as any);
		const response = await POST(makeEvent(JSON.stringify({ attributes: { dept: 'eng' } })) as any);
		expect(response.status).toBe(200);
		expect(simulateAllPolicies).toHaveBeenCalled();
	});

	it('does not simulate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(simulateAllPolicies).not.toHaveBeenCalled();
	});

	it('does not simulate when attributes is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(simulateAllPolicies).not.toHaveBeenCalled();
	});
});
