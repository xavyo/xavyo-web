import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listSocialProviders,
	updateSocialProvider,
	deleteSocialProvider,
	listSocialConnections,
	unlinkSocialAccount
} from './social';

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

describe('social API client', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listSocialProviders', () => {
		it('calls GET /admin/social-providers', async () => {
			const mockResponse = {
				providers: [
					{ provider: 'google', enabled: true, client_id: 'google-123' }
				],
				total: 1
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSocialProviders(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/social-providers', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateSocialProvider', () => {
		it('calls PUT /admin/social-providers/:provider with body', async () => {
			const updateData = { enabled: true, client_id: 'new-id', client_secret: 'new-secret' };
			const mockResponse = { provider: 'google', enabled: true, client_id: 'new-id' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateSocialProvider('google', updateData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/social-providers/google', {
				method: 'PUT',
				body: updateData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteSocialProvider', () => {
		it('calls DELETE /admin/social-providers/:provider', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteSocialProvider('github', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/social-providers/github', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('listSocialConnections', () => {
		it('calls GET /auth/social/connections', async () => {
			const mockResponse = {
				connections: [
					{ provider: 'google', email: 'user@gmail.com', linked_at: '2024-01-01T00:00:00Z' }
				]
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSocialConnections(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/social/connections', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('unlinkSocialAccount', () => {
		it('calls DELETE /auth/social/unlink/:provider', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await unlinkSocialAccount('google', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/social/unlink/google', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});
