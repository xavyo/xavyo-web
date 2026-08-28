import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi', () => ({
	listNhi: vi.fn()
}));

import { GET } from './+server';
import { listNhi } from '$lib/api/nhi';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listNhi).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('maps page/page_size onto limit/offset', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi?page=4&page_size=5')
		} as any);
		expect(listNhi).toHaveBeenCalledWith(
			{ offset: 15, limit: 5, nhi_type: undefined, lifecycle_state: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
