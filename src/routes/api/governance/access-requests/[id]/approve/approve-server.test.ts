import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/access-requests', () => ({
	approveAccessRequest: vi.fn()
}));

import { POST } from './+server';
import { approveAccessRequest } from '$lib/api/access-requests';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		params: { id: 'ar-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/access-requests/ar-1/approve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/access-requests/:id/approve', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('approves with valid JSON', async () => {
		vi.mocked(approveAccessRequest).mockResolvedValue({ id: 'ar-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ comments: 'ok' })) as any);
		expect(response.status).toBe(200);
		expect(approveAccessRequest).toHaveBeenCalledWith(
			'ar-1',
			{ comments: 'ok' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not approve on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(approveAccessRequest).not.toHaveBeenCalled();
	});
});
