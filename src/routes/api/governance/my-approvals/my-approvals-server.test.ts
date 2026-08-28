import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/my-approvals', () => ({
	listMyApprovals: vi.fn()
}));

import { GET } from './+server';
import { listMyApprovals } from '$lib/api/my-approvals';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/my-approvals', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listMyApprovals).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/my-approvals?page=3&page_size=8')
		} as any);
		expect(response.status).toBe(200);
		expect(listMyApprovals).toHaveBeenCalledWith(
			{ status: undefined, limit: 8, offset: 16 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
