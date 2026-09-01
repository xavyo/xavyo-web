import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	listCampaignItems: vi.fn()
}));

import { GET } from './+server';
import { listCampaignItems } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/certification-campaigns/:id/items', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listCampaignItems).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('forwards advertised status and reviewer_id filters', async () => {
		await GET({
			params: { id: 'camp-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/certification-campaigns/camp-1/items?status=pending&reviewer_id=u1'
			)
		} as any);
		expect(listCampaignItems).toHaveBeenCalledWith(
			'camp-1',
			expect.objectContaining({ status: 'pending', reviewer_id: 'u1' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
