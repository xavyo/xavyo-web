import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('nhi-delegations-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	describe('createDelegationGrantClient', () => {
		it('sends POST to /api/nhi/delegations with body', async () => {
			const body = { principal_id: 'u-1', principal_type: 'user' as const, actor_nhi_id: 'nhi-1', allowed_scopes: ['read'], allowed_resource_types: [] };
			const data = { id: 'del-1', status: 'active', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createDelegationGrantClient } = await import('./nhi-delegations-client');

			const result = await createDelegationGrantClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/delegations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createDelegationGrantClient } = await import('./nhi-delegations-client');

			await expect(createDelegationGrantClient({} as any, mockFetch)).rejects.toThrow('Failed to create delegation grant: 400');
		});
	});

	describe('fetchDelegationGrants', () => {
		it('fetches from /api/nhi/delegations without params', async () => {
			const data = { data: [], limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchDelegationGrants } = await import('./nhi-delegations-client');

			const result = await fetchDelegationGrants({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/delegations');
			expect(result).toEqual(data);
		});

		it('includes query params when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ data: [], limit: 20, offset: 0 }));
			const { fetchDelegationGrants } = await import('./nhi-delegations-client');

			await fetchDelegationGrants({ principal_id: 'u-1', status: 'active', limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('principal_id=u-1');
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchDelegationGrants } = await import('./nhi-delegations-client');

			await expect(fetchDelegationGrants({}, mockFetch)).rejects.toThrow('Failed to fetch delegation grants: 500');
		});
	});

	describe('fetchDelegationGrant', () => {
		it('fetches from /api/nhi/delegations/:id', async () => {
			const data = { id: 'del-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchDelegationGrant } = await import('./nhi-delegations-client');

			const result = await fetchDelegationGrant('del-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/delegations/del-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchDelegationGrant } = await import('./nhi-delegations-client');

			await expect(fetchDelegationGrant('bad', mockFetch)).rejects.toThrow('Failed to fetch delegation grant: 404');
		});
	});

	describe('revokeDelegationGrantClient', () => {
		it('sends POST to /api/nhi/delegations/:id/revoke', async () => {
			const data = { id: 'del-1', status: 'revoked' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { revokeDelegationGrantClient } = await import('./nhi-delegations-client');

			const result = await revokeDelegationGrantClient('del-1', { revoked_by: 'admin-1' }, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/delegations/del-1/revoke', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ revoked_by: 'admin-1' })
			});
			expect(result).toEqual(data);
		});

		it('sends empty body by default', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ id: 'del-1', status: 'revoked' }));
			const { revokeDelegationGrantClient } = await import('./nhi-delegations-client');

			await revokeDelegationGrantClient('del-1', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/delegations/del-1/revoke', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { revokeDelegationGrantClient } = await import('./nhi-delegations-client');

			await expect(revokeDelegationGrantClient('del-1', {}, mockFetch)).rejects.toThrow('Failed to revoke delegation grant: 403');
		});
	});

	describe('fetchIncomingDelegations', () => {
		it('fetches from /api/nhi/delegations/entity/:nhiId/incoming', async () => {
			const data = { data: [], limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchIncomingDelegations } = await import('./nhi-delegations-client');

			const result = await fetchIncomingDelegations('nhi-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/delegations/entity/nhi-1/incoming');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ data: [], limit: 10, offset: 5 }));
			const { fetchIncomingDelegations } = await import('./nhi-delegations-client');

			await fetchIncomingDelegations('nhi-1', { limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchIncomingDelegations } = await import('./nhi-delegations-client');

			await expect(fetchIncomingDelegations('nhi-1', {}, mockFetch)).rejects.toThrow('Failed to fetch incoming delegations: 500');
		});
	});

	describe('fetchOutgoingDelegations', () => {
		it('fetches from /api/nhi/delegations/entity/:nhiId/outgoing', async () => {
			const data = { data: [], limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchOutgoingDelegations } = await import('./nhi-delegations-client');

			const result = await fetchOutgoingDelegations('nhi-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/delegations/entity/nhi-1/outgoing');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchOutgoingDelegations } = await import('./nhi-delegations-client');

			await expect(fetchOutgoingDelegations('nhi-1', {}, mockFetch)).rejects.toThrow('Failed to fetch outgoing delegations: 500');
		});
	});
});
