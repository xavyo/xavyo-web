import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/personas', () => ({
	listPersonas: vi.fn()
}));

import { GET } from './+server';
import { listPersonas } from '$lib/api/personas';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/personas', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listPersonas).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('maps page/page_size onto limit/offset', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/personas?page=2&page_size=25')
		} as any);
		expect(listPersonas).toHaveBeenCalledWith(
			{
				offset: 25,
				limit: 25,
				status: undefined,
				archetype_id: undefined,
				physical_user_id: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised physical_user_id filter', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/personas?physical_user_id=user-1')
		} as any);
		expect(listPersonas).toHaveBeenCalledWith(
			expect.objectContaining({ physical_user_id: 'user-1' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
