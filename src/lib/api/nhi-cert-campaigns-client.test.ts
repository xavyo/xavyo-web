import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('nhi-cert-campaigns-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- fetchNhiCertCampaignsV2 ---

	describe('fetchNhiCertCampaignsV2', () => {
		it('fetches from /api/nhi/certification/campaigns without params', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiCertCampaignsV2 } = await import('./nhi-cert-campaigns-client');

			const result = await fetchNhiCertCampaignsV2({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/campaigns');
			expect(result).toEqual(data);
		});

		it('includes status and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchNhiCertCampaignsV2 } = await import('./nhi-cert-campaigns-client');

			await fetchNhiCertCampaignsV2({ status: 'active', limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiCertCampaignsV2 } = await import('./nhi-cert-campaigns-client');

			await expect(fetchNhiCertCampaignsV2({}, mockFetch)).rejects.toThrow('Failed to fetch cert campaigns: 500');
		});
	});

	// --- fetchNhiCertCampaignV2 ---

	describe('fetchNhiCertCampaignV2', () => {
		it('fetches from /api/nhi/certification/campaigns/:id', async () => {
			const data = { id: 'camp-1', name: 'Q1 Review', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiCertCampaignV2 } = await import('./nhi-cert-campaigns-client');

			const result = await fetchNhiCertCampaignV2('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/campaigns/camp-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchNhiCertCampaignV2 } = await import('./nhi-cert-campaigns-client');

			await expect(fetchNhiCertCampaignV2('bad', mockFetch)).rejects.toThrow('Failed to fetch cert campaign: 404');
		});
	});

	// --- launchNhiCertCampaignClient ---

	describe('launchNhiCertCampaignClient', () => {
		it('sends POST to /api/nhi/certification/campaigns/:id/launch', async () => {
			const data = { id: 'camp-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { launchNhiCertCampaignClient } = await import('./nhi-cert-campaigns-client');

			const result = await launchNhiCertCampaignClient('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/campaigns/camp-1/launch', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { launchNhiCertCampaignClient } = await import('./nhi-cert-campaigns-client');

			await expect(launchNhiCertCampaignClient('camp-1', mockFetch)).rejects.toThrow('Failed to launch cert campaign: 409');
		});
	});

	// --- cancelNhiCertCampaignClient ---

	describe('cancelNhiCertCampaignClient', () => {
		it('sends POST to /api/nhi/certification/campaigns/:id/cancel', async () => {
			const data = { id: 'camp-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelNhiCertCampaignClient } = await import('./nhi-cert-campaigns-client');

			const result = await cancelNhiCertCampaignClient('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/campaigns/camp-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { cancelNhiCertCampaignClient } = await import('./nhi-cert-campaigns-client');

			await expect(cancelNhiCertCampaignClient('camp-1', mockFetch)).rejects.toThrow('Failed to cancel cert campaign: 400');
		});
	});

	// --- fetchNhiCertCampaignSummary ---

	describe('fetchNhiCertCampaignSummary', () => {
		it('fetches from /api/nhi/certification/campaigns/:id/summary', async () => {
			const data = { total_items: 25, certified: 10, revoked: 3, pending: 12 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiCertCampaignSummary } = await import('./nhi-cert-campaigns-client');

			const result = await fetchNhiCertCampaignSummary('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/campaigns/camp-1/summary');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiCertCampaignSummary } = await import('./nhi-cert-campaigns-client');

			await expect(fetchNhiCertCampaignSummary('camp-1', mockFetch)).rejects.toThrow('Failed to fetch campaign summary: 500');
		});
	});

	// --- fetchNhiCertCampaignItems ---

	describe('fetchNhiCertCampaignItems', () => {
		it('fetches from /api/nhi/certification/campaigns/:id/items without params', async () => {
			const data = { items: [{ id: 'item-1' }], total: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiCertCampaignItems } = await import('./nhi-cert-campaigns-client');

			const result = await fetchNhiCertCampaignItems('camp-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/campaigns/camp-1/items');
			expect(result).toEqual(data);
		});

		it('includes decision filter and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchNhiCertCampaignItems } = await import('./nhi-cert-campaigns-client');

			await fetchNhiCertCampaignItems('camp-1', { decision: 'certified', limit: 5, offset: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('decision=certified');
			expect(calledUrl).toContain('limit=5');
			expect(calledUrl).toContain('offset=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiCertCampaignItems } = await import('./nhi-cert-campaigns-client');

			await expect(fetchNhiCertCampaignItems('camp-1', {}, mockFetch)).rejects.toThrow('Failed to fetch campaign items: 500');
		});
	});

	// --- decideNhiCertItemClient ---

	describe('decideNhiCertItemClient', () => {
		it('sends POST to /api/nhi/certification/items/:id/decide', async () => {
			const body = { decision: 'certify', comment: 'Approved' };
			const data = { id: 'item-1', decision: 'certify' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { decideNhiCertItemClient } = await import('./nhi-cert-campaigns-client');

			const result = await decideNhiCertItemClient('item-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/items/item-1/decide', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { decideNhiCertItemClient } = await import('./nhi-cert-campaigns-client');

			await expect(decideNhiCertItemClient('item-1', {} as any, mockFetch)).rejects.toThrow('Failed to decide cert item: 400');
		});
	});

	// --- bulkDecideNhiCertItemsClient ---

	describe('bulkDecideNhiCertItemsClient', () => {
		it('sends POST to /api/nhi/certification/items/bulk-decide', async () => {
			const body = { item_ids: ['item-1', 'item-2'], decision: 'certify' };
			const data = { succeeded: 2, failed: 0, errors: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { bulkDecideNhiCertItemsClient } = await import('./nhi-cert-campaigns-client');

			const result = await bulkDecideNhiCertItemsClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/items/bulk-decide', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { bulkDecideNhiCertItemsClient } = await import('./nhi-cert-campaigns-client');

			await expect(bulkDecideNhiCertItemsClient({} as any, mockFetch)).rejects.toThrow('Failed to bulk decide cert items: 500');
		});
	});

	// --- fetchMyPendingCertItems ---

	describe('fetchMyPendingCertItems', () => {
		it('fetches from /api/nhi/certification/my-pending without params', async () => {
			const data = { items: [{ id: 'item-1' }], total: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMyPendingCertItems } = await import('./nhi-cert-campaigns-client');

			const result = await fetchMyPendingCertItems({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/certification/my-pending');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchMyPendingCertItems } = await import('./nhi-cert-campaigns-client');

			await fetchMyPendingCertItems({ limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { fetchMyPendingCertItems } = await import('./nhi-cert-campaigns-client');

			await expect(fetchMyPendingCertItems({}, mockFetch)).rejects.toThrow('Failed to fetch my pending cert items: 403');
		});
	});
});
