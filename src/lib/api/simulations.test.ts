import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createPolicySimulation,
	listPolicySimulations,
	getPolicySimulation,
	executePolicySimulation,
	deletePolicySimulation,
	cancelPolicySimulation,
	archivePolicySimulation,
	restorePolicySimulation,
	updatePolicySimulationNotes,
	listPolicySimulationResults,
	checkPolicySimulationStaleness,
	createBatchSimulation,
	listBatchSimulations,
	getBatchSimulation,
	executeBatchSimulation,
	applyBatchSimulation,
	cancelBatchSimulation,
	archiveBatchSimulation,
	restoreBatchSimulation,
	updateBatchSimulationNotes,
	listBatchSimulationResults,
	deleteBatchSimulation,
	createSimulationComparison,
	listSimulationComparisons,
	getSimulationComparison,
	deleteSimulationComparison
} from './simulations';

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

describe('Simulations API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';
	const simId = 'sim-123';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Policy Simulations ---

	describe('createPolicySimulation', () => {
		it('calls POST /governance/simulations/policy with body', async () => {
			const body = { name: 'SoD Test', simulation_type: 'sod_rule', policy_config: '{}' };
			const mockResponse = { id: 'ps-1', name: 'SoD Test', status: 'draft', simulation_type: 'sod_rule' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createPolicySimulation(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/simulations/policy', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('listPolicySimulations', () => {
		it('calls GET /governance/simulations/policy with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listPolicySimulations({}, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toBe('/governance/simulations/policy');
			expect(result).toEqual(mockResponse);
		});

		it('calls GET /governance/simulations/policy with query params', async () => {
			const mockResponse = { items: [{ id: 'ps-1' }], total: 1, limit: 10, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			await listPolicySimulations(
				{ simulation_type: 'sod_rule', status: 'completed', limit: 10, offset: 0 },
				token, tenantId, mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/simulations/policy?');
			expect(calledPath).toContain('simulation_type=sod_rule');
			expect(calledPath).toContain('status=completed');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=0');
		});

		it('includes include_archived in query params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listPolicySimulations({ include_archived: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('include_archived=true');
		});
	});

	describe('getPolicySimulation', () => {
		it('calls GET /governance/simulations/policy/:id', async () => {
			const mockResponse = { id: simId, name: 'Test', status: 'draft' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getPolicySimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}`, {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('executePolicySimulation', () => {
		it('calls POST /governance/simulations/policy/:id/execute with optional body', async () => {
			const mockResponse = { id: simId, name: 'Test', status: 'running' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await executePolicySimulation(simId, { user_ids: ['u1', 'u2'] }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}/execute`, {
				method: 'POST', token, tenantId, body: { user_ids: ['u1', 'u2'] }, fetch: mockFetch
			});
			expect(result.status).toBe('running');
		});

		it('calls POST with empty body when body is undefined', async () => {
			const mockResponse = { id: simId, name: 'Test', status: 'running' };
			mockApiClient.mockResolvedValue(mockResponse);

			await executePolicySimulation(simId, undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}/execute`, {
				method: 'POST', token, tenantId, body: {}, fetch: mockFetch
			});
		});
	});

	describe('cancelPolicySimulation', () => {
		it('calls POST /governance/simulations/policy/:id/cancel', async () => {
			const mockResponse = { id: simId, status: 'cancelled' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await cancelPolicySimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}/cancel`, {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.status).toBe('cancelled');
		});
	});

	describe('archivePolicySimulation', () => {
		it('calls POST /governance/simulations/policy/:id/archive', async () => {
			const mockResponse = { id: simId, status: 'archived' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await archivePolicySimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}/archive`, {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.status).toBe('archived');
		});
	});

	describe('restorePolicySimulation', () => {
		it('calls POST /governance/simulations/policy/:id/restore', async () => {
			const mockResponse = { id: simId, status: 'completed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await restorePolicySimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}/restore`, {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.status).toBe('completed');
		});
	});

	describe('updatePolicySimulationNotes', () => {
		it('calls PATCH /governance/simulations/policy/:id/notes', async () => {
			const mockResponse = { id: simId, notes: 'Updated notes' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updatePolicySimulationNotes(simId, 'Updated notes', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}/notes`, {
				method: 'PATCH', token, tenantId, body: { notes: 'Updated notes' }, fetch: mockFetch
			});
			expect(result.notes).toBe('Updated notes');
		});
	});

	describe('listPolicySimulationResults', () => {
		it('calls GET /governance/simulations/policy/:id/results with params', async () => {
			const mockResponse = { items: [{ id: 'r1' }], total: 1, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listPolicySimulationResults(
				simId,
				{ impact_type: 'sod_violation', severity: 'high', limit: 20, offset: 0 },
				token, tenantId, mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain(`/governance/simulations/policy/${simId}/results`);
			expect(calledPath).toContain('impact_type=sod_violation');
			expect(calledPath).toContain('severity=high');
			expect(result.items).toHaveLength(1);
		});
	});

	describe('checkPolicySimulationStaleness', () => {
		it('calls GET /governance/simulations/policy/:id/staleness', async () => {
			const mockResponse = { is_stale: false, last_checked: '2026-02-01T00:00:00Z' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await checkPolicySimulationStaleness(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}/staleness`, {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result.is_stale).toBe(false);
		});
	});

	describe('deletePolicySimulation', () => {
		it('calls DELETE /governance/simulations/policy/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deletePolicySimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/policy/${simId}`, {
				method: 'DELETE', token, tenantId, fetch: mockFetch
			});
		});
	});

	// --- Batch Simulations ---

	describe('createBatchSimulation', () => {
		it('calls POST /governance/simulations/batch with body', async () => {
			const body = { name: 'Batch Test', batch_type: 'role_add', selection_mode: 'user_list' };
			const mockResponse = { id: 'bs-1', name: 'Batch Test', status: 'draft' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createBatchSimulation(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/simulations/batch', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('listBatchSimulations', () => {
		it('calls GET /governance/simulations/batch with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listBatchSimulations({}, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toBe('/governance/simulations/batch');
			expect(result).toEqual(mockResponse);
		});

		it('calls GET /governance/simulations/batch with query params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 });

			await listBatchSimulations(
				{ batch_type: 'role_add', status: 'completed', limit: 10, offset: 5 },
				token, tenantId, mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('batch_type=role_add');
			expect(calledPath).toContain('status=completed');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=5');
		});
	});

	describe('getBatchSimulation', () => {
		it('calls GET /governance/simulations/batch/:id', async () => {
			const mockResponse = { id: simId, name: 'Batch', status: 'draft' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getBatchSimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}`, {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('executeBatchSimulation', () => {
		it('calls POST /governance/simulations/batch/:id/execute', async () => {
			const mockResponse = { id: simId, status: 'running' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await executeBatchSimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}/execute`, {
				method: 'POST', token, tenantId, body: {}, fetch: mockFetch
			});
			expect(result.status).toBe('running');
		});
	});

	describe('applyBatchSimulation', () => {
		it('calls POST /governance/simulations/batch/:id/apply with body', async () => {
			const body = { justification: 'Approved by manager', acknowledge_scope: true };
			const mockResponse = { id: simId, status: 'applied' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await applyBatchSimulation(simId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}/apply`, {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result.status).toBe('applied');
		});
	});

	describe('cancelBatchSimulation', () => {
		it('calls POST /governance/simulations/batch/:id/cancel', async () => {
			const mockResponse = { id: simId, status: 'cancelled' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await cancelBatchSimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}/cancel`, {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.status).toBe('cancelled');
		});
	});

	describe('archiveBatchSimulation', () => {
		it('calls POST /governance/simulations/batch/:id/archive', async () => {
			const mockResponse = { id: simId, status: 'archived' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await archiveBatchSimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}/archive`, {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.status).toBe('archived');
		});
	});

	describe('restoreBatchSimulation', () => {
		it('calls POST /governance/simulations/batch/:id/restore', async () => {
			const mockResponse = { id: simId, status: 'completed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await restoreBatchSimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}/restore`, {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.status).toBe('completed');
		});
	});

	describe('updateBatchSimulationNotes', () => {
		it('calls PATCH /governance/simulations/batch/:id/notes', async () => {
			const mockResponse = { id: simId, notes: 'New notes' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateBatchSimulationNotes(simId, 'New notes', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}/notes`, {
				method: 'PATCH', token, tenantId, body: { notes: 'New notes' }, fetch: mockFetch
			});
			expect(result.notes).toBe('New notes');
		});
	});

	describe('listBatchSimulationResults', () => {
		it('calls GET /governance/simulations/batch/:id/results with params', async () => {
			const mockResponse = { items: [{ id: 'br-1' }], total: 1, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listBatchSimulationResults(
				simId,
				{ user_id: 'user-1', has_warnings: true, limit: 20, offset: 0 },
				token, tenantId, mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain(`/governance/simulations/batch/${simId}/results`);
			expect(calledPath).toContain('user_id=user-1');
			expect(calledPath).toContain('has_warnings=true');
			expect(result.items).toHaveLength(1);
		});
	});

	describe('deleteBatchSimulation', () => {
		it('calls DELETE /governance/simulations/batch/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteBatchSimulation(simId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/simulations/batch/${simId}`, {
				method: 'DELETE', token, tenantId, fetch: mockFetch
			});
		});
	});

	// --- Comparisons ---

	describe('createSimulationComparison', () => {
		it('calls POST /governance/simulations/comparisons with body', async () => {
			const body = { name: 'Compare A vs B', comparison_type: 'simulation_vs_simulation' };
			const mockResponse = { id: 'cmp-1', name: 'Compare A vs B', status: 'pending' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createSimulationComparison(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/simulations/comparisons', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('listSimulationComparisons', () => {
		it('calls GET /governance/simulations/comparisons with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSimulationComparisons({}, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toBe('/governance/simulations/comparisons');
			expect(result).toEqual(mockResponse);
		});

		it('calls GET /governance/simulations/comparisons with query params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 });

			await listSimulationComparisons(
				{ comparison_type: 'simulation_vs_current', created_by: 'admin-1', limit: 10, offset: 0 },
				token, tenantId, mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('comparison_type=simulation_vs_current');
			expect(calledPath).toContain('created_by=admin-1');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=0');
		});
	});

	describe('getSimulationComparison', () => {
		it('calls GET /governance/simulations/comparisons/:id', async () => {
			const mockResponse = { id: 'cmp-1', name: 'Comparison', status: 'completed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getSimulationComparison('cmp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/simulations/comparisons/cmp-1', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteSimulationComparison', () => {
		it('calls DELETE /governance/simulations/comparisons/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteSimulationComparison('cmp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/simulations/comparisons/cmp-1', {
				method: 'DELETE', token, tenantId, fetch: mockFetch
			});
		});
	});
});
