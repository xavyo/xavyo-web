import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('risk-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- fetchRiskScores ---

	describe('fetchRiskScores', () => {
		it('fetches from /api/governance/risk/scores with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRiskScores } = await import('./risk-client');

			const result = await fetchRiskScores({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/risk/scores');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchRiskScores } = await import('./risk-client');

			await fetchRiskScores(
				{ risk_level: 'high', min_score: 50, limit: 10 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/risk/scores?');
			expect(calledUrl).toContain('risk_level=high');
			expect(calledUrl).toContain('min_score=50');
			expect(calledUrl).toContain('limit=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRiskScores } = await import('./risk-client');

			await expect(fetchRiskScores({}, mockFetch)).rejects.toThrow(
				'Failed to fetch risk scores: 500'
			);
		});
	});

	// --- fetchRiskScoreSummary ---

	describe('fetchRiskScoreSummary', () => {
		it('fetches from /api/governance/risk/scores/summary', async () => {
			const data = {
				total_users: 100,
				low_count: 60,
				medium_count: 25,
				high_count: 10,
				critical_count: 5,
				average_score: 35
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRiskScoreSummary } = await import('./risk-client');

			const result = await fetchRiskScoreSummary(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/risk/scores/summary');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRiskScoreSummary } = await import('./risk-client');

			await expect(fetchRiskScoreSummary(mockFetch)).rejects.toThrow(
				'Failed to fetch risk score summary: 500'
			);
		});
	});

	// --- fetchRiskAlertsSummary ---

	describe('fetchRiskAlertsSummary', () => {
		it('fetches from /api/governance/risk/alerts/summary', async () => {
			const data = {
				total_alerts: 15,
				unread_count: 5,
				by_severity: { low: 5, medium: 4, high: 3, critical: 3 }
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRiskAlertsSummary } = await import('./risk-client');

			const result = await fetchRiskAlertsSummary(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/risk/alerts/summary');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRiskAlertsSummary } = await import('./risk-client');

			await expect(fetchRiskAlertsSummary(mockFetch)).rejects.toThrow(
				'Failed to fetch risk alerts summary: 500'
			);
		});
	});

	// --- fetchRiskAlerts ---

	describe('fetchRiskAlerts', () => {
		it('fetches from /api/governance/risk/alerts with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRiskAlerts } = await import('./risk-client');

			const result = await fetchRiskAlerts({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/risk/alerts');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchRiskAlerts } = await import('./risk-client');

			await fetchRiskAlerts(
				{ severity: 'critical', acknowledged: false, limit: 5 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/risk/alerts?');
			expect(calledUrl).toContain('severity=critical');
			expect(calledUrl).toContain('acknowledged=false');
			expect(calledUrl).toContain('limit=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRiskAlerts } = await import('./risk-client');

			await expect(fetchRiskAlerts({}, mockFetch)).rejects.toThrow(
				'Failed to fetch risk alerts: 500'
			);
		});
	});
});
