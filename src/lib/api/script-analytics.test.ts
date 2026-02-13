import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getScriptAnalyticsDashboard,
	getScriptAnalytics,
	listScriptExecutionLogs,
	getScriptExecutionLog,
	listScriptAuditEvents
} from './script-analytics';

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

describe('Script Analytics API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Dashboard ---

	describe('getScriptAnalyticsDashboard', () => {
		it('calls GET /governance/script-analytics/dashboard', async () => {
			const mockResponse = {
				total_scripts: 10,
				active_scripts: 7,
				total_executions: 500,
				scripts: []
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getScriptAnalyticsDashboard(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-analytics/dashboard', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Per-Script Analytics ---

	describe('getScriptAnalytics', () => {
		it('calls GET /governance/script-analytics/scripts/:scriptId', async () => {
			const mockResponse = {
				script_id: 'script-1',
				total_executions: 100,
				success_rate: 95.5,
				avg_duration_ms: 120
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getScriptAnalytics('script-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/script-analytics/scripts/script-1',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Execution Logs ---

	describe('listScriptExecutionLogs', () => {
		it('calls GET /governance/script-execution-logs', async () => {
			const mockResponse = { logs: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScriptExecutionLogs({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-execution-logs', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes script_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs({ script_id: 'script-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('script_id=script-1');
		});

		it('includes connector_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs({ connector_id: 'conn-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('connector_id=conn-1');
		});

		it('includes binding_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs({ binding_id: 'bind-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('binding_id=bind-1');
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs({ status: 'success' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=success');
		});

		it('includes dry_run query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs({ dry_run: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('dry_run=true');
		});

		it('includes date range query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs(
				{ from_date: '2026-01-01', to_date: '2026-01-31' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('from_date=2026-01-01');
			expect(calledPath).toContain('to_date=2026-01-31');
		});

		it('includes page and page_size query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs({ page: 2, page_size: 50 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('page=2');
			expect(calledPath).toContain('page_size=50');
		});

		it('includes all params combined', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptExecutionLogs(
				{
					script_id: 's-1',
					connector_id: 'c-1',
					binding_id: 'b-1',
					status: 'error',
					dry_run: false,
					from_date: '2026-01-01',
					to_date: '2026-02-01',
					page: 1,
					page_size: 25
				},
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('script_id=s-1');
			expect(calledPath).toContain('connector_id=c-1');
			expect(calledPath).toContain('binding_id=b-1');
			expect(calledPath).toContain('status=error');
			expect(calledPath).toContain('dry_run=false');
			expect(calledPath).toContain('from_date=2026-01-01');
			expect(calledPath).toContain('to_date=2026-02-01');
		});
	});

	describe('getScriptExecutionLog', () => {
		it('calls GET /governance/script-execution-logs/:id', async () => {
			const mockResponse = {
				id: 'log-1',
				script_id: 'script-1',
				status: 'success',
				duration_ms: 45
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getScriptExecutionLog('log-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-execution-logs/log-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Audit Events ---

	describe('listScriptAuditEvents', () => {
		it('calls GET /governance/script-audit-events', async () => {
			const mockResponse = { events: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScriptAuditEvents({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-audit-events', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes script_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptAuditEvents({ script_id: 'script-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('script_id=script-1');
		});

		it('includes action query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptAuditEvents({ action: 'created' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('action=created');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptAuditEvents({ limit: 25, offset: 50 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=25');
			expect(calledPath).toContain('offset=50');
		});

		it('includes all params combined', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptAuditEvents(
				{ script_id: 'script-1', action: 'updated', limit: 10, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('script_id=script-1');
			expect(calledPath).toContain('action=updated');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=0');
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors for dashboard', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(
				getScriptAnalyticsDashboard(token, tenantId, mockFetch)
			).rejects.toThrow('Network error');
		});

		it('propagates errors for per-script analytics', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				getScriptAnalytics('bad-id', token, tenantId, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors for execution logs list', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				listScriptExecutionLogs({}, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors for execution log detail', async () => {
			mockApiClient.mockRejectedValue(new Error('Log not found'));

			await expect(
				getScriptExecutionLog('log-bad', token, tenantId, mockFetch)
			).rejects.toThrow('Log not found');
		});

		it('propagates errors for audit events', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				listScriptAuditEvents({}, token, tenantId, mockFetch)
			).rejects.toThrow('Unauthorized');
		});
	});
});
