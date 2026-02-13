import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';
import {
	createNhiCertCampaignV2,
	listNhiCertCampaignsV2,
	getNhiCertCampaignV2,
	launchNhiCertCampaign,
	cancelNhiCertCampaignV2,
	getNhiCertCampaignSummary,
	listNhiCertCampaignItems,
	getNhiCertItem,
	decideNhiCertItem,
	bulkDecideNhiCertItems,
	getMyPendingCertItems
} from './nhi-cert-campaigns';

const mockApiClient = vi.mocked(apiClient);

describe('NHI Cert Campaigns API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createNhiCertCampaignV2', () => {
		it('calls POST /governance/nhis/certification/campaigns with body', async () => {
			const body = { name: 'Q1 Cert', scope: 'all' };
			const mockResult = { id: 'camp-1', name: 'Q1 Cert', status: 'draft' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await createNhiCertCampaignV2(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/campaigns', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('listNhiCertCampaignsV2', () => {
		it('calls GET /governance/nhis/certification/campaigns without params', async () => {
			const mockResult = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listNhiCertCampaignsV2({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/campaigns', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listNhiCertCampaignsV2({ status: 'active', limit: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=active');
			expect(calledPath).toContain('limit=20');
		});
	});

	describe('getNhiCertCampaignV2', () => {
		it('calls GET /governance/nhis/certification/campaigns/:id', async () => {
			const mockResult = { id: 'camp-1', name: 'Q1 Cert', status: 'active' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiCertCampaignV2('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/campaigns/camp-1', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result.id).toBe('camp-1');
		});
	});

	describe('launchNhiCertCampaign', () => {
		it('calls POST /governance/nhis/certification/campaigns/:id/launch', async () => {
			const mockResult = { id: 'camp-1', status: 'active' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await launchNhiCertCampaign('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/campaigns/camp-1/launch', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('cancelNhiCertCampaignV2', () => {
		it('calls POST /governance/nhis/certification/campaigns/:id/cancel', async () => {
			const mockResult = { id: 'camp-1', status: 'cancelled' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await cancelNhiCertCampaignV2('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/campaigns/camp-1/cancel', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('getNhiCertCampaignSummary', () => {
		it('calls GET /governance/nhis/certification/campaigns/:id/summary', async () => {
			const mockResult = { campaign_id: 'camp-1', total_items: 20, certified: 15, revoked: 3, pending: 2 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiCertCampaignSummary('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/campaigns/camp-1/summary', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('listNhiCertCampaignItems', () => {
		it('calls GET /governance/nhis/certification/campaigns/:id/items', async () => {
			const mockResult = { items: [{ id: 'item-1' }], total: 1 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listNhiCertCampaignItems('camp-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/campaigns/camp-1/items', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result.items).toHaveLength(1);
		});

		it('includes decision filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listNhiCertCampaignItems('camp-1', { decision: 'certify', limit: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('decision=certify');
			expect(calledPath).toContain('limit=10');
		});
	});

	describe('getNhiCertItem', () => {
		it('calls GET /governance/nhis/certification/items/:id', async () => {
			const mockResult = { id: 'item-1', campaign_id: 'camp-1', decision: null };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiCertItem('item-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/items/item-1', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result.id).toBe('item-1');
		});
	});

	describe('decideNhiCertItem', () => {
		it('calls POST /governance/nhis/certification/items/:id/decide with certify', async () => {
			const body = { decision: 'certify' as const, notes: '' };
			const mockResult = { id: 'item-1', decision: 'certify' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await decideNhiCertItem('item-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/items/item-1/decide', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('calls POST /governance/nhis/certification/items/:id/decide with revoke', async () => {
			const body = { decision: 'revoke' as const, notes: 'Security concern' };
			const mockResult = { id: 'item-1', decision: 'revoke' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await decideNhiCertItem('item-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/items/item-1/decide', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result.decision).toBe('revoke');
		});
	});

	describe('bulkDecideNhiCertItems', () => {
		it('calls POST /governance/nhis/certification/items/bulk-decide with body', async () => {
			const body = { item_ids: ['item-1', 'item-2'], decision: 'certify' as const, notes: '' };
			const mockResult = { processed: 2, failed: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await bulkDecideNhiCertItems(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/items/bulk-decide', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('getMyPendingCertItems', () => {
		it('calls GET /governance/nhis/certification/my-pending', async () => {
			const mockResult = { items: [{ id: 'item-1' }], total: 1 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getMyPendingCertItems({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/certification/my-pending', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result.items).toHaveLength(1);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await getMyPendingCertItems({ limit: 25, offset: 50 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=25');
			expect(calledPath).toContain('offset=50');
		});
	});
});
