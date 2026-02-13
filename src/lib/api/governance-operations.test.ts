import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listSlaPolicies,
	createSlaPolicy,
	getSlaPolicy,
	updateSlaPolicy,
	deleteSlaPolicy,
	listTicketingConfigs,
	createTicketingConfig,
	getTicketingConfig,
	updateTicketingConfig,
	deleteTicketingConfig,
	testTicketingConfig,
	listBulkActions,
	createBulkAction,
	getBulkAction,
	updateBulkAction,
	deleteBulkAction,
	previewBulkAction,
	executeBulkAction,
	cancelBulkAction,
	validateBulkActionExpression,
	listFailedOperations,
	getFailedOperationCount,
	processFailedOperationRetries,
	createBulkStateOperation,
	listBulkStateOperations,
	getBulkStateOperation,
	cancelBulkStateOperation,
	processPendingBulkStateOperations,
	listScheduledTransitions,
	getScheduledTransition,
	cancelScheduledTransition
} from './governance-operations';

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

describe('governance-operations API', () => {
	const token = 'test-token';
	const tenantId = 'test-tenant';
	const mockFetch = vi.fn();
	const testId = 'aaaabbbb-cccc-dddd-eeee-ffffffffffff';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- SLA Policies ---

	describe('listSlaPolicies', () => {
		it('calls GET /governance/sla-policies with no params', async () => {
			const mockResponse = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSlaPolicies({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sla-policies', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes query params when provided', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listSlaPolicies(
				{ limit: 10, offset: 20 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});
	});

	describe('createSlaPolicy', () => {
		it('calls POST /governance/sla-policies with body', async () => {
			const body = {
				name: 'Test SLA',
				category: 'access_request',
				target_duration_hours: 48,
				warning_threshold_hours: 24
			};
			const mockResponse = { id: testId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createSlaPolicy(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sla-policies', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getSlaPolicy', () => {
		it('calls GET /governance/sla-policies/:id', async () => {
			const mockResponse = { id: testId, name: 'Test SLA' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getSlaPolicy(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/sla-policies/${testId}`, {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateSlaPolicy', () => {
		it('calls PUT /governance/sla-policies/:id with body', async () => {
			const body = { name: 'Updated SLA' };
			const mockResponse = { id: testId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateSlaPolicy(testId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/sla-policies/${testId}`, {
				method: 'PUT',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteSlaPolicy', () => {
		it('calls DELETE /governance/sla-policies/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteSlaPolicy(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/sla-policies/${testId}`, {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	// --- Ticketing Configurations ---

	describe('listTicketingConfigs', () => {
		it('calls GET /governance/ticketing-configurations with no params', async () => {
			const mockResponse = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listTicketingConfigs({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/ticketing-configurations', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createTicketingConfig', () => {
		it('calls POST /governance/ticketing-configurations with body', async () => {
			const body = {
				name: 'Jira Config',
				system_type: 'jira',
				base_url: 'https://jira.example.com',
				auto_create_on: 'access_request',
				enabled: true
			};
			const mockResponse = { id: testId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createTicketingConfig(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/ticketing-configurations', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getTicketingConfig', () => {
		it('calls GET /governance/ticketing-configurations/:id', async () => {
			const mockResponse = { id: testId, name: 'Jira Config' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getTicketingConfig(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/ticketing-configurations/${testId}`,
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateTicketingConfig', () => {
		it('calls PUT /governance/ticketing-configurations/:id with body', async () => {
			const body = { name: 'Updated Config' };
			const mockResponse = { id: testId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateTicketingConfig(testId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/ticketing-configurations/${testId}`,
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteTicketingConfig', () => {
		it('calls DELETE /governance/ticketing-configurations/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteTicketingConfig(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/ticketing-configurations/${testId}`,
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('testTicketingConfig', () => {
		it('calls POST /governance/ticketing-configurations/:id/test', async () => {
			mockApiClient.mockResolvedValue({ success: true });

			await testTicketingConfig(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/ticketing-configurations/${testId}/test`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Bulk Actions (admin) ---

	describe('listBulkActions', () => {
		it('calls GET /governance/admin/bulk-actions with params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listBulkActions({ action_type: 'grant' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/admin/bulk-actions');
			expect(calledPath).toContain('action_type=grant');
		});
	});

	describe('createBulkAction', () => {
		it('calls POST /governance/admin/bulk-actions with body', async () => {
			const body = {
				filter_expression: 'role = "admin"',
				action_type: 'assign_role',
				action_params: { role_id: 'r1' },
				justification: 'Bulk grant for new admins'
			};
			mockApiClient.mockResolvedValue({ id: testId, ...body });

			await createBulkAction(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/admin/bulk-actions', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('getBulkAction', () => {
		it('calls GET /governance/admin/bulk-actions/:id', async () => {
			mockApiClient.mockResolvedValue({ id: testId });

			await getBulkAction(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/admin/bulk-actions/${testId}`, {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateBulkAction', () => {
		it('calls PUT /governance/admin/bulk-actions/:id', async () => {
			const body = { name: 'Updated', action_type: 'disable' };
			const mockResponse = { id: testId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateBulkAction(testId, body, token, tenantId, mockFetch);

			expect(result).toEqual(mockResponse);
			expect(mockApiClient).toHaveBeenCalledWith(`/governance/admin/bulk-actions/${testId}`, {
				method: 'PUT',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteBulkAction', () => {
		it('calls DELETE /governance/admin/bulk-actions/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteBulkAction(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/admin/bulk-actions/${testId}`, {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('previewBulkAction', () => {
		it('calls POST /governance/admin/bulk-actions/:id/preview', async () => {
			const mockResponse = { affected_count: 5, affected_items: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await previewBulkAction(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/admin/bulk-actions/${testId}/preview`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('executeBulkAction', () => {
		it('calls POST /governance/admin/bulk-actions/:id/execute', async () => {
			mockApiClient.mockResolvedValue({ id: testId, status: 'completed' });

			await executeBulkAction(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/admin/bulk-actions/${testId}/execute`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('cancelBulkAction', () => {
		it('calls POST /governance/admin/bulk-actions/:id/cancel', async () => {
			mockApiClient.mockResolvedValue({ id: testId, status: 'cancelled' });

			await cancelBulkAction(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/admin/bulk-actions/${testId}/cancel`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('validateBulkActionExpression', () => {
		it('calls POST /governance/admin/bulk-actions/validate-expression with body', async () => {
			const body = { expression: 'users.status = "active"' };
			const mockResponse = { valid: true, matched_count: 10 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await validateBulkActionExpression(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/admin/bulk-actions/validate-expression', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Failed Operations (lifecycle dead-letter) ---

	describe('listFailedOperations', () => {
		it('calls GET /governance/lifecycle/failed-operations/dead-letter with params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listFailedOperations({ limit: 10, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/lifecycle/failed-operations/dead-letter');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=0');
		});
	});

	describe('getFailedOperationCount', () => {
		it('calls GET /governance/lifecycle/failed-operations/dead-letter/count', async () => {
			mockApiClient.mockResolvedValue({ count: 5 });

			const result = await getFailedOperationCount(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/failed-operations/dead-letter/count',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual({ count: 5 });
		});
	});

	describe('processFailedOperationRetries', () => {
		it('calls POST /governance/lifecycle/failed-operations/process-retries', async () => {
			mockApiClient.mockResolvedValue({ processed: 3 });

			const result = await processFailedOperationRetries(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/failed-operations/process-retries',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual({ processed: 3 });
		});
	});

	// --- Bulk State Operations (lifecycle) ---

	describe('createBulkStateOperation', () => {
		it('calls POST /governance/lifecycle/bulk-operations with body', async () => {
			const body = {
				object_type: 'user',
				target_state: 'disabled',
				filter_expression: 'inactive_days > 90'
			};
			mockApiClient.mockResolvedValue({ id: testId, ...body });

			await createBulkStateOperation(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/lifecycle/bulk-operations', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('listBulkStateOperations', () => {
		it('calls GET /governance/lifecycle/bulk-operations with params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listBulkStateOperations({ status: 'pending' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/lifecycle/bulk-operations');
			expect(calledPath).toContain('status=pending');
		});
	});

	describe('getBulkStateOperation', () => {
		it('calls GET /governance/lifecycle/bulk-operations/:id', async () => {
			mockApiClient.mockResolvedValue({ id: testId });

			await getBulkStateOperation(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/lifecycle/bulk-operations/${testId}`,
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('cancelBulkStateOperation', () => {
		it('calls POST /governance/lifecycle/bulk-operations/:id/cancel', async () => {
			mockApiClient.mockResolvedValue({ id: testId, status: 'cancelled' });

			await cancelBulkStateOperation(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/lifecycle/bulk-operations/${testId}/cancel`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('processPendingBulkStateOperations', () => {
		it('calls POST /governance/lifecycle/bulk-operations/process', async () => {
			mockApiClient.mockResolvedValue({ processed: 2 });

			await processPendingBulkStateOperations(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/bulk-operations/process',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Scheduled Transitions (lifecycle) ---

	describe('listScheduledTransitions', () => {
		it('calls GET /governance/lifecycle/scheduled with params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listScheduledTransitions(
				{ status: 'pending' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/lifecycle/scheduled');
			expect(calledPath).toContain('status=pending');
		});
	});

	describe('getScheduledTransition', () => {
		it('calls GET /governance/lifecycle/scheduled/:id', async () => {
			mockApiClient.mockResolvedValue({ id: testId });

			await getScheduledTransition(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/lifecycle/scheduled/${testId}`,
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('cancelScheduledTransition', () => {
		it('calls POST /governance/lifecycle/scheduled/:id/cancel', async () => {
			mockApiClient.mockResolvedValue({ id: testId, status: 'cancelled' });

			const result = await cancelScheduledTransition(testId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/lifecycle/scheduled/${testId}/cancel`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual({ id: testId, status: 'cancelled' });
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(getSlaPolicy(testId, token, tenantId, mockFetch)).rejects.toThrow(
				'Network error'
			);
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createSlaPolicy({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation error'));

			await expect(
				updateSlaPolicy(testId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Validation error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(deleteSlaPolicy(testId, token, tenantId, mockFetch)).rejects.toThrow(
				'Forbidden'
			);
		});
	});
});
