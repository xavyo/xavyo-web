import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/power-of-attorney', () => ({
	extendPoa: vi.fn()
}));

import { POST } from './+server';
import { extendPoa } from '$lib/api/power-of-attorney';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/power-of-attorney/p1/extend', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/power-of-attorney/:id/extend', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('extends with required fields', async () => {
		vi.mocked(extendPoa).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ new_ends_at: '2026-03-01' })) as any);
		expect(response.status).toBe(200);
		expect(extendPoa).toHaveBeenCalled();
	});

	it('does not extend on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(extendPoa).not.toHaveBeenCalled();
	});

	it('does not extend when new_ends_at is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(extendPoa).not.toHaveBeenCalled();
	});
});
