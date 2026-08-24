import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	bulkDecideNhiCertItems: vi.fn()
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
import { bulkDecideNhiCertItems } from '$lib/api/nhi-cert-campaigns';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/certification/items/bulk-decide', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/certification/items/bulk-decide', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('bulk-decides with valid item_ids and decision', async () => {
		vi.mocked(bulkDecideNhiCertItems).mockResolvedValue({ decided: 1, failed: 0 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ item_ids: ['i1'], decision: 'revoke' })) as any
		);
		expect(response.status).toBe(200);
		expect(bulkDecideNhiCertItems).toHaveBeenCalledWith(
			{ item_ids: ['i1'], decision: 'revoke', notes: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not decide on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(bulkDecideNhiCertItems).not.toHaveBeenCalled();
	});

	it('does not decide when item_ids is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({ decision: 'certify' })) as any);
		expect(response.status).toBe(400);
		expect(bulkDecideNhiCertItems).not.toHaveBeenCalled();
	});
});
