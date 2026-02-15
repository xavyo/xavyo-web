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
	createDelegationGrant,
	listDelegationGrants,
	getDelegationGrant,
	revokeDelegationGrant,
	listIncomingDelegations,
	listOutgoingDelegations
} from './nhi-delegations';

const mockApiClient = vi.mocked(apiClient);

describe('NHI Delegations API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createDelegationGrant', () => {
		it('calls POST /nhi/delegations', async () => {
			const mockResult = { id: 'del-1', status: 'active' };
			mockApiClient.mockResolvedValue(mockResult);
			const body = {
				principal_id: 'user-1',
				principal_type: 'user' as const,
				actor_nhi_id: 'nhi-1',
				allowed_scopes: ['read'],
				allowed_resource_types: ['api']
			};

			const result = await createDelegationGrant(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/delegations', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('listDelegationGrants', () => {
		it('calls GET /nhi/delegations without params', async () => {
			const mockResult = { data: [], limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listDelegationGrants({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/delegations', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes query params for principal_id and status', async () => {
			mockApiClient.mockResolvedValue({ data: [], limit: 20, offset: 0 });

			await listDelegationGrants({ principal_id: 'user-1', status: 'active', limit: 10, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('principal_id=user-1');
			expect(calledPath).toContain('status=active');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=0');
		});

		it('includes actor_nhi_id param', async () => {
			mockApiClient.mockResolvedValue({ data: [], limit: 20, offset: 0 });

			await listDelegationGrants({ actor_nhi_id: 'nhi-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('actor_nhi_id=nhi-1');
		});
	});

	describe('getDelegationGrant', () => {
		it('calls GET /nhi/delegations/:id', async () => {
			const mockResult = { id: 'del-1', status: 'active' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getDelegationGrant('del-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/delegations/del-1', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('revokeDelegationGrant', () => {
		it('calls POST /nhi/delegations/:id/revoke with body', async () => {
			const body = { revoked_by: 'admin-1' };
			const mockResult = { id: 'del-1', status: 'revoked' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await revokeDelegationGrant('del-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/delegations/del-1/revoke', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('sends empty body when no revoked_by', async () => {
			mockApiClient.mockResolvedValue({ id: 'del-1', status: 'revoked' });

			await revokeDelegationGrant('del-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/delegations/del-1/revoke', {
				method: 'POST', token, tenantId, body: {}, fetch: mockFetch
			});
		});
	});

	describe('listIncomingDelegations', () => {
		it('calls GET /nhi/:id/delegations/incoming', async () => {
			const mockResult = { data: [], limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listIncomingDelegations('nhi-1', { limit: 20, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/nhi/nhi-1/delegations/incoming');
			expect(calledPath).toContain('limit=20');
			expect(result).toEqual(mockResult);
		});
	});

	describe('listOutgoingDelegations', () => {
		it('calls GET /nhi/:id/delegations/outgoing', async () => {
			const mockResult = { data: [], limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listOutgoingDelegations('nhi-1', { limit: 20, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/nhi/nhi-1/delegations/outgoing');
			expect(calledPath).toContain('limit=20');
			expect(result).toEqual(mockResult);
		});
	});
});
