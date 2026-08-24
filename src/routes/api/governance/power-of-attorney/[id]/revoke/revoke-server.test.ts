import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/power-of-attorney', () => ({
	revokePoa: vi.fn()
}));

import { POST } from './+server';
import { revokePoa } from '$lib/api/power-of-attorney';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/power-of-attorney/p1/revoke', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/power-of-attorney/:id/revoke', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('revokes with known fields', async () => {
		vi.mocked(revokePoa).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'done' })) as any);
		expect(response.status).toBe(200);
		expect(revokePoa).toHaveBeenCalled();
	});

	it('does not revoke on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(revokePoa).not.toHaveBeenCalled();
	});

	it('does not revoke when reason is not a string', async () => {
		await expect(POST(makeEvent(JSON.stringify({ reason: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(revokePoa).not.toHaveBeenCalled();
	});
});
