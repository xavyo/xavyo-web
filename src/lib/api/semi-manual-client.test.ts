import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	fetchSemiManualApplications,
	configureSemiManualClient,
	removeSemiManualConfigClient
} from './semi-manual-client';

describe('semi-manual-client API', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- fetchSemiManualApplications ---

	describe('fetchSemiManualApplications', () => {
		const mockListResponse = {
			items: [
				{
					id: 'app-1',
					name: 'HR System',
					description: 'Human resources application',
					is_semi_manual: true,
					ticketing_config_id: 'tc-1',
					sla_policy_id: 'sla-1',
					requires_approval_before_ticket: false,
					status: 'active',
					created_at: '2026-01-01T00:00:00Z',
					updated_at: '2026-01-02T00:00:00Z'
				}
			],
			total: 1,
			limit: 20,
			offset: 0
		};

		it('calls correct URL with no params', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockListResponse)
			});

			const result = await fetchSemiManualApplications({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledOnce();
			expect(mockFetch).toHaveBeenCalledWith('/api/governance/semi-manual/applications');
			expect(result).toEqual(mockListResponse);
		});

		it('calls correct URL with default params when no args provided', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockListResponse)
			});

			const result = await fetchSemiManualApplications(undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/semi-manual/applications');
			expect(result).toEqual(mockListResponse);
		});

		it('appends limit and offset as query params', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockListResponse)
			});

			await fetchSemiManualApplications({ limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/semi-manual/applications?');
			const url = new URL(calledUrl, 'http://localhost');
			expect(url.searchParams.get('limit')).toBe('10');
			expect(url.searchParams.get('offset')).toBe('20');
		});

		it('appends only limit when offset is not provided', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockListResponse)
			});

			await fetchSemiManualApplications({ limit: 50 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const url = new URL(calledUrl, 'http://localhost');
			expect(url.searchParams.get('limit')).toBe('50');
			expect(url.searchParams.has('offset')).toBe(false);
		});

		it('appends only offset when limit is not provided', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockListResponse)
			});

			await fetchSemiManualApplications({ offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const url = new URL(calledUrl, 'http://localhost');
			expect(url.searchParams.has('limit')).toBe(false);
			expect(url.searchParams.get('offset')).toBe('5');
		});

		it('uses GET method (no request options)', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockListResponse)
			});

			await fetchSemiManualApplications({}, mockFetch);

			// GET is the default — no second argument with method
			expect(mockFetch).toHaveBeenCalledWith('/api/governance/semi-manual/applications');
			expect(mockFetch.mock.calls[0].length).toBe(1);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

			await expect(fetchSemiManualApplications({}, mockFetch)).rejects.toThrow(
				'Failed to fetch semi-manual applications: 500'
			);
		});

		it('throws on non-ok response with 403 status', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

			await expect(fetchSemiManualApplications({}, mockFetch)).rejects.toThrow(
				'Failed to fetch semi-manual applications: 403'
			);
		});

		it('throws when fetch rejects (network error)', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network failure'));

			await expect(fetchSemiManualApplications({}, mockFetch)).rejects.toThrow(
				'Network failure'
			);
		});
	});

	// --- configureSemiManualClient ---

	describe('configureSemiManualClient', () => {
		const appId = 'app-123';
		const configData = {
			is_semi_manual: true,
			ticketing_config_id: 'tc-abc',
			sla_policy_id: 'sla-xyz',
			requires_approval_before_ticket: true
		};
		const mockApp = {
			id: appId,
			name: 'Configured App',
			description: null,
			is_semi_manual: true,
			ticketing_config_id: 'tc-abc',
			sla_policy_id: 'sla-xyz',
			requires_approval_before_ticket: true,
			status: 'active',
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-02-01T00:00:00Z'
		};

		it('calls correct URL with application id', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			const result = await configureSemiManualClient(appId, configData, mockFetch);

			expect(mockFetch).toHaveBeenCalledOnce();
			expect(mockFetch.mock.calls[0][0]).toBe(
				'/api/governance/semi-manual/applications/app-123'
			);
			expect(result).toEqual(mockApp);
		});

		it('uses PUT method', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			await configureSemiManualClient(appId, configData, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			expect(options.method).toBe('PUT');
		});

		it('sends JSON content-type header', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			await configureSemiManualClient(appId, configData, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
		});

		it('sends body as JSON string', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			await configureSemiManualClient(appId, configData, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			expect(JSON.parse(options.body)).toEqual(configData);
		});

		it('sends minimal config with only required fields', async () => {
			const minimalConfig = {
				is_semi_manual: false,
				requires_approval_before_ticket: false
			};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ ...mockApp, is_semi_manual: false })
			});

			await configureSemiManualClient(appId, minimalConfig, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			expect(JSON.parse(options.body)).toEqual(minimalConfig);
		});

		it('sends config with null optional fields', async () => {
			const configWithNulls = {
				is_semi_manual: true,
				ticketing_config_id: null,
				sla_policy_id: null,
				requires_approval_before_ticket: false
			};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			await configureSemiManualClient(appId, configWithNulls, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			const parsedBody = JSON.parse(options.body);
			expect(parsedBody.ticketing_config_id).toBeNull();
			expect(parsedBody.sla_policy_id).toBeNull();
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 422 });

			await expect(
				configureSemiManualClient(appId, configData, mockFetch)
			).rejects.toThrow('Failed to configure semi-manual application: 422');
		});

		it('throws on non-ok response with 404 status', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

			await expect(
				configureSemiManualClient(appId, configData, mockFetch)
			).rejects.toThrow('Failed to configure semi-manual application: 404');
		});

		it('throws when fetch rejects (network error)', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

			await expect(
				configureSemiManualClient(appId, configData, mockFetch)
			).rejects.toThrow('Connection refused');
		});
	});

	// --- removeSemiManualConfigClient ---

	describe('removeSemiManualConfigClient', () => {
		const appId = 'app-456';
		const mockApp = {
			id: appId,
			name: 'Deconfigured App',
			description: 'Was semi-manual',
			is_semi_manual: false,
			ticketing_config_id: null,
			sla_policy_id: null,
			requires_approval_before_ticket: false,
			status: 'active',
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-02-10T00:00:00Z'
		};

		it('calls correct URL with application id', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			const result = await removeSemiManualConfigClient(appId, mockFetch);

			expect(mockFetch).toHaveBeenCalledOnce();
			expect(mockFetch.mock.calls[0][0]).toBe(
				'/api/governance/semi-manual/applications/app-456'
			);
			expect(result).toEqual(mockApp);
		});

		it('uses DELETE method', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			await removeSemiManualConfigClient(appId, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			expect(options.method).toBe('DELETE');
		});

		it('does not send a request body', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			await removeSemiManualConfigClient(appId, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			expect(options.body).toBeUndefined();
		});

		it('does not send content-type header', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApp)
			});

			await removeSemiManualConfigClient(appId, mockFetch);

			const options = mockFetch.mock.calls[0][1];
			expect(options.headers).toBeUndefined();
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

			await expect(removeSemiManualConfigClient(appId, mockFetch)).rejects.toThrow(
				'Failed to remove semi-manual configuration: 500'
			);
		});

		it('throws on non-ok response with 404 status', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

			await expect(removeSemiManualConfigClient(appId, mockFetch)).rejects.toThrow(
				'Failed to remove semi-manual configuration: 404'
			);
		});

		it('throws when fetch rejects (network error)', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Timeout'));

			await expect(removeSemiManualConfigClient(appId, mockFetch)).rejects.toThrow(
				'Timeout'
			);
		});
	});
});
