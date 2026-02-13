import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listMiningJobs,
	getMiningJob,
	createMiningJob,
	runMiningJob,
	deleteMiningJob,
	listCandidates,
	getCandidate,
	promoteCandidate,
	dismissCandidate,
	listAccessPatterns,
	getAccessPattern,
	listExcessivePrivileges,
	getExcessivePrivilege,
	reviewExcessivePrivilege,
	listConsolidationSuggestions,
	getConsolidationSuggestion,
	dismissConsolidationSuggestion,
	listSimulations,
	getSimulation,
	createSimulation,
	executeSimulation,
	applySimulation,
	deleteSimulation,
	listRoleMetrics,
	getRoleMetrics,
	calculateRoleMetrics
} from './role-mining';

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

describe('Role Mining API', () => {
	const mockFetch = vi.fn();
	const token = 'tok';
	const tenantId = 'tid';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Jobs ---

	describe('listMiningJobs', () => {
		it('calls GET /governance/role-mining/jobs with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listMiningJobs({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMiningJobs({ status: 'running' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=running');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMiningJobs({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});
	});

	describe('getMiningJob', () => {
		it('calls GET /governance/role-mining/jobs/:jobId', async () => {
			const mockResponse = { id: 'job-1', status: 'completed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getMiningJob('job-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs/job-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createMiningJob', () => {
		it('calls POST /governance/role-mining/jobs with body', async () => {
			const body = { name: 'Q1 Mining', algorithm: 'role_clustering' };
			const mockResponse = { id: 'job-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createMiningJob(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('runMiningJob', () => {
		it('calls POST /governance/role-mining/jobs/:jobId/run with empty body', async () => {
			const mockResponse = { id: 'job-1', status: 'running' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await runMiningJob('job-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs/job-1/run',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteMiningJob', () => {
		it('calls DELETE /governance/role-mining/jobs/:jobId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteMiningJob('job-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs/job-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Candidates ---

	describe('listCandidates', () => {
		it('calls GET /governance/role-mining/jobs/:jobId/candidates with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCandidates('job-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs/job-1/candidates',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes promotion_status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCandidates('job-1', { promotion_status: 'promoted' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('promotion_status=promoted');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCandidates('job-1', { limit: 5, offset: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=5');
			expect(calledPath).toContain('offset=10');
		});
	});

	describe('getCandidate', () => {
		it('calls GET /governance/role-mining/candidates/:candidateId', async () => {
			const mockResponse = { id: 'cand-1', name: 'Candidate Role' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCandidate('cand-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/candidates/cand-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('promoteCandidate', () => {
		it('calls POST /governance/role-mining/candidates/:candidateId/promote with body', async () => {
			const body = { role_name: 'Promoted Role' };
			const mockResponse = { id: 'cand-1', promotion_status: 'promoted' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await promoteCandidate('cand-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/candidates/cand-1/promote',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends empty object when body is undefined', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await promoteCandidate('cand-1', undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/candidates/cand-1/promote',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('dismissCandidate', () => {
		it('calls POST /governance/role-mining/candidates/:candidateId/dismiss with body', async () => {
			const body = { reason: 'Too broad' };
			const mockResponse = { id: 'cand-1', promotion_status: 'dismissed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await dismissCandidate('cand-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/candidates/cand-1/dismiss',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends empty object when body is undefined', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await dismissCandidate('cand-1', undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/candidates/cand-1/dismiss',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Access Patterns ---

	describe('listAccessPatterns', () => {
		it('calls GET /governance/role-mining/jobs/:jobId/patterns with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listAccessPatterns('job-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs/job-1/patterns',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes min_frequency query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listAccessPatterns('job-1', { min_frequency: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('min_frequency=5');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listAccessPatterns('job-1', { limit: 25, offset: 50 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=25');
			expect(calledPath).toContain('offset=50');
		});
	});

	describe('getAccessPattern', () => {
		it('calls GET /governance/role-mining/patterns/:patternId', async () => {
			const mockResponse = { id: 'pat-1', frequency: 10 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getAccessPattern('pat-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/patterns/pat-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Excessive Privileges ---

	describe('listExcessivePrivileges', () => {
		it('calls GET /governance/role-mining/jobs/:jobId/excessive-privileges with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listExcessivePrivileges('job-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs/job-1/excessive-privileges',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listExcessivePrivileges('job-1', { status: 'flagged' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=flagged');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listExcessivePrivileges('job-1', { limit: 15, offset: 30 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=15');
			expect(calledPath).toContain('offset=30');
		});
	});

	describe('getExcessivePrivilege', () => {
		it('calls GET /governance/role-mining/excessive-privileges/:flagId', async () => {
			const mockResponse = { id: 'flag-1', status: 'flagged' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getExcessivePrivilege('flag-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/excessive-privileges/flag-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('reviewExcessivePrivilege', () => {
		it('calls POST /governance/role-mining/excessive-privileges/:flagId/review with body', async () => {
			const body = { decision: 'accept', notes: 'Reviewed and accepted' };
			const mockResponse = { id: 'flag-1', status: 'reviewed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await reviewExcessivePrivilege('flag-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/excessive-privileges/flag-1/review',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Consolidation Suggestions ---

	describe('listConsolidationSuggestions', () => {
		it('calls GET /governance/role-mining/jobs/:jobId/consolidation-suggestions with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listConsolidationSuggestions('job-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/jobs/job-1/consolidation-suggestions',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listConsolidationSuggestions('job-1', { status: 'pending' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=pending');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listConsolidationSuggestions('job-1', { limit: 10, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=0');
		});
	});

	describe('getConsolidationSuggestion', () => {
		it('calls GET /governance/role-mining/consolidation-suggestions/:suggestionId', async () => {
			const mockResponse = { id: 'sug-1', status: 'pending' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getConsolidationSuggestion('sug-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/consolidation-suggestions/sug-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('dismissConsolidationSuggestion', () => {
		it('calls POST /governance/role-mining/consolidation-suggestions/:suggestionId/dismiss with body', async () => {
			const body = { reason: 'Not applicable' };
			const mockResponse = { id: 'sug-1', status: 'dismissed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await dismissConsolidationSuggestion('sug-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/consolidation-suggestions/sug-1/dismiss',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends empty object when body is undefined', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await dismissConsolidationSuggestion('sug-1', undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/consolidation-suggestions/sug-1/dismiss',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Simulations ---

	describe('listSimulations', () => {
		it('calls GET /governance/role-mining/simulations with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSimulations({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/simulations',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSimulations({ status: 'completed' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=completed');
		});

		it('includes scenario_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSimulations({ scenario_type: 'role_merge' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('scenario_type=role_merge');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSimulations({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=5');
		});

		it('includes all filters combined', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listSimulations(
				{ status: 'pending', scenario_type: 'what_if', limit: 20, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=pending');
			expect(calledPath).toContain('scenario_type=what_if');
			expect(calledPath).toContain('limit=20');
			expect(calledPath).toContain('offset=0');
		});
	});

	describe('getSimulation', () => {
		it('calls GET /governance/role-mining/simulations/:simulationId', async () => {
			const mockResponse = { id: 'sim-1', status: 'completed', scenario_type: 'role_merge' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getSimulation('sim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/simulations/sim-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createSimulation', () => {
		it('calls POST /governance/role-mining/simulations with body', async () => {
			const body = { name: 'Role Merge Simulation', scenario_type: 'role_merge' };
			const mockResponse = { id: 'sim-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createSimulation(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/simulations',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('executeSimulation', () => {
		it('calls POST /governance/role-mining/simulations/:simulationId/execute with empty body', async () => {
			const mockResponse = { id: 'sim-1', status: 'running' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await executeSimulation('sim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/simulations/sim-1/execute',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('applySimulation', () => {
		it('calls POST /governance/role-mining/simulations/:simulationId/apply with empty body', async () => {
			const mockResponse = { id: 'sim-1', status: 'applied' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await applySimulation('sim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/simulations/sim-1/apply',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteSimulation', () => {
		it('calls DELETE /governance/role-mining/simulations/:simulationId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteSimulation('sim-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/simulations/sim-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Metrics ---

	describe('listRoleMetrics', () => {
		it('calls GET /governance/role-mining/metrics with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listRoleMetrics({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/metrics',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes trend_direction query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listRoleMetrics({ trend_direction: 'increasing' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('trend_direction=increasing');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listRoleMetrics({ limit: 50, offset: 100 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=50');
			expect(calledPath).toContain('offset=100');
		});
	});

	describe('getRoleMetrics', () => {
		it('calls GET /governance/role-mining/metrics/:roleId', async () => {
			const mockResponse = { id: 'role-1', usage_count: 42 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getRoleMetrics('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/metrics/role-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('calculateRoleMetrics', () => {
		it('calls POST /governance/role-mining/metrics/calculate with body', async () => {
			const body = { role_ids: ['role-1', 'role-2'] };
			const mockResponse = { calculated: 2, results: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await calculateRoleMetrics(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/metrics/calculate',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends empty object when body is undefined', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await calculateRoleMetrics(undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/role-mining/metrics/calculate',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(getMiningJob('job-1', token, tenantId, mockFetch)).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createMiningJob({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				deleteMiningJob('job-1', token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});
	});
});
