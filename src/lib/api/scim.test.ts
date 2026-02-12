import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listScimTokens,
	createScimToken,
	revokeScimToken,
	listScimMappings,
	updateScimMappings
} from './scim';

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

describe('SCIM API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── listScimTokens ─────────────────────────────────────────────────────

	describe('listScimTokens', () => {
		const mockResponse = [
			{
				id: 'tok-1',
				name: 'CI Token',
				token_prefix: 'xavyo_scim_abc...',
				created_at: '2024-01-01T00:00:00Z',
				last_used_at: null,
				revoked_at: null,
				created_by: 'user-1'
			},
			{
				id: 'tok-2',
				name: 'Prod Token',
				token_prefix: 'xavyo_scim_def...',
				created_at: '2024-02-01T00:00:00Z',
				last_used_at: '2024-03-01T00:00:00Z',
				revoked_at: null,
				created_by: 'user-2'
			}
		];

		it('calls GET /admin/scim/tokens', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimTokens(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim/tokens', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('returns flat array (not paginated)', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimTokens(token, tenantId, mockFetch);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Forbidden', 403));

			await expect(listScimTokens(token, tenantId, mockFetch)).rejects.toThrow('Forbidden');
		});
	});

	// ─── createScimToken ────────────────────────────────────────────────────

	describe('createScimToken', () => {
		const mockResponse = {
			id: 'tok-new',
			name: 'New Token',
			token: 'xavyo_scim_full_secret_value',
			created_at: '2024-01-15T00:00:00Z',
			warning: 'Store this token securely. It will not be shown again.'
		};

		it('calls POST /admin/scim/tokens with name body', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createScimToken('New Token', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim/tokens', {
				method: 'POST',
				body: { name: 'New Token' },
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Bad Request', 400));

			await expect(createScimToken('', token, tenantId, mockFetch)).rejects.toThrow(
				'Bad Request'
			);
		});
	});

	// ─── revokeScimToken ────────────────────────────────────────────────────

	describe('revokeScimToken', () => {
		it('calls DELETE /admin/scim/tokens/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			const result = await revokeScimToken('tok-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim/tokens/tok-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeNull();
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(revokeScimToken('tok-999', token, tenantId, mockFetch)).rejects.toThrow(
				'Not Found'
			);
		});
	});

	// ─── listScimMappings ───────────────────────────────────────────────────

	describe('listScimMappings', () => {
		const mockResponse = [
			{
				id: 'map-1',
				tenant_id: tenantId,
				scim_path: 'userName',
				xavyo_field: 'email',
				transform: null,
				required: true,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			{
				id: 'map-2',
				tenant_id: tenantId,
				scim_path: 'name.givenName',
				xavyo_field: 'first_name',
				transform: null,
				required: false,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			}
		];

		it('calls GET /admin/scim/mappings', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimMappings(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim/mappings', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('returns flat array (not paginated)', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimMappings(token, tenantId, mockFetch);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Forbidden', 403));

			await expect(listScimMappings(token, tenantId, mockFetch)).rejects.toThrow('Forbidden');
		});
	});

	// ─── updateScimMappings ─────────────────────────────────────────────────

	describe('updateScimMappings', () => {
		const updateBody = {
			mappings: [
				{
					scim_path: 'userName',
					xavyo_field: 'email',
					transform: null,
					required: true
				},
				{
					scim_path: 'name.givenName',
					xavyo_field: 'first_name',
					transform: 'lowercase',
					required: false
				}
			]
		};

		const mockResponse = [
			{
				id: 'map-1',
				tenant_id: tenantId,
				scim_path: 'userName',
				xavyo_field: 'email',
				transform: null,
				required: true,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z'
			},
			{
				id: 'map-2',
				tenant_id: tenantId,
				scim_path: 'name.givenName',
				xavyo_field: 'first_name',
				transform: 'lowercase',
				required: false,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z'
			}
		];

		it('calls PUT /admin/scim/mappings with body', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateScimMappings(updateBody, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim/mappings', {
				method: 'PUT',
				body: updateBody,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Unprocessable Entity', 422));

			await expect(
				updateScimMappings(updateBody, token, tenantId, mockFetch)
			).rejects.toThrow('Unprocessable Entity');
		});
	});
});
