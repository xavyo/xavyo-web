import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	promoteCandidate: vi.fn()
}));

import { POST } from './+server';
import { promoteCandidate } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { candidateId: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/role-mining/candidates/c1/promote',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/governance/role-mining/candidates/:candidateId/promote', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('promotes with known fields', async () => {
		vi.mocked(promoteCandidate).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ role_name: 'Admin' })) as any);
		expect(response.status).toBe(200);
		expect(promoteCandidate).toHaveBeenCalled();
	});

	it('does not promote on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(promoteCandidate).not.toHaveBeenCalled();
	});

	it('does not promote when role_name is not a string', async () => {
		await expect(POST(makeEvent(JSON.stringify({ role_name: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(promoteCandidate).not.toHaveBeenCalled();
	});
});
