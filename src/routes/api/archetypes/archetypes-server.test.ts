import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/personas', () => ({
	listArchetypes: vi.fn()
}));

import { GET } from './+server';
import { listArchetypes } from '$lib/api/personas';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/archetypes', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listArchetypes).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/archetypes?page=2&page_size=15')
		} as any);
		expect(response.status).toBe(200);
		expect(listArchetypes).toHaveBeenCalledWith(
			{ name_contains: undefined, is_active: undefined, limit: 15, offset: 15 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
