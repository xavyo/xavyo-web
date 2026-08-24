import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/my-approvals', () => ({
	approveApproval: vi.fn()
}));

import { POST } from './+server';
import { approveApproval } from '$lib/api/my-approvals';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'a1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/my-approvals/a1/approve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/my-approvals/:id/approve', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('approves with an optional comment', async () => {
		vi.mocked(approveApproval).mockResolvedValue({ id: 'a1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ comment: 'ok' })) as any);
		expect(response.status).toBe(200);
		expect(approveApproval).toHaveBeenCalled();
	});

	it('does not approve on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(approveApproval).not.toHaveBeenCalled();
	});

	it('does not approve when comment is not a string', async () => {
		await expect(POST(makeEvent(JSON.stringify({ comment: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(approveApproval).not.toHaveBeenCalled();
	});
});
