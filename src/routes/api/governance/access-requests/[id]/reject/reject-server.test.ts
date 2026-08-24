import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/access-requests', () => ({
	rejectAccessRequest: vi.fn()
}));

import { POST } from './+server';
import { rejectAccessRequest } from '$lib/api/access-requests';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'ar-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/access-requests/ar-1/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/access-requests/:id/reject', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects with comments', async () => {
		vi.mocked(rejectAccessRequest).mockResolvedValue({ id: 'ar-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ comments: 'no' })) as any);
		expect(response.status).toBe(200);
		expect(rejectAccessRequest).toHaveBeenCalledWith(
			'ar-1',
			{ comments: 'no' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not reject on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(rejectAccessRequest).not.toHaveBeenCalled();
	});

	it('does not reject when comments are missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(rejectAccessRequest).not.toHaveBeenCalled();
	});
});
