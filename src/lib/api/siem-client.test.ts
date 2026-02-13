import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('siem-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Destinations ---

	describe('fetchSiemDestinations', () => {
		it('fetches from /api/governance/siem/destinations', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSiemDestinations } = await import('./siem-client');

			const result = await fetchSiemDestinations({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/destinations');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 10, offset: 20 }));
			const { fetchSiemDestinations } = await import('./siem-client');

			await fetchSiemDestinations(
				{ enabled: true, destination_type: 'splunk_hec', limit: 10, offset: 20 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('enabled=true');
			expect(calledUrl).toContain('destination_type=splunk_hec');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSiemDestinations } = await import('./siem-client');

			await expect(fetchSiemDestinations({}, mockFetch)).rejects.toThrow(
				'Failed to fetch SIEM destinations: 500'
			);
		});
	});

	describe('fetchSiemDestination', () => {
		it('fetches from /api/governance/siem/destinations/:id', async () => {
			const data = { id: 'dest-1', name: 'Splunk Prod', destination_type: 'splunk_hec' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSiemDestination } = await import('./siem-client');

			const result = await fetchSiemDestination('dest-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/destinations/dest-1');
			expect(result).toEqual(data);
		});

		it('throws on 404 response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchSiemDestination } = await import('./siem-client');

			await expect(fetchSiemDestination('nonexistent', mockFetch)).rejects.toThrow(
				'Failed to fetch SIEM destination: 404'
			);
		});
	});

	describe('createSiemDestinationClient', () => {
		it('sends POST to /api/governance/siem/destinations', async () => {
			const body = {
				name: 'New Splunk',
				destination_type: 'splunk_hec',
				endpoint_host: 'splunk.example.com',
				export_format: 'json'
			};
			const data = { id: 'dest-new', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createSiemDestinationClient } = await import('./siem-client');

			const result = await createSiemDestinationClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/destinations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createSiemDestinationClient } = await import('./siem-client');

			await expect(createSiemDestinationClient({} as any, mockFetch)).rejects.toThrow(
				'Failed to create SIEM destination: 400'
			);
		});
	});

	describe('updateSiemDestinationClient', () => {
		it('sends PUT to /api/governance/siem/destinations/:id', async () => {
			const body = { name: 'Updated Splunk', enabled: false };
			const data = { id: 'dest-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateSiemDestinationClient } = await import('./siem-client');

			const result = await updateSiemDestinationClient('dest-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/destinations/dest-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateSiemDestinationClient } = await import('./siem-client');

			await expect(
				updateSiemDestinationClient('dest-1', {} as any, mockFetch)
			).rejects.toThrow('Failed to update SIEM destination: 422');
		});
	});

	describe('deleteSiemDestinationClient', () => {
		it('sends DELETE to /api/governance/siem/destinations/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteSiemDestinationClient } = await import('./siem-client');

			await deleteSiemDestinationClient('dest-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/destinations/dest-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteSiemDestinationClient } = await import('./siem-client');

			await expect(deleteSiemDestinationClient('bad', mockFetch)).rejects.toThrow(
				'Failed to delete SIEM destination: 404'
			);
		});
	});

	// --- Test ---

	describe('testSiemDestinationClient', () => {
		it('sends POST to /api/governance/siem/destinations/:id/test', async () => {
			const data = { success: true, latency_ms: 42, error: null };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { testSiemDestinationClient } = await import('./siem-client');

			const result = await testSiemDestinationClient('dest-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/siem/destinations/dest-1/test',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 502));
			const { testSiemDestinationClient } = await import('./siem-client');

			await expect(testSiemDestinationClient('dest-1', mockFetch)).rejects.toThrow(
				'Failed to test SIEM destination: 502'
			);
		});
	});

	// --- Health ---

	describe('fetchSiemHealthSummary', () => {
		it('fetches from /api/governance/siem/destinations/:id/health', async () => {
			const data = {
				destination_id: 'dest-1',
				total_events_sent: 1000,
				total_events_delivered: 990,
				total_events_failed: 10,
				total_events_dropped: 0,
				avg_latency_ms: 25,
				success_rate_percent: 99.0,
				circuit_state: 'closed',
				dead_letter_count: 3
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSiemHealthSummary } = await import('./siem-client');

			const result = await fetchSiemHealthSummary('dest-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/siem/destinations/dest-1/health'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSiemHealthSummary } = await import('./siem-client');

			await expect(fetchSiemHealthSummary('dest-1', mockFetch)).rejects.toThrow(
				'Failed to fetch SIEM health summary: 500'
			);
		});
	});

	describe('fetchSiemHealthHistory', () => {
		it('fetches from /api/governance/siem/destinations/:id/health/history', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSiemHealthHistory } = await import('./siem-client');

			const result = await fetchSiemHealthHistory('dest-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/siem/destinations/dest-1/health/history'
			);
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 50, limit: 10, offset: 20 })
			);
			const { fetchSiemHealthHistory } = await import('./siem-client');

			await fetchSiemHealthHistory('dest-1', { limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSiemHealthHistory } = await import('./siem-client');

			await expect(fetchSiemHealthHistory('dest-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch SIEM health history: 500'
			);
		});
	});

	// --- Dead Letter ---

	describe('fetchSiemDeadLetter', () => {
		it('fetches from /api/governance/siem/destinations/:id/dead-letter', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSiemDeadLetter } = await import('./siem-client');

			const result = await fetchSiemDeadLetter('dest-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/siem/destinations/dest-1/dead-letter'
			);
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 5, limit: 10, offset: 0 })
			);
			const { fetchSiemDeadLetter } = await import('./siem-client');

			await fetchSiemDeadLetter('dest-1', { limit: 10, offset: 0 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSiemDeadLetter } = await import('./siem-client');

			await expect(fetchSiemDeadLetter('dest-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch SIEM dead letter queue: 500'
			);
		});
	});

	describe('redeliverSiemDeadLetterClient', () => {
		it('sends POST to /api/governance/siem/destinations/:id/dead-letter/redeliver', async () => {
			const data = { events_requeued: 5 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { redeliverSiemDeadLetterClient } = await import('./siem-client');

			const result = await redeliverSiemDeadLetterClient('dest-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/siem/destinations/dest-1/dead-letter/redeliver',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { redeliverSiemDeadLetterClient } = await import('./siem-client');

			await expect(redeliverSiemDeadLetterClient('dest-1', mockFetch)).rejects.toThrow(
				'Failed to redeliver SIEM dead letter events: 500'
			);
		});
	});

	// --- Batch Exports ---

	describe('fetchSiemExports', () => {
		it('fetches from /api/governance/siem/exports', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSiemExports } = await import('./siem-client');

			const result = await fetchSiemExports({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/exports');
			expect(result).toEqual(data);
		});

		it('includes status filter and pagination', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 3, limit: 10, offset: 0 })
			);
			const { fetchSiemExports } = await import('./siem-client');

			await fetchSiemExports(
				{ status: 'completed', output_format: 'json', limit: 10, offset: 0 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=completed');
			expect(calledUrl).toContain('output_format=json');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSiemExports } = await import('./siem-client');

			await expect(fetchSiemExports({}, mockFetch)).rejects.toThrow(
				'Failed to fetch SIEM exports: 500'
			);
		});
	});

	describe('createSiemExportClient', () => {
		it('sends POST to /api/governance/siem/exports', async () => {
			const body = {
				date_range_start: '2026-01-01T00:00:00Z',
				date_range_end: '2026-01-31T23:59:59Z',
				event_type_filter: ['authentication'],
				output_format: 'json'
			};
			const data = { id: 'export-1', status: 'pending', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createSiemExportClient } = await import('./siem-client');

			const result = await createSiemExportClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/exports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createSiemExportClient } = await import('./siem-client');

			await expect(createSiemExportClient({} as any, mockFetch)).rejects.toThrow(
				'Failed to create SIEM export: 400'
			);
		});
	});

	describe('fetchSiemExport', () => {
		it('fetches from /api/governance/siem/exports/:id', async () => {
			const data = {
				id: 'export-1',
				status: 'completed',
				total_events: 150,
				file_size_bytes: 4096
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSiemExport } = await import('./siem-client');

			const result = await fetchSiemExport('export-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/siem/exports/export-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchSiemExport } = await import('./siem-client');

			await expect(fetchSiemExport('bad', mockFetch)).rejects.toThrow(
				'Failed to fetch SIEM export: 404'
			);
		});
	});

	// --- Download URL ---

	describe('downloadSiemExportUrl', () => {
		it('returns the download URL string', async () => {
			const { downloadSiemExportUrl } = await import('./siem-client');

			const url = downloadSiemExportUrl('export-1');

			expect(url).toBe('/api/governance/siem/exports/export-1/download');
		});

		it('returns correct URL for different IDs', async () => {
			const { downloadSiemExportUrl } = await import('./siem-client');

			expect(downloadSiemExportUrl('abc-123')).toBe(
				'/api/governance/siem/exports/abc-123/download'
			);
			expect(downloadSiemExportUrl('export-xyz')).toBe(
				'/api/governance/siem/exports/export-xyz/download'
			);
		});
	});
});
