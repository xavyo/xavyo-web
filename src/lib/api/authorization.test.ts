import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listPolicies,
	createPolicy,
	getPolicy,
	updatePolicy,
	deletePolicy,
	listMappings,
	createMapping,
	deleteMapping,
	checkAuthorization
} from './authorization';

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

import { apiClient, ApiError } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('Authorization API — Policies', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listPolicies', () => {
		it('calls GET /admin/authorization/policies with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listPolicies({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/policies', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listPolicies({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Forbidden', 403));

			await expect(listPolicies({}, token, tenantId, mockFetch)).rejects.toThrow('Forbidden');
		});
	});

	describe('createPolicy', () => {
		it('calls POST /admin/authorization/policies with body', async () => {
			const data = {
				name: 'Allow Read',
				effect: 'allow' as const,
				resource_type: 'document',
				action: 'read'
			};
			mockApiClient.mockResolvedValue({ id: 'pol-1', ...data });

			const result = await createPolicy(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/policies', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Bad Request', 400));

			await expect(
				createPolicy({ name: 'Bad', effect: 'allow' }, token, tenantId, mockFetch)
			).rejects.toThrow('Bad Request');
		});
	});

	describe('getPolicy', () => {
		it('calls GET /admin/authorization/policies/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'pol-1', name: 'Allow Read' });

			await getPolicy('pol-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/policies/pol-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(getPolicy('bad-id', token, tenantId, mockFetch)).rejects.toThrow(
				'Not Found'
			);
		});
	});

	describe('updatePolicy', () => {
		it('calls PUT /admin/authorization/policies/:id with body', async () => {
			const data = { name: 'Updated Policy', effect: 'deny' as const };
			mockApiClient.mockResolvedValue({ id: 'pol-1', ...data });

			await updatePolicy('pol-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/policies/pol-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Internal Server Error', 500));

			await expect(
				updatePolicy('pol-1', { name: 'Bad' }, token, tenantId, mockFetch)
			).rejects.toThrow('Internal Server Error');
		});
	});

	describe('deletePolicy', () => {
		it('calls DELETE /admin/authorization/policies/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deletePolicy('pol-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/policies/pol-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(deletePolicy('bad-id', token, tenantId, mockFetch)).rejects.toThrow(
				'Not Found'
			);
		});
	});
});

describe('Authorization API — Mappings', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listMappings', () => {
		it('calls GET /admin/authorization/mappings with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listMappings({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/mappings', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 5 });

			await listMappings({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Forbidden', 403));

			await expect(listMappings({}, token, tenantId, mockFetch)).rejects.toThrow('Forbidden');
		});
	});

	describe('createMapping', () => {
		it('calls POST /admin/authorization/mappings with body', async () => {
			const data = {
				entitlement_id: 'ent-1',
				action: 'read',
				resource_type: 'document'
			};
			mockApiClient.mockResolvedValue({ id: 'map-1', ...data });

			const result = await createMapping(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/mappings', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Bad Request', 400));

			await expect(
				createMapping(
					{ entitlement_id: 'bad', action: 'read', resource_type: 'doc' },
					token,
					tenantId,
					mockFetch
				)
			).rejects.toThrow('Bad Request');
		});
	});

	describe('deleteMapping', () => {
		it('calls DELETE /admin/authorization/mappings/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteMapping('map-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/authorization/mappings/map-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(deleteMapping('bad-id', token, tenantId, mockFetch)).rejects.toThrow(
				'Not Found'
			);
		});
	});
});

describe('Authorization API — Check', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('checkAuthorization', () => {
		it('calls GET /admin/authorization/check with query params', async () => {
			const mockDecision = {
				allowed: true,
				reason: 'Policy match',
				source: 'policy' as const,
				policy_id: 'pol-1',
				decision_id: 'dec-1'
			};
			mockApiClient.mockResolvedValue(mockDecision);

			const params = {
				user_id: 'user-1',
				action: 'read',
				resource_type: 'document'
			};
			const result = await checkAuthorization(params, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/admin/authorization/check?');
			const searchParams = new URLSearchParams(calledPath.split('?')[1]);
			expect(searchParams.get('user_id')).toBe('user-1');
			expect(searchParams.get('action')).toBe('read');
			expect(searchParams.get('resource_type')).toBe('document');
			expect(result).toEqual(mockDecision);
		});

		it('uses GET method, not POST', async () => {
			mockApiClient.mockResolvedValue({
				allowed: false,
				reason: 'Denied',
				source: 'default_deny',
				policy_id: null,
				decision_id: 'dec-2'
			});

			await checkAuthorization(
				{ user_id: 'user-1', action: 'write', resource_type: 'document' },
				token,
				tenantId,
				mockFetch
			);

			const calledOptions = (mockApiClient.mock.calls[0] as unknown[])[1] as Record<
				string,
				unknown
			>;
			expect(calledOptions.method).toBe('GET');
			expect(calledOptions.body).toBeUndefined();
		});

		it('includes optional resource_id in query params', async () => {
			mockApiClient.mockResolvedValue({
				allowed: true,
				reason: 'Entitlement match',
				source: 'entitlement',
				policy_id: null,
				decision_id: 'dec-3'
			});

			await checkAuthorization(
				{
					user_id: 'user-1',
					action: 'read',
					resource_type: 'document',
					resource_id: 'doc-42'
				},
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const searchParams = new URLSearchParams(calledPath.split('?')[1]);
			expect(searchParams.get('resource_id')).toBe('doc-42');
		});

		it('omits resource_id when not provided', async () => {
			mockApiClient.mockResolvedValue({
				allowed: false,
				reason: 'Default deny',
				source: 'default_deny',
				policy_id: null,
				decision_id: 'dec-4'
			});

			await checkAuthorization(
				{ user_id: 'user-1', action: 'delete', resource_type: 'document' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const searchParams = new URLSearchParams(calledPath.split('?')[1]);
			expect(searchParams.has('resource_id')).toBe(false);
		});

		it('propagates errors from apiClient', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Unauthorized', 401));

			await expect(
				checkAuthorization(
					{ user_id: 'user-1', action: 'read', resource_type: 'document' },
					token,
					tenantId,
					mockFetch
				)
			).rejects.toThrow('Unauthorized');
		});
	});
});
