import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/catalog', () => ({
	listCatalogItems: vi.fn()
}));

import { GET } from './+server';
import { listCatalogItems } from '$lib/api/catalog';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/governance/catalog/items', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised enabled', async () => {
		vi.mocked(listCatalogItems).mockResolvedValue({
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);
		await GET(
			makeEvent('http://localhost/api/governance/catalog/items?enabled=false') as any
		);
		expect(listCatalogItems).toHaveBeenCalledWith(
			expect.objectContaining({ enabled: false }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
