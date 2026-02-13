import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('nhi-usage-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- fetchNhiUsageHistory ---

	describe('fetchNhiUsageHistory', () => {
		it('fetches from /api/nhi/usage/:nhiId without params', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiUsageHistory } = await import('./nhi-usage-client');

			const result = await fetchNhiUsageHistory('nhi-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/usage/nhi-1');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchNhiUsageHistory } = await import('./nhi-usage-client');

			await fetchNhiUsageHistory('nhi-1', { limit: 20, offset: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=20');
			expect(calledUrl).toContain('offset=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchNhiUsageHistory } = await import('./nhi-usage-client');

			await expect(fetchNhiUsageHistory('bad', {}, mockFetch)).rejects.toThrow('Failed to fetch NHI usage history: 404');
		});
	});

	// --- fetchNhiUsageSummary ---

	describe('fetchNhiUsageSummary', () => {
		it('fetches from /api/nhi/usage/:nhiId/summary', async () => {
			const data = { total_requests: 100, last_used_at: '2026-01-15' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiUsageSummary } = await import('./nhi-usage-client');

			const result = await fetchNhiUsageSummary('nhi-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/usage/nhi-1/summary');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiUsageSummary } = await import('./nhi-usage-client');

			await expect(fetchNhiUsageSummary('bad', mockFetch)).rejects.toThrow('Failed to fetch NHI usage summary: 500');
		});
	});

	// --- fetchNhiStalenessReport ---

	describe('fetchNhiStalenessReport', () => {
		it('fetches from /api/nhi/usage/staleness without params', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiStalenessReport } = await import('./nhi-usage-client');

			const result = await fetchNhiStalenessReport({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/usage/staleness');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchNhiStalenessReport } = await import('./nhi-usage-client');

			await fetchNhiStalenessReport({ limit: 50, offset: 25 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=50');
			expect(calledUrl).toContain('offset=25');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiStalenessReport } = await import('./nhi-usage-client');

			await expect(fetchNhiStalenessReport({}, mockFetch)).rejects.toThrow('Failed to fetch staleness report: 500');
		});
	});

	// --- fetchNhiOverallSummary ---

	describe('fetchNhiOverallSummary', () => {
		it('fetches from /api/nhi/summary', async () => {
			const data = { total_entities: 50, by_type: { tool: 20, agent: 15, service_account: 15 } };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiOverallSummary } = await import('./nhi-usage-client');

			const result = await fetchNhiOverallSummary(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/summary');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiOverallSummary } = await import('./nhi-usage-client');

			await expect(fetchNhiOverallSummary(mockFetch)).rejects.toThrow('Failed to fetch NHI summary: 500');
		});
	});
});
