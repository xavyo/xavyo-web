import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	listNhiCertCampaignItems: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { GET } from './+server';
import { listNhiCertCampaignItems } from '$lib/api/nhi-cert-campaigns';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/certification/campaigns/:id/items', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(listNhiCertCampaignItems).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			params: { campaignId: 'camp-1' },
			url: new URL('http://localhost/api/nhi/certification/campaigns/camp-1/items')
		} as any);
		expect(response.status).toBe(200);
		expect(listNhiCertCampaignItems).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listNhiCertCampaignItems).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			params: { campaignId: 'camp-1' },
			url: new URL(
				'http://localhost/api/nhi/certification/campaigns/camp-1/items?page=3&page_size=4'
			)
		} as any);
		expect(listNhiCertCampaignItems).toHaveBeenCalledWith(
			'camp-1',
			{
				decision: undefined,
				status: undefined,
				reviewer_id: undefined,
				owner_id: undefined,
				my_pending: undefined,
				limit: 4,
				offset: 8
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised status, reviewer_id, owner_id, and my_pending filters', async () => {
		vi.mocked(listNhiCertCampaignItems).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			params: { campaignId: 'camp-1' },
			url: new URL(
				'http://localhost/api/nhi/certification/campaigns/camp-1/items?status=pending&reviewer_id=u1&owner_id=u2&my_pending=true'
			)
		} as any);
		expect(listNhiCertCampaignItems).toHaveBeenCalledWith(
			'camp-1',
			expect.objectContaining({
				status: 'pending',
				reviewer_id: 'u1',
				owner_id: 'u2',
				my_pending: true
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
