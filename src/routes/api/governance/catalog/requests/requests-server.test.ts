import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/catalog', () => ({
	listCatalogRequests: vi.fn()
}));

import { GET } from './+server';
import { listCatalogRequests } from '$lib/api/catalog';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/catalog/requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listCatalogRequests).mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 } as any);
	});

	it('forwards advertised status and submission_id filters', async () => {
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/catalog/requests?status=pending&submission_id=sub-1&limit=10&offset=2'
			)
		} as any);
		expect(response.status).toBe(200);
		expect(listCatalogRequests).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'pending',
				submission_id: 'sub-1',
				limit: 10,
				offset: 2
			}),
			TOKEN,
			TENANT,
			expect.anything()
		);
	});
});
