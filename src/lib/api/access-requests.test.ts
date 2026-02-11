import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listAccessRequests,
	createAccessRequest,
	getAccessRequest,
	cancelAccessRequest,
	approveAccessRequest,
	rejectAccessRequest,
	listMyApprovals
} from './access-requests';

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

describe('access-requests API functions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	const mockAccessRequest = {
		id: 'ar-1',
		requester_id: 'user-1',
		entitlement_id: 'ent-1',
		workflow_id: null,
		current_step: 0,
		status: 'pending' as const,
		justification: 'Need access for project',
		requested_expires_at: null,
		has_sod_warning: false,
		sod_violations: [],
		provisioned_assignment_id: null,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		expires_at: null
	};

	const mockListResponse = {
		items: [mockAccessRequest],
		total: 1,
		limit: 20,
		offset: 0
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listAccessRequests', () => {
		it('calls GET /governance/access-requests with no params', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			const result = await listAccessRequests({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockListResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			await listAccessRequests({ status: 'pending' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests?status=pending', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('includes entitlement_id filter in query string', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			await listAccessRequests({ entitlement_id: 'ent-1' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/access-requests?entitlement_id=ent-1',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('includes limit and offset in query string', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			await listAccessRequests({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/access-requests?limit=10&offset=20',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('includes all params in query string', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			await listAccessRequests(
				{ status: 'approved', entitlement_id: 'ent-2', limit: 5, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/access-requests?status=approved&entitlement_id=ent-2&limit=5&offset=0',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});

	describe('createAccessRequest', () => {
		it('calls POST /governance/access-requests with body', async () => {
			const createData = {
				entitlement_id: 'ent-1',
				justification: 'Need access for project'
			};
			const mockResponse = { request: mockAccessRequest };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createAccessRequest(createData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests', {
				method: 'POST',
				body: createData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes optional requested_expires_at in body', async () => {
			const createData = {
				entitlement_id: 'ent-1',
				justification: 'Temporary access needed',
				requested_expires_at: '2026-06-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue({ request: mockAccessRequest });

			await createAccessRequest(createData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests', {
				method: 'POST',
				body: createData,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('getAccessRequest', () => {
		it('calls GET /governance/access-requests/:id', async () => {
			mockApiClient.mockResolvedValue(mockAccessRequest);

			const result = await getAccessRequest('ar-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests/ar-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockAccessRequest);
		});
	});

	describe('cancelAccessRequest', () => {
		it('calls POST /governance/access-requests/:id/cancel', async () => {
			const cancelledRequest = { ...mockAccessRequest, status: 'cancelled' };
			mockApiClient.mockResolvedValue(cancelledRequest);

			const result = await cancelAccessRequest('ar-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests/ar-1/cancel', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(cancelledRequest);
		});
	});

	describe('approveAccessRequest', () => {
		it('calls POST /governance/access-requests/:id/approve with body', async () => {
			const approveData = { notes: 'Approved for project Alpha' };
			const approvedRequest = { ...mockAccessRequest, status: 'approved' };
			mockApiClient.mockResolvedValue(approvedRequest);

			const result = await approveAccessRequest('ar-1', approveData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests/ar-1/approve', {
				method: 'POST',
				body: approveData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(approvedRequest);
		});

		it('sends empty body when no notes provided', async () => {
			const approveData = {};
			const approvedRequest = { ...mockAccessRequest, status: 'approved' };
			mockApiClient.mockResolvedValue(approvedRequest);

			await approveAccessRequest('ar-1', approveData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests/ar-1/approve', {
				method: 'POST',
				body: approveData,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('rejectAccessRequest', () => {
		it('calls POST /governance/access-requests/:id/reject with body', async () => {
			const rejectData = { reason: 'Insufficient justification' };
			const rejectedRequest = { ...mockAccessRequest, status: 'rejected' };
			mockApiClient.mockResolvedValue(rejectedRequest);

			const result = await rejectAccessRequest('ar-1', rejectData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests/ar-1/reject', {
				method: 'POST',
				body: rejectData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(rejectedRequest);
		});
	});

	describe('listMyApprovals', () => {
		it('calls GET /governance/my-approvals with no params', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			const result = await listMyApprovals({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/my-approvals', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockListResponse);
		});

		it('includes limit and offset in query string', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			await listMyApprovals({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/my-approvals?limit=10&offset=5', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('includes only limit when offset is not provided', async () => {
			mockApiClient.mockResolvedValue(mockListResponse);

			await listMyApprovals({ limit: 25 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/my-approvals?limit=25', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});
