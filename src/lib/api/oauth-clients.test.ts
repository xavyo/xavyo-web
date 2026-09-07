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
import { regenerateOAuthClientSecret } from './oauth-clients';

const mockApiClient = vi.mocked(apiClient);
const token = 'tok';
const tenantId = 'tenant-1';
const mockFetch = vi.fn();

describe('regenerateOAuthClientSecret', () => {
	beforeEach(() => vi.resetAllMocks());

	it('POSTs to the regenerate-secret endpoint and returns the new secret', async () => {
		mockApiClient.mockResolvedValue({ client_secret: 'new-secret-xyz' });

		const result = await regenerateOAuthClientSecret('client-123', token, tenantId, mockFetch);

		expect(mockApiClient).toHaveBeenCalledWith('/admin/oauth/clients/client-123/regenerate-secret', {
			method: 'POST',
			token,
			tenantId,
			fetch: mockFetch
		});
		expect(result).toEqual({ client_secret: 'new-secret-xyz' });
	});
});
