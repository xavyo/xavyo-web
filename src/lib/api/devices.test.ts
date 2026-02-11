import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listDevices, renameDevice, removeDevice, trustDevice, untrustDevice } from './devices';

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

describe('devices API functions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listDevices', () => {
		it('calls GET /devices', async () => {
			const mockResponse = {
				items: [
					{
						id: 'dev-1',
						device_fingerprint: 'fp-abc123',
						device_name: 'Work Laptop',
						device_type: 'desktop',
						browser: 'Chrome',
						browser_version: '120.0',
						os: 'macOS',
						os_version: '14.0',
						is_trusted: true,
						trust_expires_at: '2024-06-01T00:00:00Z',
						first_seen_at: '2024-01-01T00:00:00Z',
						last_seen_at: '2024-01-15T00:00:00Z',
						login_count: 42,
						is_current: true
					}
				],
				total: 1
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listDevices(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/devices', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('renameDevice', () => {
		it('calls PUT /devices/:id with body', async () => {
			const renameData = { device_name: 'Personal Laptop' };
			const mockResponse = { id: 'dev-1', device_name: 'Personal Laptop' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await renameDevice('dev-1', renameData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/devices/dev-1', {
				method: 'PUT',
				body: renameData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeDevice', () => {
		it('calls DELETE /devices/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeDevice('dev-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/devices/dev-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('trustDevice', () => {
		it('calls POST /devices/:id/trust with body', async () => {
			const trustData = { trust_duration_days: 30 };
			const mockResponse = { id: 'dev-1', is_trusted: true, trust_expires_at: '2024-02-01T00:00:00Z' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await trustDevice('dev-1', trustData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/devices/dev-1/trust', {
				method: 'POST',
				body: trustData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('untrustDevice', () => {
		it('calls DELETE /devices/:id/trust', async () => {
			const mockResponse = { id: 'dev-1', is_trusted: false, trust_expires_at: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await untrustDevice('dev-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/devices/dev-1/trust', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});
});
