import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/operations', () => ({
	resolveConflict: vi.fn()
}));

import { POST } from './+server';
import { resolveConflict } from '$lib/api/operations';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'cf-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/operations/conflicts/cf-1/resolve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/operations/conflicts/:id/resolve', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('resolves with a valid outcome', async () => {
		vi.mocked(resolveConflict).mockResolvedValue({ id: 'cf-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ outcome: 'applied' })) as any);
		expect(response.status).toBe(200);
		expect(resolveConflict).toHaveBeenCalledWith(
			'cf-1',
			{ outcome: 'applied', notes: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not resolve on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(resolveConflict).not.toHaveBeenCalled();
	});

	it('does not resolve when outcome is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(resolveConflict).not.toHaveBeenCalled();
	});
});
