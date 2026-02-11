import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('access-requests-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- fetchAccessRequests ---

	describe('fetchAccessRequests', () => {
		it('fetches from /api/governance/access-requests with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAccessRequests } = await import('./access-requests-client');

			const result = await fetchAccessRequests({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/access-requests');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchAccessRequests } = await import('./access-requests-client');

			await fetchAccessRequests(
				{ status: 'pending', requester_id: 'user-1', limit: 10 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/access-requests?');
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('requester_id=user-1');
			expect(calledUrl).toContain('limit=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchAccessRequests } = await import('./access-requests-client');

			await expect(fetchAccessRequests({}, mockFetch)).rejects.toThrow(
				'Failed to fetch access requests: 500'
			);
		});
	});

	// --- createAccessRequestClient ---

	describe('createAccessRequestClient', () => {
		it('sends POST to /api/governance/access-requests with body', async () => {
			const created = {
				request: { id: 'req-1', status: 'pending' },
				sod_warning_message: undefined
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createAccessRequestClient } = await import('./access-requests-client');

			const body = {
				entitlement_id: 'ent-1',
				justification: 'Need access for project'
			};
			const result = await createAccessRequestClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/access-requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createAccessRequestClient } = await import('./access-requests-client');

			await expect(
				createAccessRequestClient(
					{ entitlement_id: 'ent-1', justification: 'reason' },
					mockFetch
				)
			).rejects.toThrow('Failed to create access request: 400');
		});
	});

	// --- fetchAccessRequest ---

	describe('fetchAccessRequest', () => {
		it('fetches from /api/governance/access-requests/:id', async () => {
			const data = { id: 'req-1', status: 'pending' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAccessRequest } = await import('./access-requests-client');

			const result = await fetchAccessRequest('req-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/access-requests/req-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchAccessRequest } = await import('./access-requests-client');

			await expect(fetchAccessRequest('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch access request: 404'
			);
		});
	});

	// --- cancelAccessRequestClient ---

	describe('cancelAccessRequestClient', () => {
		it('sends POST to /api/governance/access-requests/:id/cancel', async () => {
			const data = { id: 'req-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelAccessRequestClient } = await import('./access-requests-client');

			const result = await cancelAccessRequestClient('req-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/access-requests/req-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { cancelAccessRequestClient } = await import('./access-requests-client');

			await expect(cancelAccessRequestClient('req-1', mockFetch)).rejects.toThrow(
				'Failed to cancel access request: 400'
			);
		});
	});

	// --- approveAccessRequestClient ---

	describe('approveAccessRequestClient', () => {
		it('sends POST to /api/governance/access-requests/:id/approve with body', async () => {
			const data = { id: 'req-1', status: 'approved' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { approveAccessRequestClient } = await import('./access-requests-client');

			const body = { notes: 'Approved by manager' };
			const result = await approveAccessRequestClient('req-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/access-requests/req-1/approve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { approveAccessRequestClient } = await import('./access-requests-client');

			await expect(
				approveAccessRequestClient('req-1', { notes: 'ok' }, mockFetch)
			).rejects.toThrow('Failed to approve access request: 403');
		});
	});

	// --- rejectAccessRequestClient ---

	describe('rejectAccessRequestClient', () => {
		it('sends POST to /api/governance/access-requests/:id/reject with body', async () => {
			const data = { id: 'req-1', status: 'rejected' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { rejectAccessRequestClient } = await import('./access-requests-client');

			const body = { reason: 'Not justified' };
			const result = await rejectAccessRequestClient('req-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/access-requests/req-1/reject', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { rejectAccessRequestClient } = await import('./access-requests-client');

			await expect(
				rejectAccessRequestClient('req-1', { reason: 'No' }, mockFetch)
			).rejects.toThrow('Failed to reject access request: 403');
		});
	});

	// --- fetchMyApprovals ---

	describe('fetchMyApprovals', () => {
		it('fetches from /api/governance/my-approvals with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMyApprovals } = await import('./access-requests-client');

			const result = await fetchMyApprovals({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/my-approvals');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchMyApprovals } = await import('./access-requests-client');

			await fetchMyApprovals({ status: 'pending_approval', limit: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending_approval');
			expect(calledUrl).toContain('limit=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { fetchMyApprovals } = await import('./access-requests-client');

			await expect(fetchMyApprovals({}, mockFetch)).rejects.toThrow(
				'Failed to fetch my approvals: 403'
			);
		});
	});
});
