import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-requests', () => ({
	listNhiRequests: vi.fn(),
	submitNhiRequest: vi.fn()
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

import { GET, POST } from './+server';
import { listNhiRequests, submitNhiRequest } from '$lib/api/nhi-requests';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/requests', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/nhi/requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listNhiRequests).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('maps page/page_size onto limit/offset', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/requests?page=2&page_size=10')
		} as any);
		expect(listNhiRequests).toHaveBeenCalledWith(
			{ status: undefined, requester_id: undefined, pending_only: undefined, limit: 10, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/nhi/requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('submits a request with required fields', async () => {
		vi.mocked(submitNhiRequest).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'bot', purpose: 'ci' })) as any);
		expect(response.status).toBe(201);
		expect(submitNhiRequest).toHaveBeenCalled();
	});

	it('does not submit on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(submitNhiRequest).not.toHaveBeenCalled();
	});

	it('does not submit when name is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({ purpose: 'ci' })) as any);
		expect(response.status).toBe(400);
		expect(submitNhiRequest).not.toHaveBeenCalled();
	});

	it('maps rotation_interval_days onto requested_rotation_days', async () => {
		vi.mocked(submitNhiRequest).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'bot',
					purpose: 'ci pipeline bot',
					rotation_interval_days: 30
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(submitNhiRequest).toHaveBeenCalledWith(
			{ name: 'bot', purpose: 'ci pipeline bot', requested_rotation_days: 30 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
