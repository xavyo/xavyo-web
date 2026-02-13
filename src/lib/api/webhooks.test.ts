import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listWebhookEventTypes,
	listWebhookSubscriptions,
	createWebhookSubscription,
	getWebhookSubscription,
	updateWebhookSubscription,
	deleteWebhookSubscription,
	listWebhookDeliveries,
	listDlqEntries,
	replayDlqEntry,
	deleteDlqEntry
} from './webhooks';

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

describe('Webhooks API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── listWebhookEventTypes ───────────────────────────────────────────────

	describe('listWebhookEventTypes', () => {
		const mockResponse = {
			event_types: [
				{
					event_type: 'user.created',
					category: 'identity',
					description: 'Fired when a user is created'
				},
				{
					event_type: 'user.deleted',
					category: 'identity',
					description: 'Fired when a user is deleted'
				}
			]
		};

		it('calls GET /webhooks/event-types', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listWebhookEventTypes(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/event-types', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Forbidden', 403));

			await expect(listWebhookEventTypes(token, tenantId, mockFetch)).rejects.toThrow(
				'Forbidden'
			);
		});
	});

	// ─── listWebhookSubscriptions ────────────────────────────────────────────

	describe('listWebhookSubscriptions', () => {
		const mockResponse = {
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		};

		it('calls GET /webhooks/subscriptions with no params', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listWebhookSubscriptions({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/subscriptions', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listWebhookSubscriptions({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/webhooks/subscriptions?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});

		it('omits undefined params from query string', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listWebhookSubscriptions({ limit: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('5');
			expect(params.has('offset')).toBe(false);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Server error', 500));

			await expect(
				listWebhookSubscriptions({}, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});
	});

	// ─── createWebhookSubscription ───────────────────────────────────────────

	describe('createWebhookSubscription', () => {
		const createData = {
			name: 'My Webhook',
			url: 'https://example.com/hook',
			event_types: ['user.created', 'user.deleted'],
			secret: 'my-secret'
		};

		const mockSubscription = {
			id: 'sub-1',
			tenant_id: tenantId,
			name: 'My Webhook',
			description: null,
			url: 'https://example.com/hook',
			event_types: ['user.created', 'user.deleted'],
			enabled: true,
			consecutive_failures: 0,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		};

		it('calls POST /webhooks/subscriptions with body', async () => {
			mockApiClient.mockResolvedValue(mockSubscription);

			const result = await createWebhookSubscription(createData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/subscriptions', {
				method: 'POST',
				body: createData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockSubscription);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Bad Request', 400));

			await expect(
				createWebhookSubscription(createData, token, tenantId, mockFetch)
			).rejects.toThrow('Bad Request');
		});
	});

	// ─── getWebhookSubscription ──────────────────────────────────────────────

	describe('getWebhookSubscription', () => {
		const mockSubscription = {
			id: 'sub-1',
			tenant_id: tenantId,
			name: 'My Webhook',
			description: null,
			url: 'https://example.com/hook',
			event_types: ['user.created'],
			enabled: true,
			consecutive_failures: 0,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		};

		it('calls GET /webhooks/subscriptions/:id', async () => {
			mockApiClient.mockResolvedValue(mockSubscription);

			const result = await getWebhookSubscription('sub-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/subscriptions/sub-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockSubscription);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(
				getWebhookSubscription('sub-999', token, tenantId, mockFetch)
			).rejects.toThrow('Not Found');
		});
	});

	// ─── updateWebhookSubscription ───────────────────────────────────────────

	describe('updateWebhookSubscription', () => {
		const updateData = {
			name: 'Updated Webhook',
			enabled: false
		};

		const mockSubscription = {
			id: 'sub-1',
			tenant_id: tenantId,
			name: 'Updated Webhook',
			description: null,
			url: 'https://example.com/hook',
			event_types: ['user.created'],
			enabled: false,
			consecutive_failures: 0,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-02T00:00:00Z'
		};

		it('calls PATCH /webhooks/subscriptions/:id with body', async () => {
			mockApiClient.mockResolvedValue(mockSubscription);

			const result = await updateWebhookSubscription(
				'sub-1',
				updateData,
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/subscriptions/sub-1', {
				method: 'PATCH',
				body: updateData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockSubscription);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Unprocessable Entity', 422));

			await expect(
				updateWebhookSubscription('sub-1', updateData, token, tenantId, mockFetch)
			).rejects.toThrow('Unprocessable Entity');
		});
	});

	// ─── deleteWebhookSubscription ───────────────────────────────────────────

	describe('deleteWebhookSubscription', () => {
		it('calls DELETE /webhooks/subscriptions/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteWebhookSubscription('sub-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/subscriptions/sub-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(
				deleteWebhookSubscription('sub-999', token, tenantId, mockFetch)
			).rejects.toThrow('Not Found');
		});
	});

	// ─── listWebhookDeliveries ───────────────────────────────────────────────

	describe('listWebhookDeliveries', () => {
		const mockResponse = {
			items: [
				{
					id: 'del-1',
					subscription_id: 'sub-1',
					event_id: 'evt-1',
					event_type: 'user.created',
					status: 'success',
					attempt_number: 1,
					response_code: 200,
					latency_ms: 150,
					error_message: null,
					created_at: '2024-01-01T00:00:00Z',
					completed_at: '2024-01-01T00:00:01Z'
				}
			],
			total: 1,
			limit: 20,
			offset: 0
		};

		it('calls GET /webhooks/subscriptions/:id/deliveries with no params', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listWebhookDeliveries('sub-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/webhooks/subscriptions/sub-1/deliveries',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listWebhookDeliveries(
				'sub-1',
				{ limit: 10, offset: 5 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/webhooks/subscriptions/sub-1/deliveries?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Server error', 500));

			await expect(
				listWebhookDeliveries('sub-1', {}, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});
	});

	// ─── listDlqEntries ─────────────────────────────────────────────────────

	describe('listDlqEntries', () => {
		const mockResponse = {
			items: [
				{
					id: 'dlq-1',
					subscription_id: 'sub-1',
					event_id: 'evt-1',
					event_type: 'user.created',
					payload: { user_id: 'user-1' },
					error_message: 'Connection refused',
					original_failure_at: '2024-01-01T00:00:00Z',
					retry_count: 3,
					created_at: '2024-01-01T00:00:00Z'
				}
			],
			total: 1,
			limit: 20,
			offset: 0
		};

		it('calls GET /webhooks/dlq with no params', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listDlqEntries({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/dlq', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listDlqEntries({ limit: 50, offset: 100 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/webhooks/dlq?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('50');
			expect(params.get('offset')).toBe('100');
		});

		it('omits undefined params from query string', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listDlqEntries({ limit: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.has('offset')).toBe(false);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Forbidden', 403));

			await expect(listDlqEntries({}, token, tenantId, mockFetch)).rejects.toThrow(
				'Forbidden'
			);
		});
	});

	// ─── replayDlqEntry ─────────────────────────────────────────────────────

	describe('replayDlqEntry', () => {
		it('calls POST /webhooks/dlq/:id/replay', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await replayDlqEntry('dlq-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/dlq/dlq-1/replay', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(
				replayDlqEntry('dlq-999', token, tenantId, mockFetch)
			).rejects.toThrow('Not Found');
		});
	});

	// ─── deleteDlqEntry ─────────────────────────────────────────────────────

	describe('deleteDlqEntry', () => {
		it('calls DELETE /webhooks/dlq/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteDlqEntry('dlq-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/webhooks/dlq/dlq-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Server error', 500));

			await expect(
				deleteDlqEntry('dlq-999', token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});
	});
});
