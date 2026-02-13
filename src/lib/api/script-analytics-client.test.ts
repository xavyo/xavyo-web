import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('script-analytics-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.stubGlobal('fetch', mockFetch);
		vi.resetModules();
	});

	// --- Dashboard ---

	describe('fetchAnalyticsDashboard', () => {
		it('fetches from /api/provisioning-scripts/analytics/dashboard', async () => {
			const data = { total_scripts: 5, active_scripts: 3, total_executions: 200, scripts: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAnalyticsDashboard } = await import('./script-analytics-client');

			const result = await fetchAnalyticsDashboard();

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/provisioning-scripts/analytics/dashboard'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Unauthorized' }, false, 401));
			const { fetchAnalyticsDashboard } = await import('./script-analytics-client');

			await expect(fetchAnalyticsDashboard()).rejects.toThrow('Unauthorized');
		});

		it('throws generic error when response body cannot be parsed', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('parse error'))
			});
			const { fetchAnalyticsDashboard } = await import('./script-analytics-client');

			await expect(fetchAnalyticsDashboard()).rejects.toThrow('Request failed');
		});
	});

	// --- Per-Script Analytics ---

	describe('fetchScriptAnalytics', () => {
		it('fetches from /api/provisioning-scripts/analytics/scripts/:scriptId', async () => {
			const data = {
				script_id: 'script-1',
				total_executions: 50,
				success_rate: 98.0,
				avg_duration_ms: 85
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScriptAnalytics } = await import('./script-analytics-client');

			const result = await fetchScriptAnalytics('script-1');

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/provisioning-scripts/analytics/scripts/script-1'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Not found' }, false, 404));
			const { fetchScriptAnalytics } = await import('./script-analytics-client');

			await expect(fetchScriptAnalytics('bad')).rejects.toThrow('Not found');
		});
	});

	// --- Execution Logs ---

	describe('fetchExecutionLogs', () => {
		it('fetches from /api/provisioning-scripts/execution-logs', async () => {
			const data = { logs: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchExecutionLogs } = await import('./script-analytics-client');

			const result = await fetchExecutionLogs();

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/provisioning-scripts/execution-logs'
			);
			expect(result).toEqual(data);
		});

		it('includes all query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ logs: [], total: 0 }));
			const { fetchExecutionLogs } = await import('./script-analytics-client');

			await fetchExecutionLogs({
				script_id: 'script-1',
				connector_id: 'conn-1',
				binding_id: 'bind-1',
				status: 'error',
				dry_run: true,
				from_date: '2026-01-01',
				to_date: '2026-01-31',
				page: 2,
				page_size: 10
			});

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('script_id=script-1');
			expect(calledUrl).toContain('connector_id=conn-1');
			expect(calledUrl).toContain('binding_id=bind-1');
			expect(calledUrl).toContain('status=error');
			expect(calledUrl).toContain('dry_run=true');
			expect(calledUrl).toContain('from_date=2026-01-01');
			expect(calledUrl).toContain('to_date=2026-01-31');
			expect(calledUrl).toContain('page=2');
			expect(calledUrl).toContain('page_size=10');
		});

		it('omits undefined params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ logs: [], total: 0 }));
			const { fetchExecutionLogs } = await import('./script-analytics-client');

			await fetchExecutionLogs({ script_id: 'script-1' });

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('script_id=script-1');
			expect(calledUrl).not.toContain('connector_id');
			expect(calledUrl).not.toContain('status');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Server error' }, false, 500));
			const { fetchExecutionLogs } = await import('./script-analytics-client');

			await expect(fetchExecutionLogs()).rejects.toThrow('Server error');
		});
	});

	describe('fetchExecutionLog', () => {
		it('fetches from /api/provisioning-scripts/execution-logs/:id', async () => {
			const data = {
				id: 'log-1',
				script_id: 'script-1',
				status: 'success',
				duration_ms: 120
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchExecutionLog } = await import('./script-analytics-client');

			const result = await fetchExecutionLog('log-1');

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/provisioning-scripts/execution-logs/log-1'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Not found' }, false, 404));
			const { fetchExecutionLog } = await import('./script-analytics-client');

			await expect(fetchExecutionLog('bad')).rejects.toThrow('Not found');
		});
	});

	// --- Audit Events ---

	describe('fetchAuditEvents', () => {
		it('fetches from /api/provisioning-scripts/audit-events', async () => {
			const data = { events: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAuditEvents } = await import('./script-analytics-client');

			const result = await fetchAuditEvents();

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/provisioning-scripts/audit-events'
			);
			expect(result).toEqual(data);
		});

		it('includes all query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ events: [], total: 0 }));
			const { fetchAuditEvents } = await import('./script-analytics-client');

			await fetchAuditEvents({
				script_id: 'script-1',
				action: 'activated',
				limit: 25,
				offset: 10
			});

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('script_id=script-1');
			expect(calledUrl).toContain('action=activated');
			expect(calledUrl).toContain('limit=25');
			expect(calledUrl).toContain('offset=10');
		});

		it('omits undefined params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ events: [], total: 0 }));
			const { fetchAuditEvents } = await import('./script-analytics-client');

			await fetchAuditEvents({ action: 'created' });

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('action=created');
			expect(calledUrl).not.toContain('script_id');
			expect(calledUrl).not.toContain('limit');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Forbidden' }, false, 403));
			const { fetchAuditEvents } = await import('./script-analytics-client');

			await expect(fetchAuditEvents()).rejects.toThrow('Forbidden');
		});
	});
});
