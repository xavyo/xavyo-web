import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listBirthrightPolicies,
	getBirthrightPolicy,
	createBirthrightPolicy,
	updateBirthrightPolicy,
	archiveBirthrightPolicy,
	enableBirthrightPolicy,
	disableBirthrightPolicy,
	simulatePolicy,
	simulateAllPolicies,
	analyzeImpact
} from './birthright';

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

describe('Birthright API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- List & Get ---

	describe('listBirthrightPolicies', () => {
		it('calls GET /governance/birthright-policies', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listBirthrightPolicies({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listBirthrightPolicies({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=active');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listBirthrightPolicies({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});
	});

	describe('getBirthrightPolicy', () => {
		it('calls GET /governance/birthright-policies/:id', async () => {
			const mockResponse = {
				id: 'pol-1',
				name: 'New Hire Policy',
				status: 'active',
				priority: 10,
				conditions: [],
				entitlement_ids: []
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getBirthrightPolicy('pol-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/pol-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Create & Update ---

	describe('createBirthrightPolicy', () => {
		it('calls POST /governance/birthright-policies with body', async () => {
			const body = {
				name: 'New Hire Policy',
				priority: 10,
				conditions: [{ attribute: 'dept', operator: 'Equals', value: 'Eng' }],
				entitlement_ids: ['ent-1']
			};
			const mockResponse = { id: 'pol-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createBirthrightPolicy(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateBirthrightPolicy', () => {
		it('calls PUT /governance/birthright-policies/:id with body', async () => {
			const body = { name: 'Updated Policy', priority: 20 };
			const mockResponse = { id: 'pol-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateBirthrightPolicy('pol-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/pol-1',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Lifecycle ---

	describe('archiveBirthrightPolicy', () => {
		it('calls DELETE /governance/birthright-policies/:id', async () => {
			const mockResponse = { id: 'pol-1', status: 'archived' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await archiveBirthrightPolicy('pol-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/pol-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('enableBirthrightPolicy', () => {
		it('calls POST /governance/birthright-policies/:id/enable', async () => {
			const mockResponse = { id: 'pol-1', status: 'active' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await enableBirthrightPolicy('pol-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/pol-1/enable',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('disableBirthrightPolicy', () => {
		it('calls POST /governance/birthright-policies/:id/disable', async () => {
			const mockResponse = { id: 'pol-1', status: 'disabled' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await disableBirthrightPolicy('pol-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/pol-1/disable',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Simulation ---

	describe('simulatePolicy', () => {
		it('calls POST /governance/birthright-policies/:id/simulate with body', async () => {
			const body = { attributes: { department: 'Engineering', location: 'US' } };
			const mockResponse = { matched: true, entitlements: ['ent-1'], conditions_met: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await simulatePolicy('pol-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/pol-1/simulate',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('simulateAllPolicies', () => {
		it('calls POST /governance/birthright-policies/simulate with body', async () => {
			const body = { attributes: { department: 'Engineering' } };
			const mockResponse = { policies: [{ id: 'pol-1', matched: true }] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await simulateAllPolicies(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/simulate',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('analyzeImpact', () => {
		it('calls POST /governance/birthright-policies/:id/impact with empty body', async () => {
			const mockResponse = {
				policy_id: 'pol-1',
				policy_name: 'Test Policy',
				summary: {
					total_users_affected: 50,
					users_gaining_access: 30,
					users_losing_access: 10,
					users_unchanged: 10,
					total_entitlements_granted: 5
				},
				by_department: [],
				by_location: [],
				entitlement_impacts: [],
				affected_users: [],
				is_truncated: false
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await analyzeImpact('pol-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/pol-1/impact',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(listBirthrightPolicies({}, token, tenantId, mockFetch)).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for GET single', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(getBirthrightPolicy('bad', token, tenantId, mockFetch)).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createBirthrightPolicy({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation error'));

			await expect(
				updateBirthrightPolicy('pol-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Validation error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				archiveBirthrightPolicy('pol-1', token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for enable', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				enableBirthrightPolicy('pol-1', token, tenantId, mockFetch)
			).rejects.toThrow('Unauthorized');
		});

		it('propagates errors from apiClient for disable', async () => {
			mockApiClient.mockRejectedValue(new Error('Conflict'));

			await expect(
				disableBirthrightPolicy('pol-1', token, tenantId, mockFetch)
			).rejects.toThrow('Conflict');
		});

		it('propagates errors from apiClient for simulate', async () => {
			mockApiClient.mockRejectedValue(new Error('Bad request'));

			await expect(
				simulatePolicy('pol-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Bad request');
		});

		it('propagates errors from apiClient for simulateAll', async () => {
			mockApiClient.mockRejectedValue(new Error('Service unavailable'));

			await expect(
				simulateAllPolicies({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Service unavailable');
		});

		it('propagates errors from apiClient for impact analysis', async () => {
			mockApiClient.mockRejectedValue(new Error('Timeout'));

			await expect(
				analyzeImpact('pol-1', token, tenantId, mockFetch)
			).rejects.toThrow('Timeout');
		});
	});
});
