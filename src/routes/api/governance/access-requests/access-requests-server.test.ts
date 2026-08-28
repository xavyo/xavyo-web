import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/access-requests', () => ({
	listAccessRequests: vi.fn(),
	createAccessRequest: vi.fn()
}));

import { GET } from './+server';
import { listAccessRequests } from '$lib/api/access-requests';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/access-requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listAccessRequests).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('maps page/page_size onto limit/offset', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/access-requests?page=3&page_size=10')
		} as any);
		expect(listAccessRequests).toHaveBeenCalledWith(
			{ status: undefined, entitlement_id: undefined, limit: 10, offset: 20 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
