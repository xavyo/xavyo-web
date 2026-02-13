import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('nhi-requests-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- submitNhiRequestClient ---

	describe('submitNhiRequestClient', () => {
		it('sends POST to /api/nhi/requests with body', async () => {
			const body = { nhi_id: 'nhi-1', requested_permissions: ['read'], justification: 'Need access' };
			const data = { id: 'req-1', status: 'pending', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { submitNhiRequestClient } = await import('./nhi-requests-client');

			const result = await submitNhiRequestClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { submitNhiRequestClient } = await import('./nhi-requests-client');

			await expect(submitNhiRequestClient({} as any, mockFetch)).rejects.toThrow('Failed to submit NHI request: 400');
		});
	});

	// --- fetchNhiRequests ---

	describe('fetchNhiRequests', () => {
		it('fetches from /api/nhi/requests without params', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiRequests } = await import('./nhi-requests-client');

			const result = await fetchNhiRequests({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests');
			expect(result).toEqual(data);
		});

		it('includes query params when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchNhiRequests } = await import('./nhi-requests-client');

			await fetchNhiRequests({ status: 'pending', pending_only: true, limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('pending_only=true');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiRequests } = await import('./nhi-requests-client');

			await expect(fetchNhiRequests({}, mockFetch)).rejects.toThrow('Failed to fetch NHI requests: 500');
		});
	});

	// --- fetchNhiRequestSummary ---

	describe('fetchNhiRequestSummary', () => {
		it('fetches from /api/nhi/requests/summary', async () => {
			const data = { total: 10, pending: 3, approved: 5, rejected: 2 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiRequestSummary } = await import('./nhi-requests-client');

			const result = await fetchNhiRequestSummary(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests/summary');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiRequestSummary } = await import('./nhi-requests-client');

			await expect(fetchNhiRequestSummary(mockFetch)).rejects.toThrow('Failed to fetch NHI request summary: 500');
		});
	});

	// --- fetchMyPendingRequests ---

	describe('fetchMyPendingRequests', () => {
		it('fetches from /api/nhi/requests/my-pending', async () => {
			const data = { items: [{ id: 'req-1' }], total: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMyPendingRequests } = await import('./nhi-requests-client');

			const result = await fetchMyPendingRequests(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests/my-pending');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { fetchMyPendingRequests } = await import('./nhi-requests-client');

			await expect(fetchMyPendingRequests(mockFetch)).rejects.toThrow('Failed to fetch my pending requests: 403');
		});
	});

	// --- fetchNhiRequest ---

	describe('fetchNhiRequest', () => {
		it('fetches from /api/nhi/requests/:id', async () => {
			const data = { id: 'req-1', status: 'pending' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiRequest } = await import('./nhi-requests-client');

			const result = await fetchNhiRequest('req-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests/req-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchNhiRequest } = await import('./nhi-requests-client');

			await expect(fetchNhiRequest('bad', mockFetch)).rejects.toThrow('Failed to fetch NHI request: 404');
		});
	});

	// --- approveNhiRequestClient ---

	describe('approveNhiRequestClient', () => {
		it('sends POST to /api/nhi/requests/:id/approve', async () => {
			const data = { id: 'req-1', status: 'approved' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { approveNhiRequestClient } = await import('./nhi-requests-client');

			const result = await approveNhiRequestClient('req-1', { comment: 'Looks good' } as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests/req-1/approve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ comment: 'Looks good' })
			});
			expect(result).toEqual(data);
		});

		it('sends with empty body by default', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ id: 'req-1', status: 'approved' }));
			const { approveNhiRequestClient } = await import('./nhi-requests-client');

			await approveNhiRequestClient('req-1', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests/req-1/approve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { approveNhiRequestClient } = await import('./nhi-requests-client');

			await expect(approveNhiRequestClient('req-1', {}, mockFetch)).rejects.toThrow('Failed to approve NHI request: 403');
		});
	});

	// --- rejectNhiRequestClient ---

	describe('rejectNhiRequestClient', () => {
		it('sends POST to /api/nhi/requests/:id/reject', async () => {
			const body = { reason: 'Not justified' };
			const data = { id: 'req-1', status: 'rejected' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { rejectNhiRequestClient } = await import('./nhi-requests-client');

			const result = await rejectNhiRequestClient('req-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests/req-1/reject', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { rejectNhiRequestClient } = await import('./nhi-requests-client');

			await expect(rejectNhiRequestClient('req-1', {} as any, mockFetch)).rejects.toThrow('Failed to reject NHI request: 400');
		});
	});

	// --- cancelNhiRequestClient ---

	describe('cancelNhiRequestClient', () => {
		it('sends POST to /api/nhi/requests/:id/cancel', async () => {
			const data = { id: 'req-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelNhiRequestClient } = await import('./nhi-requests-client');

			const result = await cancelNhiRequestClient('req-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/requests/req-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { cancelNhiRequestClient } = await import('./nhi-requests-client');

			await expect(cancelNhiRequestClient('req-1', mockFetch)).rejects.toThrow('Failed to cancel NHI request: 409');
		});
	});
});
