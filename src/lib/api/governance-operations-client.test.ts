import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		statusText: ok ? 'OK' : `${status}`,
		json: () => Promise.resolve(data)
	};
}

describe('governance-operations-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- SLA Policies ---

	describe('fetchSlaPolicies', () => {
		it('fetches from /api/governance/sla-policies with default params', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSlaPolicies } = await import('./governance-operations-client');

			const result = await fetchSlaPolicies({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sla-policies');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchSlaPolicies } = await import('./governance-operations-client');

			await fetchSlaPolicies({ status: 'active', category: 'review', page: 1, page_size: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('category=review');
			expect(calledUrl).toContain('page=1');
			expect(calledUrl).toContain('page_size=10');
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSlaPolicies } = await import('./governance-operations-client');

			await expect(fetchSlaPolicies({}, mockFetch)).rejects.toThrow('Failed to fetch SLA policies');
		});
	});

	describe('fetchSlaPolicy', () => {
		it('fetches from /api/governance/sla-policies/:id', async () => {
			const data = { id: 'sla-1', name: 'Test SLA' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSlaPolicy } = await import('./governance-operations-client');

			const result = await fetchSlaPolicy('sla-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sla-policies/sla-1');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchSlaPolicy } = await import('./governance-operations-client');

			await expect(fetchSlaPolicy('sla-1', mockFetch)).rejects.toThrow('Failed to fetch SLA policy');
		});
	});

	describe('deleteSlaPolicy (client)', () => {
		it('sends DELETE to /api/governance/sla-policies/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { deleteSlaPolicy } = await import('./governance-operations-client');

			await deleteSlaPolicy('sla-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sla-policies/sla-1', {
				method: 'DELETE'
			});
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { deleteSlaPolicy } = await import('./governance-operations-client');

			await expect(deleteSlaPolicy('sla-1', mockFetch)).rejects.toThrow('Failed to delete SLA policy');
		});
	});

	// --- Ticketing Configuration ---

	describe('fetchTicketingConfigs', () => {
		it('fetches from /api/governance/ticketing-configuration', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchTicketingConfigs } = await import('./governance-operations-client');

			const result = await fetchTicketingConfigs({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/ticketing-configuration');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchTicketingConfigs } = await import('./governance-operations-client');

			await expect(fetchTicketingConfigs({}, mockFetch)).rejects.toThrow('Failed to fetch ticketing configurations');
		});
	});

	describe('fetchTicketingConfig', () => {
		it('fetches from /api/governance/ticketing-configuration/:id', async () => {
			const data = { id: 'tc-1', name: 'Jira' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchTicketingConfig } = await import('./governance-operations-client');

			const result = await fetchTicketingConfig('tc-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/ticketing-configuration/tc-1');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchTicketingConfig } = await import('./governance-operations-client');

			await expect(fetchTicketingConfig('tc-1', mockFetch)).rejects.toThrow('Failed to fetch ticketing configuration');
		});
	});

	describe('deleteTicketingConfig (client)', () => {
		it('sends DELETE to /api/governance/ticketing-configuration/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { deleteTicketingConfig } = await import('./governance-operations-client');

			await deleteTicketingConfig('tc-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/ticketing-configuration/tc-1', {
				method: 'DELETE'
			});
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { deleteTicketingConfig } = await import('./governance-operations-client');

			await expect(deleteTicketingConfig('tc-1', mockFetch)).rejects.toThrow('Failed to delete ticketing configuration');
		});
	});

	// --- Bulk Actions ---

	describe('fetchBulkActions', () => {
		it('fetches from /api/governance/bulk-actions', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBulkActions } = await import('./governance-operations-client');

			const result = await fetchBulkActions({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-actions');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchBulkActions } = await import('./governance-operations-client');

			await fetchBulkActions({ action_type: 'grant', status: 'pending' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('action_type=grant');
			expect(calledUrl).toContain('status=pending');
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchBulkActions } = await import('./governance-operations-client');

			await expect(fetchBulkActions({}, mockFetch)).rejects.toThrow('Failed to fetch bulk actions');
		});
	});

	describe('fetchBulkAction', () => {
		it('fetches from /api/governance/bulk-actions/:id', async () => {
			const data = { id: 'ba-1', name: 'Test Action' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBulkAction } = await import('./governance-operations-client');

			const result = await fetchBulkAction('ba-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-actions/ba-1');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchBulkAction } = await import('./governance-operations-client');

			await expect(fetchBulkAction('ba-1', mockFetch)).rejects.toThrow('Failed to fetch bulk action');
		});
	});

	describe('previewBulkAction (client)', () => {
		it('sends POST to /api/governance/bulk-actions/:id/preview', async () => {
			const data = { affected_count: 5, affected_items: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { previewBulkAction } = await import('./governance-operations-client');

			const result = await previewBulkAction('ba-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-actions/ba-1/preview', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { previewBulkAction } = await import('./governance-operations-client');

			await expect(previewBulkAction('ba-1', mockFetch)).rejects.toThrow('Failed to preview bulk action');
		});
	});

	describe('executeBulkAction (client)', () => {
		it('sends POST to /api/governance/bulk-actions/:id/execute', async () => {
			const data = { id: 'ba-1', status: 'completed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { executeBulkAction } = await import('./governance-operations-client');

			const result = await executeBulkAction('ba-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-actions/ba-1/execute', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { executeBulkAction } = await import('./governance-operations-client');

			await expect(executeBulkAction('ba-1', mockFetch)).rejects.toThrow('Failed to execute bulk action');
		});
	});

	describe('cancelBulkAction (client)', () => {
		it('sends POST to /api/governance/bulk-actions/:id/cancel', async () => {
			const data = { id: 'ba-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelBulkAction } = await import('./governance-operations-client');

			const result = await cancelBulkAction('ba-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-actions/ba-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { cancelBulkAction } = await import('./governance-operations-client');

			await expect(cancelBulkAction('ba-1', mockFetch)).rejects.toThrow('Failed to cancel bulk action');
		});
	});

	describe('validateExpression', () => {
		it('sends POST to /api/governance/bulk-actions/validate', async () => {
			const data = { valid: true, matched_count: 10 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { validateExpression } = await import('./governance-operations-client');

			const result = await validateExpression('users.status = "active"', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-actions/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ expression: 'users.status = "active"' })
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { validateExpression } = await import('./governance-operations-client');

			await expect(validateExpression('bad expr', mockFetch)).rejects.toThrow('Failed to validate expression');
		});
	});

	// --- Failed Operations ---

	describe('fetchFailedOperations', () => {
		it('fetches from /api/governance/failed-operations', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchFailedOperations } = await import('./governance-operations-client');

			const result = await fetchFailedOperations({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/failed-operations');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchFailedOperations } = await import('./governance-operations-client');

			await expect(fetchFailedOperations({}, mockFetch)).rejects.toThrow('Failed to fetch failed operations');
		});
	});

	describe('fetchFailedOperationCount', () => {
		it('fetches from /api/governance/failed-operations/count', async () => {
			const data = { count: 5 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchFailedOperationCount } = await import('./governance-operations-client');

			const result = await fetchFailedOperationCount(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/failed-operations/count');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchFailedOperationCount } = await import('./governance-operations-client');

			await expect(fetchFailedOperationCount(mockFetch)).rejects.toThrow('Failed to fetch failed operation count');
		});
	});

	describe('processFailedOperationRetries', () => {
		it('sends POST to /api/governance/failed-operations/process-retries', async () => {
			const data = { processed: 3 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { processFailedOperationRetries } = await import('./governance-operations-client');

			const result = await processFailedOperationRetries(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/failed-operations/process-retries', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { processFailedOperationRetries } = await import('./governance-operations-client');

			await expect(processFailedOperationRetries(mockFetch)).rejects.toThrow('Failed to process retries');
		});
	});

	// --- Bulk State Operations ---

	describe('fetchBulkStateOperations', () => {
		it('fetches from /api/governance/bulk-state-operations with params', async () => {
			const data = { items: [{ id: 'bso-1' }], total: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBulkStateOperations } = await import('./governance-operations-client');

			const result = await fetchBulkStateOperations({ status: 'queued', page_size: 50 }, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-state-operations?status=queued&page_size=50');
			expect(result).toEqual(data);
		});

		it('fetches with empty params', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBulkStateOperations } = await import('./governance-operations-client');

			const result = await fetchBulkStateOperations({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-state-operations');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchBulkStateOperations } = await import('./governance-operations-client');

			await expect(fetchBulkStateOperations({}, mockFetch)).rejects.toThrow('Failed to fetch bulk state operations');
		});
	});

	describe('createBulkStateOperation (client)', () => {
		it('sends POST to /api/governance/bulk-state-operations', async () => {
			const body = { object_type: 'user', target_state: 'disabled', filter_expression: 'expr' };
			const data = { id: 'bso-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createBulkStateOperation } = await import('./governance-operations-client');

			const result = await createBulkStateOperation(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-state-operations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createBulkStateOperation } = await import('./governance-operations-client');

			await expect(
				createBulkStateOperation(
					{ object_type: 'user', target_state: 'x', filter_expression: 'y' },
					mockFetch
				)
			).rejects.toThrow('Failed to create bulk state operation');
		});
	});

	describe('fetchBulkStateOperation', () => {
		it('fetches from /api/governance/bulk-state-operations/:id', async () => {
			const data = { id: 'bso-1', status: 'pending' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBulkStateOperation } = await import('./governance-operations-client');

			const result = await fetchBulkStateOperation('bso-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-state-operations/bso-1');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchBulkStateOperation } = await import('./governance-operations-client');

			await expect(fetchBulkStateOperation('bso-1', mockFetch)).rejects.toThrow('Failed to fetch bulk state operation');
		});
	});

	describe('cancelBulkStateOperation (client)', () => {
		it('sends POST to /api/governance/bulk-state-operations/:id/cancel', async () => {
			const data = { id: 'bso-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelBulkStateOperation } = await import('./governance-operations-client');

			const result = await cancelBulkStateOperation('bso-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-state-operations/bso-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { cancelBulkStateOperation } = await import('./governance-operations-client');

			await expect(cancelBulkStateOperation('bso-1', mockFetch)).rejects.toThrow('Failed to cancel bulk state operation');
		});
	});

	describe('processBulkStateOperations (client)', () => {
		it('sends POST to /api/governance/bulk-state-operations/process', async () => {
			const data = { processed: 2 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { processBulkStateOperations } = await import('./governance-operations-client');

			const result = await processBulkStateOperations(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/bulk-state-operations/process', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { processBulkStateOperations } = await import('./governance-operations-client');

			await expect(processBulkStateOperations(mockFetch)).rejects.toThrow('Failed to process bulk state operations');
		});
	});

	// --- Scheduled Transitions ---

	describe('fetchScheduledTransitions', () => {
		it('fetches from /api/governance/scheduled-transitions', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScheduledTransitions } = await import('./governance-operations-client');

			const result = await fetchScheduledTransitions({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/scheduled-transitions');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchScheduledTransitions } = await import('./governance-operations-client');

			await fetchScheduledTransitions({ status: 'pending', object_type: 'user' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('object_type=user');
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchScheduledTransitions } = await import('./governance-operations-client');

			await expect(fetchScheduledTransitions({}, mockFetch)).rejects.toThrow('Failed to fetch scheduled transitions');
		});
	});

	describe('fetchScheduledTransition', () => {
		it('fetches from /api/governance/scheduled-transitions/:id', async () => {
			const data = { id: 'st-1', status: 'pending' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScheduledTransition } = await import('./governance-operations-client');

			const result = await fetchScheduledTransition('st-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/scheduled-transitions/st-1');
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchScheduledTransition } = await import('./governance-operations-client');

			await expect(fetchScheduledTransition('st-1', mockFetch)).rejects.toThrow('Failed to fetch scheduled transition');
		});
	});

	describe('cancelScheduledTransition', () => {
		it('sends POST to /api/governance/scheduled-transitions/:id/cancel', async () => {
			const data = { id: 'st-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelScheduledTransition } = await import('./governance-operations-client');

			const result = await cancelScheduledTransition('st-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/scheduled-transitions/st-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on error response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { cancelScheduledTransition } = await import('./governance-operations-client');

			await expect(cancelScheduledTransition('st-1', mockFetch)).rejects.toThrow('Failed to cancel scheduled transition');
		});
	});
});
