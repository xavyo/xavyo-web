import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listSiemDestinations,
	createSiemDestination,
	getSiemDestination,
	updateSiemDestination,
	deleteSiemDestination,
	testSiemDestination,
	getSiemHealthSummary,
	getSiemHealthHistory,
	listSiemDeadLetter,
	redeliverSiemDeadLetter,
	listSiemExports,
	createSiemExport,
	getSiemExport,
	downloadSiemExport
} from './siem';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://localhost:8080' }
}));

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

const TOKEN = 'test-token';
const TENANT = 'tenant-123';
const DEST_ID = 'dest-abc';
const EXPORT_ID = 'export-xyz';
const mockFetch = vi.fn();

describe('SIEM API client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Destinations ---

	describe('listSiemDestinations', () => {
		it('calls GET /governance/siem/destinations with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSiemDestinations({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/siem/destinations', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes enabled filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listSiemDestinations({ enabled: true }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/siem/destinations?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('enabled')).toBe('true');
		});

		it('includes destination_type filter', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listSiemDestinations(
				{ destination_type: 'splunk_hec' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('destination_type')).toBe('splunk_hec');
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listSiemDestinations({ limit: 10, offset: 20 }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('createSiemDestination', () => {
		it('calls POST /governance/siem/destinations with body', async () => {
			const body = {
				name: 'Production Splunk',
				destination_type: 'splunk_hec' as const,
				endpoint_host: 'splunk.example.com',
				export_format: 'json' as const
			};
			const mockDest = { id: DEST_ID, ...body };
			mockApiClient.mockResolvedValue(mockDest);

			const result = await createSiemDestination(body, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/siem/destinations', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockDest);
		});
	});

	describe('getSiemDestination', () => {
		it('calls GET /governance/siem/destinations/:id', async () => {
			const mockDest = {
				id: DEST_ID,
				name: 'Production Splunk',
				destination_type: 'splunk_hec'
			};
			mockApiClient.mockResolvedValue(mockDest);

			const result = await getSiemDestination(DEST_ID, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}`,
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockDest);
		});
	});

	describe('updateSiemDestination', () => {
		it('calls PUT /governance/siem/destinations/:id with body', async () => {
			const body = { name: 'Updated Splunk', enabled: false };
			const mockDest = { id: DEST_ID, ...body };
			mockApiClient.mockResolvedValue(mockDest);

			const result = await updateSiemDestination(
				DEST_ID,
				body,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}`,
				{
					method: 'PUT',
					body,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockDest);
		});
	});

	describe('deleteSiemDestination', () => {
		it('calls DELETE /governance/siem/destinations/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteSiemDestination(DEST_ID, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}`,
				{
					method: 'DELETE',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
		});
	});

	// --- Test Connectivity ---

	describe('testSiemDestination', () => {
		it('calls POST /governance/siem/destinations/:id/test', async () => {
			const mockResponse = { success: true, latency_ms: 42, error: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await testSiemDestination(DEST_ID, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}/test`,
				{
					method: 'POST',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('returns failure result when connectivity fails', async () => {
			const mockResponse = {
				success: false,
				latency_ms: null,
				error: 'Connection refused'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await testSiemDestination(DEST_ID, TOKEN, TENANT, mockFetch);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Connection refused');
		});
	});

	// --- Health ---

	describe('getSiemHealthSummary', () => {
		it('calls GET /governance/siem/destinations/:id/health', async () => {
			const mockSummary = {
				destination_id: DEST_ID,
				total_events_sent: 1000,
				total_events_delivered: 990,
				total_events_failed: 10,
				total_events_dropped: 0,
				avg_latency_ms: 25,
				last_success_at: '2026-02-13T10:00:00Z',
				last_failure_at: null,
				success_rate_percent: 99.0,
				circuit_state: 'closed',
				dead_letter_count: 5
			};
			mockApiClient.mockResolvedValue(mockSummary);

			const result = await getSiemHealthSummary(DEST_ID, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}/health`,
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockSummary);
		});
	});

	describe('getSiemHealthHistory', () => {
		it('calls GET /governance/siem/destinations/:id/health/history with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getSiemHealthHistory(DEST_ID, {}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}/health/history`,
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 5 });

			await getSiemHealthHistory(DEST_ID, { limit: 10, offset: 5 }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain(
				`/governance/siem/destinations/${DEST_ID}/health/history?`
			);
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	// --- Dead Letter ---

	describe('listSiemDeadLetter', () => {
		it('calls GET /governance/siem/destinations/:id/dead-letter with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSiemDeadLetter(DEST_ID, {}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}/dead-letter`,
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 100 });

			await listSiemDeadLetter(
				DEST_ID,
				{ limit: 50, offset: 100 },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('50');
			expect(params.get('offset')).toBe('100');
		});
	});

	describe('redeliverSiemDeadLetter', () => {
		it('calls POST /governance/siem/destinations/:id/dead-letter/redeliver', async () => {
			const mockResponse = { events_requeued: 7 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await redeliverSiemDeadLetter(DEST_ID, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/destinations/${DEST_ID}/dead-letter/redeliver`,
				{
					method: 'POST',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Batch Exports ---

	describe('listSiemExports', () => {
		it('calls GET /governance/siem/exports with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSiemExports({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/siem/exports', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listSiemExports({ status: 'completed' }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('completed');
		});

		it('includes output_format filter', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listSiemExports({ output_format: 'json' }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('output_format')).toBe('json');
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listSiemExports({ limit: 10, offset: 20 }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('createSiemExport', () => {
		it('calls POST /governance/siem/exports with body', async () => {
			const body = {
				date_range_start: '2026-01-01T00:00:00Z',
				date_range_end: '2026-01-15T00:00:00Z',
				event_type_filter: ['authentication', 'security'] as const,
				output_format: 'json' as const
			};
			const mockExport = { id: EXPORT_ID, ...body, status: 'pending' };
			mockApiClient.mockResolvedValue(mockExport);

			const result = await createSiemExport(
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/siem/exports', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockExport);
		});
	});

	describe('getSiemExport', () => {
		it('calls GET /governance/siem/exports/:id', async () => {
			const mockExport = {
				id: EXPORT_ID,
				status: 'completed',
				total_events: 500,
				output_format: 'json'
			};
			mockApiClient.mockResolvedValue(mockExport);

			const result = await getSiemExport(EXPORT_ID, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/siem/exports/${EXPORT_ID}`,
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockExport);
		});
	});

	describe('downloadSiemExport', () => {
		it('calls fetch with correct URL and auth headers for download', async () => {
			const mockBlob = new Blob(['export-data'], { type: 'application/octet-stream' });
			const mockResponse = {
				ok: true,
				status: 200,
				blob: vi.fn().mockResolvedValue(mockBlob),
				json: vi.fn()
			};
			mockFetch.mockResolvedValue(mockResponse);

			const result = await downloadSiemExport(EXPORT_ID, TOKEN, TENANT, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`http://localhost:8080/governance/siem/exports/${EXPORT_ID}/download`,
				{
					headers: {
						Authorization: `Bearer ${TOKEN}`,
						'X-Tenant-Id': TENANT
					}
				}
			);
			expect(result).toBe(mockResponse);
		});

		it('throws ApiError when download fails', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				json: vi.fn().mockResolvedValue({ error: 'Export not found' })
			};
			mockFetch.mockResolvedValue(mockResponse);

			await expect(
				downloadSiemExport(EXPORT_ID, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Export not found');
		});

		it('throws generic error when response body is not JSON', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				json: vi.fn().mockRejectedValue(new Error('not json'))
			};
			mockFetch.mockResolvedValue(mockResponse);

			await expect(
				downloadSiemExport(EXPORT_ID, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Download failed');
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(
				getSiemDestination(DEST_ID, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createSiemDestination({} as never, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation error'));

			await expect(
				updateSiemDestination(DEST_ID, {} as never, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Validation error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				deleteSiemDestination(DEST_ID, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for health endpoints', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				getSiemHealthSummary(DEST_ID, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for dead letter endpoints', async () => {
			mockApiClient.mockRejectedValue(new Error('Service unavailable'));

			await expect(
				listSiemDeadLetter(DEST_ID, {}, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Service unavailable');
		});

		it('propagates errors from apiClient for export endpoints', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				listSiemExports({}, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Unauthorized');
		});
	});
});
