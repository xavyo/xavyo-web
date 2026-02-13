import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getLoginHistory,
	getAdminLoginAttempts,
	getAdminLoginStats
} from './audit-client';
import {
	fetchLoginHistory,
	fetchAdminLoginAttempts,
	fetchAdminLoginStats
} from './audit';

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

describe('audit API functions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Client-side functions ---

	describe('getLoginHistory', () => {
		const mockResponse = {
			items: [
				{
					id: 'attempt-1',
					user_id: 'user-1',
					email: 'user@example.com',
					success: true,
					failure_reason: null,
					auth_method: 'password',
					ip_address: '192.168.1.1',
					user_agent: 'Mozilla/5.0',
					device_fingerprint: 'fp-abc',
					geo_country: 'US',
					geo_city: 'New York',
					is_new_device: false,
					is_new_location: false,
					created_at: '2024-01-01T00:00:00Z'
				}
			],
			total: 1,
			next_cursor: null
		};

		it('calls /api/audit/login-history with no params', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			const result = await getLoginHistory({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/audit/login-history');
			expect(result).toEqual(mockResponse);
		});

		it('builds query string with cursor and limit', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getLoginHistory({ cursor: 'abc123', limit: 25 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/audit/login-history?');
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('cursor')).toBe('abc123');
			expect(params.get('limit')).toBe('25');
		});

		it('builds query string with start_date and end_date', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getLoginHistory(
				{ start_date: '2024-01-01', end_date: '2024-01-31' },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('start_date')).toBe('2024-01-01');
			expect(params.get('end_date')).toBe('2024-01-31');
		});

		it('builds query string with success=true', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getLoginHistory({ success: true }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('success')).toBe('true');
		});

		it('builds query string with success=false', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getLoginHistory({ success: false }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('success')).toBe('false');
		});

		it('omits undefined params from query string', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getLoginHistory({ limit: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.has('cursor')).toBe(false);
			expect(params.has('start_date')).toBe(false);
			expect(params.has('end_date')).toBe(false);
			expect(params.has('success')).toBe(false);
			expect(params.get('limit')).toBe('10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValue({ ok: false, status: 500 });

			await expect(getLoginHistory({}, mockFetch)).rejects.toThrow(
				'Failed to fetch login history: 500'
			);
		});

		it('throws on non-ok 401 response', async () => {
			mockFetch.mockResolvedValue({ ok: false, status: 401 });

			await expect(getLoginHistory({}, mockFetch)).rejects.toThrow(
				'Failed to fetch login history: 401'
			);
		});

		it('throws on fetch network error', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(getLoginHistory({}, mockFetch)).rejects.toThrow('Network error');
		});
	});

	describe('getAdminLoginAttempts', () => {
		const mockResponse = {
			items: [],
			total: 0,
			next_cursor: null
		};

		it('calls /api/audit/admin/login-attempts with no params', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			const result = await getAdminLoginAttempts({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/audit/admin/login-attempts');
			expect(result).toEqual(mockResponse);
		});

		it('builds query string with all params', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAdminLoginAttempts(
				{
					cursor: 'xyz',
					limit: 50,
					user_id: 'user-1',
					email: 'admin@example.com',
					start_date: '2024-01-01',
					end_date: '2024-12-31',
					success: false,
					auth_method: 'sso'
				},
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('cursor')).toBe('xyz');
			expect(params.get('limit')).toBe('50');
			expect(params.get('user_id')).toBe('user-1');
			expect(params.get('email')).toBe('admin@example.com');
			expect(params.get('start_date')).toBe('2024-01-01');
			expect(params.get('end_date')).toBe('2024-12-31');
			expect(params.get('success')).toBe('false');
			expect(params.get('auth_method')).toBe('sso');
		});

		it('builds query string with user_id and email only', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAdminLoginAttempts(
				{ user_id: 'user-42', email: 'test@example.com' },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('user_id')).toBe('user-42');
			expect(params.get('email')).toBe('test@example.com');
			expect(params.has('cursor')).toBe(false);
			expect(params.has('limit')).toBe(false);
			expect(params.has('auth_method')).toBe(false);
		});

		it('builds query string with auth_method filter', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAdminLoginAttempts({ auth_method: 'password' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('auth_method')).toBe('password');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValue({ ok: false, status: 403 });

			await expect(getAdminLoginAttempts({}, mockFetch)).rejects.toThrow(
				'Failed to fetch admin login attempts: 403'
			);
		});

		it('throws on fetch network error', async () => {
			mockFetch.mockRejectedValue(new Error('Connection refused'));

			await expect(getAdminLoginAttempts({}, mockFetch)).rejects.toThrow('Connection refused');
		});
	});

	describe('getAdminLoginStats', () => {
		const mockStats = {
			total_attempts: 100,
			successful_attempts: 90,
			failed_attempts: 10,
			success_rate: 0.9,
			failure_reasons: [{ reason: 'invalid_password', count: 8 }],
			hourly_distribution: [{ hour: 9, count: 15 }],
			unique_users: 50,
			new_device_logins: 5,
			new_location_logins: 3
		};

		it('calls /api/audit/admin/stats with start_date and end_date', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockStats) });

			const result = await getAdminLoginStats('2024-01-01', '2024-01-31', mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/audit/admin/stats?');
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('start_date')).toBe('2024-01-01');
			expect(params.get('end_date')).toBe('2024-01-31');
			expect(result).toEqual(mockStats);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValue({ ok: false, status: 500 });

			await expect(getAdminLoginStats('2024-01-01', '2024-01-31', mockFetch)).rejects.toThrow(
				'Failed to fetch admin login stats: 500'
			);
		});

		it('throws on fetch network error', async () => {
			mockFetch.mockRejectedValue(new Error('Timeout'));

			await expect(
				getAdminLoginStats('2024-01-01', '2024-01-31', mockFetch)
			).rejects.toThrow('Timeout');
		});
	});

	// --- Server-side functions ---

	describe('fetchLoginHistory', () => {
		it('calls apiClient with GET /audit/login-history and no params', async () => {
			const mockResponse = { items: [], total: 0, next_cursor: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await fetchLoginHistory({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/audit/login-history', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes query params in the path', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, next_cursor: null });

			await fetchLoginHistory(
				{ cursor: 'c1', limit: 20, success: true },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/audit/login-history?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('cursor')).toBe('c1');
			expect(params.get('limit')).toBe('20');
			expect(params.get('success')).toBe('true');
		});
	});

	describe('fetchAdminLoginAttempts', () => {
		it('calls apiClient with GET /admin/audit/login-attempts', async () => {
			const mockResponse = { items: [], total: 0, next_cursor: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await fetchAdminLoginAttempts({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/audit/login-attempts', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes all query params in the path', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, next_cursor: null });

			await fetchAdminLoginAttempts(
				{
					user_id: 'u1',
					email: 'e@x.com',
					auth_method: 'mfa',
					success: false
				},
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('user_id')).toBe('u1');
			expect(params.get('email')).toBe('e@x.com');
			expect(params.get('auth_method')).toBe('mfa');
			expect(params.get('success')).toBe('false');
		});
	});

	describe('fetchAdminLoginStats', () => {
		it('calls apiClient with GET /admin/audit/login-attempts/stats', async () => {
			const mockStats = {
				total_attempts: 50,
				successful_attempts: 45,
				failed_attempts: 5,
				success_rate: 0.9,
				failure_reasons: [],
				hourly_distribution: [],
				unique_users: 20,
				new_device_logins: 2,
				new_location_logins: 1
			};
			mockApiClient.mockResolvedValue(mockStats);

			const result = await fetchAdminLoginStats('2024-01-01', '2024-12-31', token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/admin/audit/login-attempts/stats?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('start_date')).toBe('2024-01-01');
			expect(params.get('end_date')).toBe('2024-12-31');
			expect(result).toEqual(mockStats);
		});
	});
});
