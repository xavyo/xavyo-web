import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	reviewExcessivePrivilege: vi.fn()
}));

import { POST } from './+server';
import { reviewExcessivePrivilege } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { flagId: 'f1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/role-mining/excessive-privileges/f1/review',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/governance/role-mining/excessive-privileges/:flagId/review', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('reviews with required fields', async () => {
		vi.mocked(reviewExcessivePrivilege).mockResolvedValue({ id: 'f1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ action: 'accept' })) as any);
		expect(response.status).toBe(200);
		expect(reviewExcessivePrivilege).toHaveBeenCalled();
	});

	it('does not review on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(reviewExcessivePrivilege).not.toHaveBeenCalled();
	});

	it('does not review when action is invalid', async () => {
		await expect(POST(makeEvent(JSON.stringify({ action: 'other' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(reviewExcessivePrivilege).not.toHaveBeenCalled();
	});
});
