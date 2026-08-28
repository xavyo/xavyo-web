import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	listSodExemptions: vi.fn(),
	createSodExemption: vi.fn()
}));

import { GET, POST } from './+server';
import { createSodExemption, listSodExemptions } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/sod-exemptions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/sod-exemptions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listSodExemptions).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/sod-exemptions?page=3&page_size=5')
		} as any);
		expect(listSodExemptions).toHaveBeenCalledWith(
			{ status: undefined, limit: 5, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/sod-exemptions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates an exemption with required fields', async () => {
		vi.mocked(createSodExemption).mockResolvedValue({ id: 'x1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					rule_id: 'r1',
					user_id: 'u1',
					justification: 'need',
					expires_at: '2026-01-01'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSodExemption).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createSodExemption).not.toHaveBeenCalled();
	});

	it('does not create when justification is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ rule_id: 'r1', user_id: 'u1' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createSodExemption).not.toHaveBeenCalled();
	});
});
