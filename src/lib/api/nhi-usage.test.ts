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
	getNhiUsageHistory,
	getNhiUsageSummary,
	getNhiStalenessReport,
	getNhiOverallSummary
} from './nhi-usage';

const mockApiClient = vi.mocked(apiClient);

describe('NHI Usage API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getNhiUsageHistory', () => {
		it('calls GET /governance/nhis/:id/usage without params', async () => {
			const mockResult = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiUsageHistory('nhi-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/nhi-1/usage', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await getNhiUsageHistory('nhi-1', { limit: 20, offset: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/nhis/nhi-1/usage');
			expect(calledPath).toContain('limit=20');
			expect(calledPath).toContain('offset=10');
		});

		it('includes advertised usage list filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await getNhiUsageHistory(
				'nhi-1',
				{
					target_resource: 'api/users',
					outcome: 'success',
					start_date: '2024-01-01T00:00:00Z',
					end_date: '2024-02-01T00:00:00Z'
				},
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('target_resource')).toBe('api/users');
			expect(params.get('outcome')).toBe('success');
			expect(params.get('start_date')).toBe('2024-01-01T00:00:00Z');
			expect(params.get('end_date')).toBe('2024-02-01T00:00:00Z');
		});
	});

	describe('getNhiUsageSummary', () => {
		it('calls GET /governance/nhis/:id/usage/summary', async () => {
			const mockResult = { nhi_id: 'nhi-1', total_calls: 150, last_used: '2026-02-01' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiUsageSummary('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/nhi-1/usage/summary', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes period_days query param', async () => {
			mockApiClient.mockResolvedValue({});

			await getNhiUsageSummary('nhi-1', token, tenantId, mockFetch, { period_days: 90 });

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/nhis/nhi-1/usage/summary?period_days=90',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('getNhiStalenessReport', () => {
		it('calls GET /governance/nhis/staleness-report without params', async () => {
			const mockResult = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiStalenessReport({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/staleness-report', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await getNhiStalenessReport({ limit: 50, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=50');
			expect(calledPath).toContain('offset=0');
		});

		it('includes min_inactive_days query param', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await getNhiStalenessReport({ min_inactive_days: 60 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('min_inactive_days=60');
		});
	});

	describe('getNhiOverallSummary', () => {
		it('calls GET /governance/nhis/summary', async () => {
			const mockResult = { total_nhis: 50, active: 40, inactive: 10 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiOverallSummary(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/summary', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});
});
