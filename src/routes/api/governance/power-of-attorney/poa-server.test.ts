import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/power-of-attorney', () => ({
	listPoa: vi.fn(),
	grantPoa: vi.fn()
}));

import { GET, POST } from './+server';
import { grantPoa, listPoa } from '$lib/api/power-of-attorney';

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

describe('GET /api/governance/power-of-attorney', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listPoa).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/power-of-attorney?page=2&page_size=8')
		} as any);
		expect(response.status).toBe(200);
		expect(listPoa).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 8, offset: 8 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised active_now filter', async () => {
		vi.mocked(listPoa).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/power-of-attorney?direction=incoming&active_now=true'
			)
		} as any);
		expect(response.status).toBe(200);
		expect(listPoa).toHaveBeenCalledWith(
			expect.objectContaining({ direction: 'incoming', active_now: true }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

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
