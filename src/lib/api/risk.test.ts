import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listRiskScores,
	getRiskScoreSummary,
	getUserRiskScore,
	getUserRiskHistory,
	getRiskAlertsSummary,
	listRiskAlerts
} from './risk';

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

const mockApiClient = vi.mocked(apiClient);

describe('Risk API — risk scores', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listRiskScores', () => {
		it('calls GET /governance/risk-scores with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listRiskScores({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/risk-scores', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes risk_level filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listRiskScores({ risk_level: 'high' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/risk-scores?risk_level=high', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('includes sort_by in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listRiskScores({ sort_by: 'total_score' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/risk-scores?sort_by=total_score',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 50, limit: 10, offset: 20 });

			await listRiskScores({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/risk-scores?limit=10&offset=20',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('includes all params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 });

			await listRiskScores(
				{ risk_level: 'critical', sort_by: 'total_score', limit: 10, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/risk-scores?risk_level=critical&sort_by=total_score&limit=10&offset=0',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});

	describe('getRiskScoreSummary', () => {
		it('calls GET /governance/risk-scores/summary', async () => {
			const mockResponse = {
				total_users: 100,
				low_count: 60,
				medium_count: 25,
				high_count: 10,
				critical_count: 5,
				average_score: 35
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getRiskScoreSummary(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/risk-scores/summary', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getUserRiskScore', () => {
		it('calls GET /governance/users/:userId/risk-score', async () => {
			const mockResponse = {
				id: 'rs-1',
				user_id: 'user-1',
				total_score: 45,
				risk_level: 'medium',
				static_score: 30,
				dynamic_score: 15,
				factor_breakdown: [],
				peer_comparison: null,
				calculated_at: '2026-01-15T00:00:00Z',
				created_at: '2026-01-15T00:00:00Z',
				updated_at: '2026-01-15T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getUserRiskScore('user-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/users/user-1/risk-score', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getUserRiskHistory', () => {
		it('calls GET /governance/users/:userId/risk-score/history with no params', async () => {
			const mockResponse = {
				user_id: 'user-1',
				current_score: 45,
				direction: 'stable',
				history_entries: []
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getUserRiskHistory('user-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/users/user-1/risk-score/history',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes date range params in query string', async () => {
			mockApiClient.mockResolvedValue({
				user_id: 'user-1',
				current_score: 45,
				direction: 'increasing',
				history_entries: []
			});

			await getUserRiskHistory(
				'user-1',
				{ start_date: '2026-01-01', end_date: '2026-01-31' },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/users/user-1/risk-score/history?start_date=2026-01-01&end_date=2026-01-31',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('includes limit param in query string', async () => {
			mockApiClient.mockResolvedValue({
				user_id: 'user-1',
				current_score: 45,
				direction: 'decreasing',
				history_entries: []
			});

			await getUserRiskHistory('user-1', { limit: 30 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/users/user-1/risk-score/history?limit=30',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('includes all params in query string', async () => {
			mockApiClient.mockResolvedValue({
				user_id: 'user-1',
				current_score: 45,
				direction: 'stable',
				history_entries: []
			});

			await getUserRiskHistory(
				'user-1',
				{ start_date: '2026-01-01', end_date: '2026-01-31', limit: 10 },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/users/user-1/risk-score/history?start_date=2026-01-01&end_date=2026-01-31&limit=10',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Risk API — risk alerts', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getRiskAlertsSummary', () => {
		it('calls GET /governance/risk-alerts/summary', async () => {
			const mockResponse = {
				total_alerts: 15,
				unread_count: 3,
				by_severity: { low: 5, medium: 5, high: 3, critical: 2 }
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getRiskAlertsSummary(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/risk-alerts/summary', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('listRiskAlerts', () => {
		it('calls GET /governance/risk-alerts with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listRiskAlerts({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/risk-alerts', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 30, limit: 10, offset: 10 });

			await listRiskAlerts({ limit: 10, offset: 10 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/risk-alerts?limit=10&offset=10',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('returns the response from apiClient', async () => {
			const mockResponse = {
				items: [
					{
						id: 'alert-1',
						user_id: 'user-1',
						alert_type: 'risk_increase',
						severity: 'high',
						title: 'Risk score increased',
						message: 'User risk score increased significantly',
						metadata: {},
						acknowledged_at: null,
						created_at: '2026-01-15T00:00:00Z'
					}
				],
				total: 1,
				limit: 20,
				offset: 0
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listRiskAlerts({}, token, tenantId, mockFetch);

			expect(result).toEqual(mockResponse);
		});
	});
});
