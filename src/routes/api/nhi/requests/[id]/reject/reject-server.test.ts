import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-requests', () => ({
	rejectNhiRequest: vi.fn()
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
import { rejectNhiRequest } from '$lib/api/nhi-requests';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string, roles: string[] = ['admin']) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles } },
		params: { id: 'req-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/requests/req-1/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/requests/:id/reject', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects with a reason', async () => {
		vi.mocked(rejectNhiRequest).mockResolvedValue({ id: 'req-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'nope' })) as any);
		expect(response.status).toBe(200);
		expect(rejectNhiRequest).toHaveBeenCalledWith(
			'req-1',
			{ reason: 'nope' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(rejectNhiRequest).mockResolvedValue({ id: 'req-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'nope' }), ['user']) as any);
		expect(response.status).toBe(200);
		expect(rejectNhiRequest).toHaveBeenCalled();
	});

	it('does not reject on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(rejectNhiRequest).not.toHaveBeenCalled();
	});

	it('does not reject when reason is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(rejectNhiRequest).not.toHaveBeenCalled();
	});
});
