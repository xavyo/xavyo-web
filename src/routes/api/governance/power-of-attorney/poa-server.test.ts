import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/power-of-attorney', () => ({
	listPoa: vi.fn(),
	grantPoa: vi.fn()
}));

import { POST } from './+server';
import { grantPoa } from '$lib/api/power-of-attorney';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/power-of-attorney', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/power-of-attorney', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('grants with required fields', async () => {
		vi.mocked(grantPoa).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					attorney_id: 'u2',
					starts_at: '2026-01-01',
					ends_at: '2026-02-01'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(grantPoa).toHaveBeenCalled();
	});

	it('does not grant on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(grantPoa).not.toHaveBeenCalled();
	});

	it('does not grant when attorney_id is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ starts_at: '2026-01-01', ends_at: '2026-02-01' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(grantPoa).not.toHaveBeenCalled();
	});
});
