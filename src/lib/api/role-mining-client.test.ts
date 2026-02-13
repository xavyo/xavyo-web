import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('role-mining-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Jobs ---

	describe('fetchMiningJobs', () => {
		it('fetches from /api/governance/role-mining/jobs with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMiningJobs } = await import('./role-mining-client');

			const result = await fetchMiningJobs({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs');
			expect(result).toEqual(data);
		});

		it('includes query params when provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchMiningJobs } = await import('./role-mining-client');

			await fetchMiningJobs({ status: 'completed', limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=completed');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchMiningJobs } = await import('./role-mining-client');

			await expect(fetchMiningJobs({}, mockFetch)).rejects.toThrow('Failed to fetch mining jobs: 500');
		});
	});

	describe('fetchMiningJob', () => {
		it('fetches from /api/governance/role-mining/jobs/:jobId', async () => {
			const data = { id: 'job-1', status: 'completed', algorithm: 'role_mining_v1' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMiningJob } = await import('./role-mining-client');

			const result = await fetchMiningJob('job-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs/job-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchMiningJob } = await import('./role-mining-client');

			await expect(fetchMiningJob('bad', mockFetch)).rejects.toThrow('Failed to fetch mining job: 404');
		});
	});

	describe('runJobClient', () => {
		it('sends POST to /api/governance/role-mining/jobs/:jobId/run', async () => {
			const data = { id: 'job-1', status: 'running' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { runJobClient } = await import('./role-mining-client');

			const result = await runJobClient('job-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs/job-1/run', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { runJobClient } = await import('./role-mining-client');

			await expect(runJobClient('job-1', mockFetch)).rejects.toThrow('Failed to run mining job: 500');
		});
	});

	describe('cancelJobClient', () => {
		it('sends DELETE to /api/governance/role-mining/jobs/:jobId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { cancelJobClient } = await import('./role-mining-client');

			await cancelJobClient('job-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs/job-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { cancelJobClient } = await import('./role-mining-client');

			await expect(cancelJobClient('job-1', mockFetch)).rejects.toThrow('Failed to cancel mining job: 404');
		});
	});

	describe('deleteJobClient', () => {
		it('is an alias for cancelJobClient', async () => {
			const { deleteJobClient, cancelJobClient } = await import('./role-mining-client');

			expect(deleteJobClient).toBe(cancelJobClient);
		});
	});

	// --- Candidates ---

	describe('fetchCandidates', () => {
		it('fetches from /api/governance/role-mining/jobs/:jobId/candidates', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCandidates } = await import('./role-mining-client');

			const result = await fetchCandidates('job-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs/job-1/candidates');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchCandidates } = await import('./role-mining-client');

			await fetchCandidates('job-1', { promotion_status: 'promoted', limit: 5, offset: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('promotion_status=promoted');
			expect(calledUrl).toContain('limit=5');
			expect(calledUrl).toContain('offset=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCandidates } = await import('./role-mining-client');

			await expect(fetchCandidates('job-1', {}, mockFetch)).rejects.toThrow('Failed to fetch candidates: 500');
		});
	});

	describe('promoteCandidateClient', () => {
		it('sends POST with body to /api/governance/role-mining/candidates/:id/promote', async () => {
			const body = { role_name: 'New Role', description: 'Promoted from candidate' };
			const data = { id: 'cand-1', promotion_status: 'promoted' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { promoteCandidateClient } = await import('./role-mining-client');

			const result = await promoteCandidateClient('cand-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/candidates/cand-1/promote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('sends empty object when body is undefined', async () => {
			const data = { id: 'cand-1', promotion_status: 'promoted' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { promoteCandidateClient } = await import('./role-mining-client');

			await promoteCandidateClient('cand-1', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/candidates/cand-1/promote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { promoteCandidateClient } = await import('./role-mining-client');

			await expect(promoteCandidateClient('cand-1', {}, mockFetch)).rejects.toThrow('Failed to promote candidate: 400');
		});
	});

	describe('dismissCandidateClient', () => {
		it('sends POST to /api/governance/role-mining/candidates/:id/dismiss', async () => {
			const body = { reason: 'Not relevant' };
			const data = { id: 'cand-1', promotion_status: 'dismissed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { dismissCandidateClient } = await import('./role-mining-client');

			const result = await dismissCandidateClient('cand-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/candidates/cand-1/dismiss', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { dismissCandidateClient } = await import('./role-mining-client');

			await expect(dismissCandidateClient('cand-1', {}, mockFetch)).rejects.toThrow('Failed to dismiss candidate: 422');
		});
	});

	// --- Patterns ---

	describe('fetchAccessPatterns', () => {
		it('fetches from /api/governance/role-mining/jobs/:jobId/patterns', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAccessPatterns } = await import('./role-mining-client');

			const result = await fetchAccessPatterns('job-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs/job-1/patterns');
			expect(result).toEqual(data);
		});

		it('includes min_frequency and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchAccessPatterns } = await import('./role-mining-client');

			await fetchAccessPatterns('job-1', { min_frequency: 5, limit: 10, offset: 0 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('min_frequency=5');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchAccessPatterns } = await import('./role-mining-client');

			await expect(fetchAccessPatterns('job-1', {}, mockFetch)).rejects.toThrow('Failed to fetch access patterns: 500');
		});
	});

	describe('fetchAccessPattern', () => {
		it('fetches from /api/governance/role-mining/patterns/:patternId', async () => {
			const data = { id: 'pat-1', frequency: 12, entitlements: ['ent-1', 'ent-2'] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAccessPattern } = await import('./role-mining-client');

			const result = await fetchAccessPattern('pat-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/patterns/pat-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchAccessPattern } = await import('./role-mining-client');

			await expect(fetchAccessPattern('bad', mockFetch)).rejects.toThrow('Failed to fetch access pattern: 404');
		});
	});

	// --- Excessive Privileges ---

	describe('fetchExcessivePrivileges', () => {
		it('fetches from /api/governance/role-mining/jobs/:jobId/excessive-privileges', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchExcessivePrivileges } = await import('./role-mining-client');

			const result = await fetchExcessivePrivileges('job-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs/job-1/excessive-privileges');
			expect(result).toEqual(data);
		});

		it('includes status and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchExcessivePrivileges } = await import('./role-mining-client');

			await fetchExcessivePrivileges('job-1', { status: 'flagged', limit: 25, offset: 50 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=flagged');
			expect(calledUrl).toContain('limit=25');
			expect(calledUrl).toContain('offset=50');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchExcessivePrivileges } = await import('./role-mining-client');

			await expect(fetchExcessivePrivileges('job-1', {}, mockFetch)).rejects.toThrow('Failed to fetch excessive privileges: 500');
		});
	});

	describe('reviewPrivilegeClient', () => {
		it('sends POST with body to /api/governance/role-mining/excessive-privileges/:flagId/review', async () => {
			const body = { action: 'accept', notes: 'Verified as needed' };
			const data = { id: 'flag-1', status: 'reviewed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { reviewPrivilegeClient } = await import('./role-mining-client');

			const result = await reviewPrivilegeClient('flag-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/excessive-privileges/flag-1/review', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { reviewPrivilegeClient } = await import('./role-mining-client');

			await expect(reviewPrivilegeClient('flag-1', { action: 'accept' }, mockFetch)).rejects.toThrow('Failed to review privilege: 400');
		});
	});

	// --- Consolidation ---

	describe('fetchConsolidationSuggestions', () => {
		it('fetches from /api/governance/role-mining/jobs/:jobId/consolidation', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchConsolidationSuggestions } = await import('./role-mining-client');

			const result = await fetchConsolidationSuggestions('job-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/jobs/job-1/consolidation-suggestions');
			expect(result).toEqual(data);
		});

		it('includes status and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchConsolidationSuggestions } = await import('./role-mining-client');

			await fetchConsolidationSuggestions('job-1', { status: 'pending', limit: 15, offset: 30 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('limit=15');
			expect(calledUrl).toContain('offset=30');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchConsolidationSuggestions } = await import('./role-mining-client');

			await expect(fetchConsolidationSuggestions('job-1', {}, mockFetch)).rejects.toThrow('Failed to fetch consolidation suggestions: 500');
		});
	});

	describe('dismissConsolidationClient', () => {
		it('sends POST to /api/governance/role-mining/consolidation/:id/dismiss', async () => {
			const body = { reason: 'Roles serve different purposes' };
			const data = { id: 'sug-1', status: 'dismissed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { dismissConsolidationClient } = await import('./role-mining-client');

			const result = await dismissConsolidationClient('sug-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/consolidation-suggestions/sug-1/dismiss', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('sends empty object when body is undefined', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ id: 'sug-1', status: 'dismissed' }));
			const { dismissConsolidationClient } = await import('./role-mining-client');

			await dismissConsolidationClient('sug-1', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/consolidation-suggestions/sug-1/dismiss', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { dismissConsolidationClient } = await import('./role-mining-client');

			await expect(dismissConsolidationClient('sug-1', {}, mockFetch)).rejects.toThrow('Failed to dismiss consolidation suggestion: 400');
		});
	});

	// --- Simulations ---

	describe('fetchSimulations', () => {
		it('fetches from /api/governance/role-mining/simulations with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSimulations } = await import('./role-mining-client');

			const result = await fetchSimulations({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/simulations');
			expect(result).toEqual(data);
		});

		it('includes status, scenario_type, and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchSimulations } = await import('./role-mining-client');

			await fetchSimulations({ status: 'completed', scenario_type: 'what_if', limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=completed');
			expect(calledUrl).toContain('scenario_type=what_if');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSimulations } = await import('./role-mining-client');

			await expect(fetchSimulations({}, mockFetch)).rejects.toThrow('Failed to fetch simulations: 500');
		});
	});

	describe('createSimulationClient', () => {
		it('sends POST with body to /api/governance/role-mining/simulations', async () => {
			const body = { name: 'Test Sim', scenario_type: 'what_if', parameters: {} };
			const data = { id: 'sim-1', name: 'Test Sim', status: 'draft' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createSimulationClient } = await import('./role-mining-client');

			const result = await createSimulationClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/simulations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createSimulationClient } = await import('./role-mining-client');

			await expect(createSimulationClient({} as any, mockFetch)).rejects.toThrow('Failed to create simulation: 400');
		});
	});

	describe('executeSimulationClient', () => {
		it('sends POST to /api/governance/role-mining/simulations/:id/execute', async () => {
			const data = { id: 'sim-1', status: 'running' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { executeSimulationClient } = await import('./role-mining-client');

			const result = await executeSimulationClient('sim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/simulations/sim-1/execute', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { executeSimulationClient } = await import('./role-mining-client');

			await expect(executeSimulationClient('sim-1', mockFetch)).rejects.toThrow('Failed to execute simulation: 500');
		});
	});

	describe('applySimulationClient', () => {
		it('sends POST to /api/governance/role-mining/simulations/:id/apply', async () => {
			const data = { id: 'sim-1', status: 'applied' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { applySimulationClient } = await import('./role-mining-client');

			const result = await applySimulationClient('sim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/simulations/sim-1/apply', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { applySimulationClient } = await import('./role-mining-client');

			await expect(applySimulationClient('sim-1', mockFetch)).rejects.toThrow('Failed to apply simulation: 500');
		});
	});

	describe('cancelSimulationClient', () => {
		it('sends DELETE to /api/governance/role-mining/simulations/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { cancelSimulationClient } = await import('./role-mining-client');

			await cancelSimulationClient('sim-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/simulations/sim-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { cancelSimulationClient } = await import('./role-mining-client');

			await expect(cancelSimulationClient('sim-1', mockFetch)).rejects.toThrow('Failed to cancel simulation: 404');
		});
	});

	// --- Metrics ---

	describe('fetchRoleMetrics', () => {
		it('fetches from /api/governance/role-mining/metrics with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleMetrics } = await import('./role-mining-client');

			const result = await fetchRoleMetrics({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/metrics');
			expect(result).toEqual(data);
		});

		it('includes trend_direction and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchRoleMetrics } = await import('./role-mining-client');

			await fetchRoleMetrics({ trend_direction: 'increasing', limit: 10, offset: 0 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('trend_direction=increasing');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRoleMetrics } = await import('./role-mining-client');

			await expect(fetchRoleMetrics({}, mockFetch)).rejects.toThrow('Failed to fetch role metrics: 500');
		});
	});

	describe('fetchRoleMetricsDetail', () => {
		it('fetches from /api/governance/role-mining/metrics/:roleId', async () => {
			const data = { id: 'role-1', assignment_count: 42, utilization_score: 0.85 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleMetricsDetail } = await import('./role-mining-client');

			const result = await fetchRoleMetricsDetail('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/metrics/role-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchRoleMetricsDetail } = await import('./role-mining-client');

			await expect(fetchRoleMetricsDetail('bad', mockFetch)).rejects.toThrow('Failed to fetch role metrics detail: 404');
		});
	});

	describe('calculateMetricsClient', () => {
		it('sends POST with body to /api/governance/role-mining/metrics/calculate', async () => {
			const body = { role_ids: ['role-1', 'role-2'] };
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { calculateMetricsClient } = await import('./role-mining-client');

			await calculateMetricsClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/metrics/calculate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
		});

		it('sends empty object when body is undefined', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { calculateMetricsClient } = await import('./role-mining-client');

			await calculateMetricsClient(undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/role-mining/metrics/calculate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { calculateMetricsClient } = await import('./role-mining-client');

			await expect(calculateMetricsClient({}, mockFetch)).rejects.toThrow('Failed to calculate metrics: 500');
		});
	});
});
