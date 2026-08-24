import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/my-approvals', () => ({
	rejectApproval: vi.fn()
}));

import { POST } from './+server';
import { rejectApproval } from '$lib/api/my-approvals';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'a1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/my-approvals/a1/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/my-approvals/:id/reject', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects with a required comment', async () => {
		vi.mocked(rejectApproval).mockResolvedValue({ id: 'a1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ comment: 'no' })) as any);
		expect(response.status).toBe(200);
		expect(rejectApproval).toHaveBeenCalled();
	});

	it('does not reject on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(rejectApproval).not.toHaveBeenCalled();
	});

	it('does not reject when comment is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(rejectApproval).not.toHaveBeenCalled();
	});
});
