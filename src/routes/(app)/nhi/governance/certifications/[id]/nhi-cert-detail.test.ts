import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/api/nhi-governance', () => ({
	getNhiCertCampaign: vi.fn(),
	listNhiCertCampaignItems: vi.fn()
}));
vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(s: number, m: string) {
			super(m);
			this.status = s;
		}
	}
}));
vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { getNhiCertCampaign, listNhiCertCampaignItems } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('NHI Certification Campaign detail +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				params: { id: 'camp-1' },
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
		}
	});

	it('returns campaign and campaignItems when found', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const campaign = {
			id: 'camp-1',
			name: 'Q1 Cert',
			status: 'active',
			scope: 'all',
			nhi_type_filter: null
		};
		const items = [
			{ id: 'item-1', campaign_id: 'camp-1', nhi_id: 'nhi-1', nhi_name: 'Tool A', nhi_type: 'tool', decision: null }
		];
		vi.mocked(getNhiCertCampaign).mockResolvedValue(campaign as any);
		vi.mocked(listNhiCertCampaignItems).mockResolvedValue({ items, total: 1 } as any);

		const result: any = await load({
			params: { id: 'camp-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		expect(result.campaign).toEqual(campaign);
		expect(result.campaignItems).toHaveLength(1);
	});

	it('throws error when campaign not found', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(getNhiCertCampaign).mockRejectedValue(new Error('Not found'));

		try {
			await load({
				params: { id: 'nonexistent' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should throw');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('handles items fetch failure gracefully', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const campaign = {
			id: 'camp-2',
			name: 'Agent Cert',
			status: 'active',
			scope: 'by_type',
			nhi_type_filter: 'agent'
		};
		vi.mocked(getNhiCertCampaign).mockResolvedValue(campaign as any);
		vi.mocked(listNhiCertCampaignItems).mockRejectedValue(new Error('Items fetch failed'));

		const result: any = await load({
			params: { id: 'camp-2' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		expect(result.campaign).toEqual(campaign);
		expect(result.campaignItems).toEqual([]);
	});
});
