import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getAlerts,
	acknowledgeAlert,
	getUnacknowledgedCount
} from './alerts-client';
import { fetchAlerts, fetchAcknowledgeAlert } from './alerts';

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

describe('alerts API functions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Client-side functions ---

	describe('getAlerts', () => {
		const mockResponse = {
			items: [
				{
					id: 'alert-1',
					user_id: 'user-1',
					alert_type: 'new_device',
					severity: 'warning',
					title: 'New device detected',
					message: 'Login from a new device',
					metadata: {},
					acknowledged_at: null,
					created_at: '2024-01-01T00:00:00Z'
				}
			],
			total: 1,
			next_cursor: null,
			unacknowledged_count: 1
		};

		it('calls /api/alerts with no params', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			const result = await getAlerts({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/alerts');
			expect(result).toEqual(mockResponse);
		});

		it('builds query string with cursor and limit', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAlerts({ cursor: 'next-page', limit: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/alerts?');
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('cursor')).toBe('next-page');
			expect(params.get('limit')).toBe('20');
		});

		it('builds query string with type filter', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAlerts({ type: 'new_device' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('type')).toBe('new_device');
		});

		it('builds query string with severity filter', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAlerts({ severity: 'critical' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('severity')).toBe('critical');
		});

		it('builds query string with acknowledged=true', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAlerts({ acknowledged: true }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('acknowledged')).toBe('true');
		});

		it('builds query string with acknowledged=false', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAlerts({ acknowledged: false }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('acknowledged')).toBe('false');
		});

		it('builds query string with all params', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAlerts(
				{
					cursor: 'c1',
					limit: 10,
					type: 'failed_attempts',
					severity: 'warning',
					acknowledged: false
				},
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('cursor')).toBe('c1');
			expect(params.get('limit')).toBe('10');
			expect(params.get('type')).toBe('failed_attempts');
			expect(params.get('severity')).toBe('warning');
			expect(params.get('acknowledged')).toBe('false');
		});

		it('omits undefined params from query string', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			await getAlerts({ limit: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.has('cursor')).toBe(false);
			expect(params.has('type')).toBe(false);
			expect(params.has('severity')).toBe(false);
			expect(params.has('acknowledged')).toBe(false);
			expect(params.get('limit')).toBe('5');
		});

		it('throws with error message from response body', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ message: 'Internal server error' })
			});

			await expect(getAlerts({}, mockFetch)).rejects.toThrow('Internal server error');
		});

		it('throws with error field from response body', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 403,
				json: () => Promise.resolve({ error: 'Forbidden' })
			});

			await expect(getAlerts({}, mockFetch)).rejects.toThrow('Forbidden');
		});

		it('throws default message when response body parsing fails', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 502,
				json: () => Promise.reject(new Error('parse error'))
			});

			await expect(getAlerts({}, mockFetch)).rejects.toThrow('Failed to fetch alerts');
		});

		it('throws on fetch network error', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(getAlerts({}, mockFetch)).rejects.toThrow('Network error');
		});
	});

	describe('acknowledgeAlert', () => {
		const mockAlert = {
			id: 'alert-1',
			user_id: 'user-1',
			alert_type: 'new_device',
			severity: 'warning',
			title: 'New device detected',
			message: 'Login from a new device',
			metadata: {},
			acknowledged_at: '2024-01-01T12:00:00Z',
			created_at: '2024-01-01T00:00:00Z'
		};

		it('sends POST to /api/alerts/:id/acknowledge', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockAlert) });

			const result = await acknowledgeAlert('alert-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/alerts/alert-1/acknowledge', {
				method: 'POST'
			});
			expect(result).toEqual(mockAlert);
		});

		it('sends POST with correct alert id', async () => {
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockAlert) });

			await acknowledgeAlert('alert-xyz-123', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/alerts/alert-xyz-123/acknowledge', {
				method: 'POST'
			});
		});

		it('throws with error message from response body', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 404,
				json: () => Promise.resolve({ message: 'Alert not found' })
			});

			await expect(acknowledgeAlert('nonexistent', mockFetch)).rejects.toThrow(
				'Alert not found'
			);
		});

		it('throws with error field from response body', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 403,
				json: () => Promise.resolve({ error: 'Not authorized' })
			});

			await expect(acknowledgeAlert('alert-1', mockFetch)).rejects.toThrow('Not authorized');
		});

		it('throws default message when response body parsing fails', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('parse error'))
			});

			await expect(acknowledgeAlert('alert-1', mockFetch)).rejects.toThrow(
				'Failed to acknowledge alert'
			);
		});

		it('throws on fetch network error', async () => {
			mockFetch.mockRejectedValue(new Error('Connection reset'));

			await expect(acknowledgeAlert('alert-1', mockFetch)).rejects.toThrow(
				'Connection reset'
			);
		});
	});

	describe('getUnacknowledgedCount', () => {
		it('calls getAlerts with limit=1 and acknowledged=false and returns unacknowledged_count', async () => {
			const mockResponse = {
				items: [],
				total: 0,
				next_cursor: null,
				unacknowledged_count: 7
			};
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			const count = await getUnacknowledgedCount(mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			const params = new URLSearchParams(calledUrl.split('?')[1]);
			expect(params.get('limit')).toBe('1');
			expect(params.get('acknowledged')).toBe('false');
			expect(count).toBe(7);
		});

		it('returns 0 when no unacknowledged alerts', async () => {
			const mockResponse = {
				items: [],
				total: 0,
				next_cursor: null,
				unacknowledged_count: 0
			};
			mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });

			const count = await getUnacknowledgedCount(mockFetch);

			expect(count).toBe(0);
		});

		it('throws when underlying getAlerts fails', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('parse error'))
			});

			await expect(getUnacknowledgedCount(mockFetch)).rejects.toThrow(
				'Failed to fetch alerts'
			);
		});
	});

	// --- Server-side functions ---

	describe('fetchAlerts', () => {
		it('calls apiClient with GET /security-alerts and no params', async () => {
			const mockResponse = {
				items: [],
				total: 0,
				next_cursor: null,
				unacknowledged_count: 0
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await fetchAlerts({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/security-alerts', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes query params in the path', async () => {
			mockApiClient.mockResolvedValue({
				items: [],
				total: 0,
				next_cursor: null,
				unacknowledged_count: 0
			});

			await fetchAlerts(
				{ cursor: 'c1', limit: 10, type: 'new_device', severity: 'warning', acknowledged: false },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/security-alerts?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('cursor')).toBe('c1');
			expect(params.get('limit')).toBe('10');
			expect(params.get('type')).toBe('new_device');
			expect(params.get('severity')).toBe('warning');
			expect(params.get('acknowledged')).toBe('false');
		});
	});

	describe('fetchAcknowledgeAlert', () => {
		it('calls apiClient with POST /security-alerts/:id/acknowledge', async () => {
			const mockAlert = {
				id: 'alert-1',
				user_id: 'user-1',
				alert_type: 'new_device',
				severity: 'warning',
				title: 'New device',
				message: 'Alert message',
				metadata: {},
				acknowledged_at: '2024-01-01T12:00:00Z',
				created_at: '2024-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockAlert);

			const result = await fetchAcknowledgeAlert('alert-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/security-alerts/alert-1/acknowledge', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockAlert);
		});
	});
});
