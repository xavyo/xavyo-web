import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-requests', () => ({
	approveNhiRequest: vi.fn()
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
import { approveNhiRequest } from '$lib/api/nhi-requests';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'req-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/requests/req-1/approve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/requests/:id/approve', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('approves with a valid body', async () => {
		vi.mocked(approveNhiRequest).mockResolvedValue({ id: 'req-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ comments: 'ok' })) as any);
		expect(response.status).toBe(200);
		expect(approveNhiRequest).toHaveBeenCalledWith(
			'req-1',
			{ comments: 'ok' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not approve on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(approveNhiRequest).not.toHaveBeenCalled();
	});
});
