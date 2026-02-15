import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listScimTargets,
	createScimTarget,
	getScimTarget,
	updateScimTarget,
	deleteScimTarget,
	healthCheckScimTarget,
	triggerScimSync,
	triggerScimReconciliation,
	listScimSyncRuns,
	getScimSyncRun,
	listScimProvisioningState,
	retryScimProvisioning,
	listScimProvisioningLog,
	getScimProvisioningLogDetail,
	listScimTargetMappings,
	replaceScimTargetMappings,
	resetScimTargetMappingDefaults
} from './scim-targets';

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

describe('SCIM Targets API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── CRUD ────────────────────────────────────────────────────────────

	describe('listScimTargets', () => {
		it('calls GET /admin/scim-targets with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimTargets({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listScimTargets({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listScimTargets({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});

		it('includes all params together in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 5 });

			await listScimTargets({ status: 'inactive', limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('inactive');
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('createScimTarget', () => {
		it('calls POST /admin/scim-targets with body', async () => {
			const body = {
				name: 'Azure AD SCIM',
				base_url: 'https://scim.example.com/v2',
				auth_method: 'bearer' as const,
				credentials: { type: 'bearer' as const, token: 'secret-token' }
			};
			const mockTarget = {
				id: 'scim-1',
				name: 'Azure AD SCIM',
				base_url: 'https://scim.example.com/v2',
				auth_method: 'bearer',
				status: 'inactive',
				created_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockTarget);

			const result = await createScimTarget(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets', {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.id).toBe('scim-1');
		});
	});

	describe('getScimTarget', () => {
		it('calls GET /admin/scim-targets/:id', async () => {
			const mockTarget = {
				id: 'scim-1',
				name: 'Azure AD SCIM',
				auth_method: 'bearer',
				status: 'active'
			};
			mockApiClient.mockResolvedValue(mockTarget);

			const result = await getScimTarget('scim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockTarget);
		});
	});

	describe('updateScimTarget', () => {
		it('calls PUT /admin/scim-targets/:id with body', async () => {
			const body = {
				name: 'Azure AD Updated',
				base_url: 'https://scim2.example.com/v2'
			};
			const mockTarget = {
				id: 'scim-1',
				name: 'Azure AD Updated',
				base_url: 'https://scim2.example.com/v2',
				auth_method: 'bearer',
				status: 'active'
			};
			mockApiClient.mockResolvedValue(mockTarget);

			const result = await updateScimTarget('scim-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1', {
				method: 'PUT',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.name).toBe('Azure AD Updated');
		});
	});

	describe('deleteScimTarget', () => {
		it('calls DELETE /admin/scim-targets/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteScimTarget('scim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('returns void', async () => {
			mockApiClient.mockResolvedValue(undefined);

			const result = await deleteScimTarget('scim-1', token, tenantId, mockFetch);

			expect(result).toBeUndefined();
		});
	});

	// ─── Operations ──────────────────────────────────────────────────────

	describe('healthCheckScimTarget', () => {
		it('calls POST /admin/scim-targets/:id/health-check', async () => {
			const mockResult = {
				status: 'active',
				checked_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockResult);

			const result = await healthCheckScimTarget('scim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/health-check', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.status).toBe('active');
		});
	});

	describe('triggerScimSync', () => {
		it('calls POST /admin/scim-targets/:id/sync', async () => {
			const mockResult = {
				sync_run_id: 'run-1',
				status: 'pending',
				message: 'Sync initiated'
			};
			mockApiClient.mockResolvedValue(mockResult);

			const result = await triggerScimSync('scim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/sync', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.sync_run_id).toBe('run-1');
		});
	});

	describe('triggerScimReconciliation', () => {
		it('calls POST /admin/scim-targets/:id/reconcile', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await triggerScimReconciliation('scim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/reconcile', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('returns void', async () => {
			mockApiClient.mockResolvedValue(undefined);

			const result = await triggerScimReconciliation('scim-1', token, tenantId, mockFetch);

			expect(result).toBeUndefined();
		});
	});

	// ─── Sync Runs ───────────────────────────────────────────────────────

	describe('listScimSyncRuns', () => {
		it('calls GET /admin/scim-targets/:id/sync-runs', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimSyncRuns('scim-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/sync-runs', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listScimSyncRuns('scim-1', { limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('getScimSyncRun', () => {
		it('calls GET /admin/scim-targets/:id/sync-runs/:runId', async () => {
			const mockRun = {
				id: 'run-1',
				target_id: 'scim-1',
				run_type: 'full',
				status: 'completed'
			};
			mockApiClient.mockResolvedValue(mockRun);

			const result = await getScimSyncRun('scim-1', 'run-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/sync-runs/run-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.id).toBe('run-1');
		});
	});

	// ─── Provisioning State ──────────────────────────────────────────────

	describe('listScimProvisioningState', () => {
		it('calls GET /admin/scim-targets/:id/provisioning-state', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimProvisioningState('scim-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/provisioning-state', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 });

			await listScimProvisioningState('scim-1', { limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('retryScimProvisioning', () => {
		it('calls POST /admin/scim-targets/:id/provisioning-state/:stateId/retry', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await retryScimProvisioning('scim-1', 'state-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/scim-targets/scim-1/provisioning-state/state-1/retry',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});

		it('returns void', async () => {
			mockApiClient.mockResolvedValue(undefined);

			const result = await retryScimProvisioning('scim-1', 'state-1', token, tenantId, mockFetch);

			expect(result).toBeUndefined();
		});
	});

	// ─── Provisioning Log ────────────────────────────────────────────────

	describe('listScimProvisioningLog', () => {
		it('calls GET /admin/scim-targets/:id/log', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimProvisioningLog('scim-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/log', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 });

			await listScimProvisioningLog('scim-1', { limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('getScimProvisioningLogDetail', () => {
		it('calls GET /admin/scim-targets/:id/log/:logId', async () => {
			const mockLog = {
				id: 'log-1',
				target_id: 'scim-1',
				operation: 'create',
				resource_type: 'User'
			};
			mockApiClient.mockResolvedValue(mockLog);

			const result = await getScimProvisioningLogDetail('scim-1', 'log-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/log/log-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.id).toBe('log-1');
		});
	});

	// ─── Attribute Mappings ──────────────────────────────────────────────

	describe('listScimTargetMappings', () => {
		it('calls GET /admin/scim-targets/:id/mappings with no params', async () => {
			const mockResponse = { target_id: 'scim-1', mappings: [], total_count: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScimTargetMappings('scim-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/mappings', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes resource_type filter', async () => {
			mockApiClient.mockResolvedValue({ target_id: 'scim-1', mappings: [], total_count: 0 });

			await listScimTargetMappings('scim-1', { resource_type: 'User' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('resource_type')).toBe('User');
		});
	});

	describe('replaceScimTargetMappings', () => {
		it('calls PUT /admin/scim-targets/:id/mappings with body', async () => {
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
			const mockResponse = { target_id: 'scim-1', mappings: body.mappings, total_count: 1 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await replaceScimTargetMappings('scim-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/mappings', {
				method: 'PUT',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.total_count).toBe(1);
		});
	});

	describe('resetScimTargetMappingDefaults', () => {
		it('calls POST /admin/scim-targets/:id/mappings/defaults', async () => {
			const mockResponse = {
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
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await resetScimTargetMappingDefaults('scim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/scim-targets/scim-1/mappings/defaults', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.total_count).toBe(1);
		});
	});
});
