import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	dismissCandidate: vi.fn()
}));

import { POST } from './+server';
import { dismissCandidate } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { candidateId: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/role-mining/candidates/c1/dismiss',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/governance/role-mining/candidates/:candidateId/dismiss', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('dismisses with known fields', async () => {
		vi.mocked(dismissCandidate).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'dup' })) as any);
		expect(response.status).toBe(200);
		expect(dismissCandidate).toHaveBeenCalled();
	});

	it('does not dismiss on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(dismissCandidate).not.toHaveBeenCalled();
	});

	it('does not dismiss when reason is not a string', async () => {
		await expect(POST(makeEvent(JSON.stringify({ reason: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(dismissCandidate).not.toHaveBeenCalled();
	});
});
