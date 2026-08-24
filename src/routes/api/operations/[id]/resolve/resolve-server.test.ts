import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/operations', () => ({
	resolveOperation: vi.fn()
}));

import { POST } from './+server';
import { resolveOperation } from '$lib/api/operations';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'op-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/operations/op-1/resolve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/operations/:id/resolve', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('resolves with valid JSON', async () => {
		vi.mocked(resolveOperation).mockResolvedValue({ id: 'op-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ resolution_notes: 'done' })) as any);
		expect(response.status).toBe(200);
		expect(resolveOperation).toHaveBeenCalledWith(
			'op-1',
			{ resolution_notes: 'done' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not resolve on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(resolveOperation).not.toHaveBeenCalled();
	});
});
