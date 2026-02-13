import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listSessions, revokeSession, revokeAllOtherSessions } from './sessions';

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

describe('sessions API functions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listSessions', () => {
		it('calls GET /users/me/sessions', async () => {
			const mockResponse = {
				sessions: [
					{
						id: 'sess-1',
						device_name: 'Chrome on Mac',
						device_type: 'desktop',
						browser: 'Chrome',
						os: 'macOS',
						ip_address: '192.168.1.1',
						is_current: true,
						created_at: '2024-01-01T00:00:00Z',
						last_activity_at: '2024-01-01T12:00:00Z'
					}
				],
				total: 1
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSessions(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/users/me/sessions', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('revokeSession', () => {
		it('calls DELETE /users/me/sessions/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await revokeSession('sess-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/users/me/sessions/sess-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('revokeAllOtherSessions', () => {
		it('calls DELETE /users/me/sessions', async () => {
			const mockResponse = { revoked_count: 3, message: 'All other sessions revoked' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await revokeAllOtherSessions(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/users/me/sessions', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});
});
