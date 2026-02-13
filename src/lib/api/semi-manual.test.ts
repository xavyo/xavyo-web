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
const mockApiClient = vi.mocked(apiClient);

import {
	listSemiManualApplications,
	getSemiManualApplication,
	configureSemiManual,
	removeSemiManualConfig
} from './semi-manual';

describe('semi-manual API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- listSemiManualApplications ---

	describe('listSemiManualApplications', () => {
		it('calls GET /governance/semi-manual/applications with no query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSemiManualApplications({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/semi-manual/applications', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes limit query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSemiManualApplications({ limit: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
		});

		it('includes offset query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSemiManualApplications({ offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('offset=20');
		});

		it('includes both limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSemiManualApplications({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});

		it('passes token and tenantId correctly', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSemiManualApplications({}, 'my-token', 'my-tenant', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(expect.any(String), {
				method: 'GET',
				token: 'my-token',
				tenantId: 'my-tenant',
				fetch: mockFetch
			});
		});
	});

	// --- getSemiManualApplication ---

	describe('getSemiManualApplication', () => {
		it('calls GET /governance/semi-manual/applications/:id', async () => {
			const mockApp = {
				id: 'app-1',
				name: 'Test App',
				description: null,
				is_semi_manual: true,
				ticketing_config_id: null,
				sla_policy_id: null,
				requires_approval_before_ticket: false,
				status: 'active',
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockApp);

			const result = await getSemiManualApplication('app-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/semi-manual/applications/app-1',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockApp);
		});

		it('passes token and tenantId correctly', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await getSemiManualApplication('app-1', 'my-token', 'my-tenant', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(expect.any(String), {
				method: 'GET',
				token: 'my-token',
				tenantId: 'my-tenant',
				fetch: mockFetch
			});
		});
	});

	// --- configureSemiManual ---

	describe('configureSemiManual', () => {
		it('calls PUT /governance/semi-manual/applications/:id with body', async () => {
			const body = {
				is_semi_manual: true,
				ticketing_config_id: 'ticket-1',
				sla_policy_id: 'sla-1',
				requires_approval_before_ticket: true
			};
			const mockApp = {
				id: 'app-1',
				name: 'Test App',
				description: 'A test app',
				is_semi_manual: true,
				ticketing_config_id: 'ticket-1',
				sla_policy_id: 'sla-1',
				requires_approval_before_ticket: true,
				status: 'active',
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-02T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockApp);

			const result = await configureSemiManual('app-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/semi-manual/applications/app-1',
				{
					method: 'PUT',
					body,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockApp);
		});

		it('sends minimal body with only required fields', async () => {
			const body = {
				is_semi_manual: false,
				requires_approval_before_ticket: false
			};
			mockApiClient.mockResolvedValue({} as any);

			await configureSemiManual('app-2', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/semi-manual/applications/app-2',
				{
					method: 'PUT',
					body,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('passes token and tenantId correctly', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await configureSemiManual(
				'app-1',
				{ is_semi_manual: true, requires_approval_before_ticket: false },
				'my-token',
				'my-tenant',
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(expect.any(String), {
				method: 'PUT',
				body: expect.any(Object),
				token: 'my-token',
				tenantId: 'my-tenant',
				fetch: mockFetch
			});
		});
	});

	// --- removeSemiManualConfig ---

	describe('removeSemiManualConfig', () => {
		it('calls DELETE /governance/semi-manual/applications/:id', async () => {
			const mockApp = {
				id: 'app-1',
				name: 'Test App',
				description: null,
				is_semi_manual: false,
				ticketing_config_id: null,
				sla_policy_id: null,
				requires_approval_before_ticket: false,
				status: 'active',
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-03T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockApp);

			const result = await removeSemiManualConfig('app-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/semi-manual/applications/app-1',
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockApp);
		});

		it('passes token and tenantId correctly', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await removeSemiManualConfig('app-1', 'my-token', 'my-tenant', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(expect.any(String), {
				method: 'DELETE',
				token: 'my-token',
				tenantId: 'my-tenant',
				fetch: mockFetch
			});
		});
	});
});
