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
	submitNhiRequest,
	listNhiRequests,
	getNhiRequestSummary,
	getMyPendingRequests,
	getNhiRequest,
	approveNhiRequest,
	rejectNhiRequest,
	cancelNhiRequest
} from './nhi-requests';

const mockApiClient = vi.mocked(apiClient);

describe('NHI Requests API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('submitNhiRequest', () => {
		it('calls POST /governance/nhis/requests', async () => {
			const mockResult = { id: 'req-1', status: 'pending', name: 'Test Request' };
			mockApiClient.mockResolvedValue(mockResult);
			const body = { name: 'Test Request', purpose: 'Testing NHI access', requested_permissions: '', requested_expiration: '' };

			const result = await submitNhiRequest(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('listNhiRequests', () => {
		it('calls GET /governance/nhis/requests without params', async () => {
			const mockResult = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listNhiRequests({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes query params for status and pagination', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listNhiRequests({ status: 'pending', limit: 10, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/nhis/requests');
			expect(calledPath).toContain('status=pending');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=0');
		});

		it('includes pending_only param when set', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listNhiRequests({ pending_only: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('pending_only=true');
		});
	});

	describe('getNhiRequestSummary', () => {
		it('calls GET /governance/nhis/requests/summary', async () => {
			const mockResult = { total: 10, pending: 3, approved: 5, rejected: 2 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiRequestSummary(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests/summary', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('getMyPendingRequests', () => {
		it('calls GET /governance/nhis/requests/my-pending', async () => {
			const mockResult = { items: [{ id: 'req-1' }], total: 1 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getMyPendingRequests(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests/my-pending', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('getNhiRequest', () => {
		it('calls GET /governance/nhis/requests/:id', async () => {
			const mockResult = { id: 'req-1', status: 'pending', name: 'Test' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getNhiRequest('req-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests/req-1', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('approveNhiRequest', () => {
		it('calls POST /governance/nhis/requests/:id/approve with body', async () => {
			const body = { comments: 'Looks good' };
			const mockResult = { id: 'req-1', status: 'approved' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await approveNhiRequest('req-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests/req-1/approve', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('rejectNhiRequest', () => {
		it('calls POST /governance/nhis/requests/:id/reject with body', async () => {
			const body = { reason: 'Does not meet requirements' };
			const mockResult = { id: 'req-1', status: 'rejected' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await rejectNhiRequest('req-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests/req-1/reject', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('cancelNhiRequest', () => {
		it('calls POST /governance/nhis/requests/:id/cancel', async () => {
			const mockResult = { id: 'req-1', status: 'cancelled' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await cancelNhiRequest('req-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/requests/req-1/cancel', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});
});
