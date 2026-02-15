import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('scim-targets-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// ─── CRUD ────────────────────────────────────────────────────────────

	describe('fetchScimTargets', () => {
		it('fetches from /api/admin/scim-targets with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScimTargets } = await import('./scim-targets-client');

			const result = await fetchScimTargets({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 0, limit: 10, offset: 0 })
			);
			const { fetchScimTargets } = await import('./scim-targets-client');

			await fetchScimTargets({ status: 'active', limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchScimTargets } = await import('./scim-targets-client');

			await expect(fetchScimTargets({}, mockFetch)).rejects.toThrow(
				'Failed to fetch SCIM targets: 500'
			);
		});
	});

	describe('getScimTargetClient', () => {
		it('fetches from /api/admin/scim-targets/:id', async () => {
			const data = {
				id: 'scim-1',
				name: 'Azure AD',
				auth_method: 'bearer',
				status: 'active'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getScimTargetClient } = await import('./scim-targets-client');

			const result = await getScimTargetClient('scim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { getScimTargetClient } = await import('./scim-targets-client');

			await expect(getScimTargetClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch SCIM target: 404'
			);
		});
	});

	describe('deleteScimTargetClient', () => {
		it('sends DELETE to /api/admin/scim-targets/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { deleteScimTargetClient } = await import('./scim-targets-client');

			await deleteScimTargetClient('scim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1', {
				method: 'DELETE'
			});
		});

		it('returns void', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { deleteScimTargetClient } = await import('./scim-targets-client');

			const result = await deleteScimTargetClient('scim-1', mockFetch);

			expect(result).toBeUndefined();
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteScimTargetClient } = await import('./scim-targets-client');

			await expect(deleteScimTargetClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete SCIM target: 404'
			);
		});
	});

	// ─── Operations ──────────────────────────────────────────────────────

	describe('healthCheckScimTargetClient', () => {
		it('sends POST to /api/admin/scim-targets/:id/health-check', async () => {
			const data = { status: 'active', checked_at: '2026-01-01T00:00:00Z' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { healthCheckScimTargetClient } = await import('./scim-targets-client');

			const result = await healthCheckScimTargetClient('scim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/health-check', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { healthCheckScimTargetClient } = await import('./scim-targets-client');

			await expect(healthCheckScimTargetClient('scim-1', mockFetch)).rejects.toThrow(
				'Health check failed: 500'
			);
		});
	});

	describe('triggerScimSyncClient', () => {
		it('sends POST to /api/admin/scim-targets/:id/sync', async () => {
			const data = { sync_run_id: 'run-1', status: 'pending', message: 'Sync initiated' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { triggerScimSyncClient } = await import('./scim-targets-client');

			const result = await triggerScimSyncClient('scim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/sync', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { triggerScimSyncClient } = await import('./scim-targets-client');

			await expect(triggerScimSyncClient('scim-1', mockFetch)).rejects.toThrow(
				'Sync trigger failed: 500'
			);
		});
	});

	describe('triggerScimReconciliationClient', () => {
		it('sends POST to /api/admin/scim-targets/:id/reconcile', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { triggerScimReconciliationClient } = await import('./scim-targets-client');

			await triggerScimReconciliationClient('scim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/reconcile', {
				method: 'POST'
			});
		});

		it('returns void', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { triggerScimReconciliationClient } = await import('./scim-targets-client');

			const result = await triggerScimReconciliationClient('scim-1', mockFetch);

			expect(result).toBeUndefined();
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { triggerScimReconciliationClient } = await import('./scim-targets-client');

			await expect(triggerScimReconciliationClient('scim-1', mockFetch)).rejects.toThrow(
				'Reconciliation trigger failed: 500'
			);
		});
	});

	// ─── Sync Runs ───────────────────────────────────────────────────────

	describe('fetchScimSyncRuns', () => {
		it('fetches from /api/admin/scim-targets/:id/sync-runs', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScimSyncRuns } = await import('./scim-targets-client');

			const result = await fetchScimSyncRuns('scim-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/sync-runs');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 0, limit: 10, offset: 20 })
			);
			const { fetchScimSyncRuns } = await import('./scim-targets-client');

			await fetchScimSyncRuns('scim-1', { limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchScimSyncRuns } = await import('./scim-targets-client');

			await expect(fetchScimSyncRuns('scim-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch sync runs: 500'
			);
		});
	});

	// ─── Provisioning State ──────────────────────────────────────────────

	describe('fetchScimProvisioningState', () => {
		it('fetches from /api/admin/scim-targets/:id/provisioning-state', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScimProvisioningState } = await import('./scim-targets-client');

			const result = await fetchScimProvisioningState('scim-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/admin/scim-targets/scim-1/provisioning-state'
			);
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 0, limit: 10, offset: 0 })
			);
			const { fetchScimProvisioningState } = await import('./scim-targets-client');

			await fetchScimProvisioningState('scim-1', { limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchScimProvisioningState } = await import('./scim-targets-client');

			await expect(fetchScimProvisioningState('scim-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch provisioning state: 500'
			);
		});
	});

	describe('retryScimProvisioningClient', () => {
		it('sends POST to /api/admin/scim-targets/:id/provisioning-state/:stateId/retry', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { retryScimProvisioningClient } = await import('./scim-targets-client');

			await retryScimProvisioningClient('scim-1', 'state-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/admin/scim-targets/scim-1/provisioning-state/state-1/retry',
				{ method: 'POST' }
			);
		});

		it('returns void', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { retryScimProvisioningClient } = await import('./scim-targets-client');

			const result = await retryScimProvisioningClient('scim-1', 'state-1', mockFetch);

			expect(result).toBeUndefined();
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { retryScimProvisioningClient } = await import('./scim-targets-client');

			await expect(retryScimProvisioningClient('scim-1', 'state-1', mockFetch)).rejects.toThrow(
				'Provisioning retry failed: 500'
			);
		});
	});

	// ─── Provisioning Log ────────────────────────────────────────────────

	describe('fetchScimProvisioningLog', () => {
		it('fetches from /api/admin/scim-targets/:id/log', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScimProvisioningLog } = await import('./scim-targets-client');

			const result = await fetchScimProvisioningLog('scim-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/log');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 0, limit: 10, offset: 0 })
			);
			const { fetchScimProvisioningLog } = await import('./scim-targets-client');

			await fetchScimProvisioningLog('scim-1', { limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchScimProvisioningLog } = await import('./scim-targets-client');

			await expect(fetchScimProvisioningLog('scim-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch provisioning log: 500'
			);
		});
	});

	describe('getScimProvisioningLogDetailClient', () => {
		it('fetches from /api/admin/scim-targets/:id/log/:logId', async () => {
			const data = {
				id: 'log-1',
				target_id: 'scim-1',
				operation: 'create',
				resource_type: 'User'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getScimProvisioningLogDetailClient } = await import('./scim-targets-client');

			const result = await getScimProvisioningLogDetailClient('scim-1', 'log-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/log/log-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { getScimProvisioningLogDetailClient } = await import('./scim-targets-client');

			await expect(
				getScimProvisioningLogDetailClient('scim-1', 'bad-id', mockFetch)
			).rejects.toThrow('Failed to fetch log detail: 404');
		});
	});

	// ─── Attribute Mappings ──────────────────────────────────────────────

	describe('fetchScimTargetMappings', () => {
		it('fetches from /api/admin/scim-targets/:id/mappings', async () => {
			const data = { target_id: 'scim-1', mappings: [], total_count: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScimTargetMappings } = await import('./scim-targets-client');

			const result = await fetchScimTargetMappings('scim-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/mappings');
			expect(result).toEqual(data);
		});

		it('includes resource_type filter', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ target_id: 'scim-1', mappings: [], total_count: 0 })
			);
			const { fetchScimTargetMappings } = await import('./scim-targets-client');

			await fetchScimTargetMappings('scim-1', { resource_type: 'User' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('resource_type=User');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchScimTargetMappings } = await import('./scim-targets-client');

			await expect(fetchScimTargetMappings('scim-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch mappings: 500'
			);
		});
	});

	describe('replaceScimTargetMappingsClient', () => {
		it('sends PUT to /api/admin/scim-targets/:id/mappings with body', async () => {
			const body = {
				mappings: [
					{
						source_field: 'email',
						target_scim_path: 'emails[type eq "work"].value',
						mapping_type: 'direct',
						resource_type: 'User'
					}
				]
			};
			const data = { target_id: 'scim-1', mappings: body.mappings, total_count: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { replaceScimTargetMappingsClient } = await import('./scim-targets-client');

			const result = await replaceScimTargetMappingsClient('scim-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/admin/scim-targets/scim-1/mappings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { replaceScimTargetMappingsClient } = await import('./scim-targets-client');

			await expect(
				replaceScimTargetMappingsClient('scim-1', { mappings: [] }, mockFetch)
			).rejects.toThrow('Failed to replace mappings: 400');
		});
	});

	describe('resetScimTargetMappingDefaultsClient', () => {
		it('sends POST to /api/admin/scim-targets/:id/mappings/defaults', async () => {
			const data = {
				target_id: 'scim-1',
				mappings: [
					{
						source_field: 'username',
						target_scim_path: 'userName',
						mapping_type: 'direct',
						resource_type: 'User'
					}
				],
				total_count: 1
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { resetScimTargetMappingDefaultsClient } = await import('./scim-targets-client');

			const result = await resetScimTargetMappingDefaultsClient('scim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/admin/scim-targets/scim-1/mappings/defaults',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { resetScimTargetMappingDefaultsClient } = await import('./scim-targets-client');

			await expect(
				resetScimTargetMappingDefaultsClient('scim-1', mockFetch)
			).rejects.toThrow('Failed to reset mapping defaults: 500');
		});
	});
});
