import { describe, it, expect, vi } from 'vitest';
import {
	fetchPolicySimulations,
	fetchPolicySimulation,
	executePolicySimulationClient,
	cancelPolicySimulationClient,
	archivePolicySimulationClient,
	restorePolicySimulationClient,
	updatePolicyNotesClient,
	deletePolicySimulationClient,
	checkPolicyStalenessClient,
	fetchBatchSimulations,
	fetchBatchSimulation,
	executeBatchSimulationClient,
	applyBatchSimulationClient,
	cancelBatchSimulationClient,
	archiveBatchSimulationClient,
	restoreBatchSimulationClient,
	updateBatchNotesClient,
	deleteBatchSimulationClient,
	fetchSimulationComparisons,
	fetchSimulationComparison,
	deleteSimulationComparisonClient
} from './simulations-client';

function mockFetch(data: unknown, ok = true, status = 200) {
	return vi.fn().mockResolvedValue({
		ok,
		status,
		json: () => Promise.resolve(data)
	}) as unknown as typeof fetch;
}

describe('simulations-client', () => {
	// === Policy Simulations ===

	describe('fetchPolicySimulations', () => {
		it('fetches policy simulations with no filters', async () => {
			const data = { items: [], total: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchPolicySimulations({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/simulations/policy');
		});

		it('fetches policy simulations with filters', async () => {
			const data = { items: [{ id: 'ps-1' }], total: 1 };
			const fetchFn = mockFetch(data);
			await fetchPolicySimulations(
				{ status: 'completed', simulation_type: 'sod_rule', limit: 10, offset: 0 },
				fetchFn
			);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('/api/governance/simulations/policy?');
			expect(url).toContain('status=completed');
			expect(url).toContain('simulation_type=sod_rule');
			expect(url).toContain('limit=10');
			expect(url).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchPolicySimulations({}, fetchFn)).rejects.toThrow(
				'Failed to fetch policy simulations: 500'
			);
		});
	});

	describe('fetchPolicySimulation', () => {
		it('fetches a single policy simulation by id', async () => {
			const data = { id: 'ps-1', name: 'Test', status: 'draft' };
			const fetchFn = mockFetch(data);
			const result = await fetchPolicySimulation('ps-1', fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/simulations/policy/ps-1');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(fetchPolicySimulation('bad-id', fetchFn)).rejects.toThrow(
				'Failed to fetch policy simulation: 404'
			);
		});
	});

	describe('executePolicySimulationClient', () => {
		it('sends POST to execute endpoint without user_ids', async () => {
			const data = { id: 'ps-1', status: 'running' };
			const fetchFn = mockFetch(data);
			const result = await executePolicySimulationClient('ps-1', undefined, fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/policy/ps-1/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('sends POST to execute endpoint with user_ids', async () => {
			const data = { id: 'ps-1', status: 'running' };
			const fetchFn = mockFetch(data);
			await executePolicySimulationClient('ps-1', ['u1', 'u2'], fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/policy/ps-1/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_ids: ['u1', 'u2'] })
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(executePolicySimulationClient('ps-1', undefined, fetchFn)).rejects.toThrow(
				'Failed to execute policy simulation: 409'
			);
		});
	});

	describe('cancelPolicySimulationClient', () => {
		it('sends POST to cancel endpoint', async () => {
			const data = { id: 'ps-1', status: 'cancelled' };
			const fetchFn = mockFetch(data);
			const result = await cancelPolicySimulationClient('ps-1', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/policy/ps-1/cancel', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(cancelPolicySimulationClient('ps-1', fetchFn)).rejects.toThrow(
				'Failed to cancel policy simulation: 409'
			);
		});
	});

	describe('archivePolicySimulationClient', () => {
		it('sends POST to archive endpoint', async () => {
			const data = { id: 'ps-1', status: 'archived' };
			const fetchFn = mockFetch(data);
			const result = await archivePolicySimulationClient('ps-1', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/policy/ps-1/archive', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(archivePolicySimulationClient('ps-1', fetchFn)).rejects.toThrow(
				'Failed to archive policy simulation: 409'
			);
		});
	});

	describe('restorePolicySimulationClient', () => {
		it('sends POST to restore endpoint', async () => {
			const data = { id: 'ps-1', status: 'completed' };
			const fetchFn = mockFetch(data);
			const result = await restorePolicySimulationClient('ps-1', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/policy/ps-1/restore', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(restorePolicySimulationClient('ps-1', fetchFn)).rejects.toThrow(
				'Failed to restore policy simulation: 404'
			);
		});
	});

	describe('updatePolicyNotesClient', () => {
		it('sends PATCH with notes body', async () => {
			const data = { id: 'ps-1', notes: 'Updated notes' };
			const fetchFn = mockFetch(data);
			const result = await updatePolicyNotesClient('ps-1', 'Updated notes', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/policy/ps-1/notes', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notes: 'Updated notes' })
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(updatePolicyNotesClient('ps-1', 'notes', fetchFn)).rejects.toThrow(
				'Failed to update policy simulation notes: 500'
			);
		});
	});

	describe('deletePolicySimulationClient', () => {
		it('sends DELETE request', async () => {
			const fetchFn = mockFetch(null);
			await deletePolicySimulationClient('ps-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/policy/ps-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(deletePolicySimulationClient('bad-id', fetchFn)).rejects.toThrow(
				'Failed to delete policy simulation: 404'
			);
		});
	});

	describe('checkPolicyStalenessClient', () => {
		it('fetches staleness check', async () => {
			const data = { is_stale: false, last_checked: '2026-02-01T00:00:00Z' };
			const fetchFn = mockFetch(data);
			const result = await checkPolicyStalenessClient('ps-1', fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/simulations/policy/ps-1/staleness');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(checkPolicyStalenessClient('ps-1', fetchFn)).rejects.toThrow(
				'Failed to check policy staleness: 500'
			);
		});
	});

	// === Batch Simulations ===

	describe('fetchBatchSimulations', () => {
		it('fetches batch simulations with no filters', async () => {
			const data = { items: [], total: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchBatchSimulations({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/simulations/batch');
		});

		it('fetches batch simulations with filters', async () => {
			const data = { items: [{ id: 'bs-1' }], total: 1 };
			const fetchFn = mockFetch(data);
			await fetchBatchSimulations(
				{ status: 'draft', batch_type: 'role_add', limit: 10, offset: 0 },
				fetchFn
			);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('/api/governance/simulations/batch?');
			expect(url).toContain('status=draft');
			expect(url).toContain('batch_type=role_add');
			expect(url).toContain('limit=10');
			expect(url).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchBatchSimulations({}, fetchFn)).rejects.toThrow(
				'Failed to fetch batch simulations: 500'
			);
		});
	});

	describe('fetchBatchSimulation', () => {
		it('fetches a single batch simulation by id', async () => {
			const data = { id: 'bs-1', name: 'Batch Test', status: 'draft' };
			const fetchFn = mockFetch(data);
			const result = await fetchBatchSimulation('bs-1', fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/simulations/batch/bs-1');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(fetchBatchSimulation('bad-id', fetchFn)).rejects.toThrow(
				'Failed to fetch batch simulation: 404'
			);
		});
	});

	describe('executeBatchSimulationClient', () => {
		it('sends POST to execute endpoint', async () => {
			const data = { id: 'bs-1', status: 'running' };
			const fetchFn = mockFetch(data);
			const result = await executeBatchSimulationClient('bs-1', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/batch/bs-1/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(executeBatchSimulationClient('bs-1', fetchFn)).rejects.toThrow(
				'Failed to execute batch simulation: 409'
			);
		});
	});

	describe('applyBatchSimulationClient', () => {
		it('sends POST to apply endpoint with body', async () => {
			const data = { id: 'bs-1', status: 'applied' };
			const fetchFn = mockFetch(data);
			const result = await applyBatchSimulationClient('bs-1', 'Approved by manager', true, fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/batch/bs-1/apply', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ justification: 'Approved by manager', acknowledge_scope: true })
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(applyBatchSimulationClient('bs-1', 'reason', true, fetchFn)).rejects.toThrow(
				'Failed to apply batch simulation: 409'
			);
		});
	});

	describe('cancelBatchSimulationClient', () => {
		it('sends POST to cancel endpoint', async () => {
			const data = { id: 'bs-1', status: 'cancelled' };
			const fetchFn = mockFetch(data);
			const result = await cancelBatchSimulationClient('bs-1', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/batch/bs-1/cancel', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(cancelBatchSimulationClient('bs-1', fetchFn)).rejects.toThrow(
				'Failed to cancel batch simulation: 409'
			);
		});
	});

	describe('archiveBatchSimulationClient', () => {
		it('sends POST to archive endpoint', async () => {
			const data = { id: 'bs-1', status: 'archived' };
			const fetchFn = mockFetch(data);
			const result = await archiveBatchSimulationClient('bs-1', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/batch/bs-1/archive', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(archiveBatchSimulationClient('bs-1', fetchFn)).rejects.toThrow(
				'Failed to archive batch simulation: 409'
			);
		});
	});

	describe('restoreBatchSimulationClient', () => {
		it('sends POST to restore endpoint', async () => {
			const data = { id: 'bs-1', status: 'completed' };
			const fetchFn = mockFetch(data);
			const result = await restoreBatchSimulationClient('bs-1', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/batch/bs-1/restore', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(restoreBatchSimulationClient('bs-1', fetchFn)).rejects.toThrow(
				'Failed to restore batch simulation: 404'
			);
		});
	});

	describe('updateBatchNotesClient', () => {
		it('sends PATCH with notes body', async () => {
			const data = { id: 'bs-1', notes: 'New notes' };
			const fetchFn = mockFetch(data);
			const result = await updateBatchNotesClient('bs-1', 'New notes', fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/batch/bs-1/notes', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notes: 'New notes' })
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(updateBatchNotesClient('bs-1', 'notes', fetchFn)).rejects.toThrow(
				'Failed to update batch simulation notes: 500'
			);
		});
	});

	describe('deleteBatchSimulationClient', () => {
		it('sends DELETE request', async () => {
			const fetchFn = mockFetch(null);
			await deleteBatchSimulationClient('bs-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/batch/bs-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(deleteBatchSimulationClient('bad-id', fetchFn)).rejects.toThrow(
				'Failed to delete batch simulation: 404'
			);
		});
	});

	// === Comparisons ===

	describe('fetchSimulationComparisons', () => {
		it('fetches comparisons with no filters', async () => {
			const data = { items: [], total: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchSimulationComparisons({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/simulations/comparisons');
		});

		it('fetches comparisons with filters', async () => {
			const data = { items: [{ id: 'cmp-1' }], total: 1 };
			const fetchFn = mockFetch(data);
			await fetchSimulationComparisons(
				{ comparison_type: 'simulation_vs_simulation', limit: 10, offset: 0 },
				fetchFn
			);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('/api/governance/simulations/comparisons?');
			expect(url).toContain('comparison_type=simulation_vs_simulation');
			expect(url).toContain('limit=10');
			expect(url).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchSimulationComparisons({}, fetchFn)).rejects.toThrow(
				'Failed to fetch simulation comparisons: 500'
			);
		});
	});

	describe('fetchSimulationComparison', () => {
		it('fetches a single comparison by id', async () => {
			const data = { id: 'cmp-1', name: 'Comparison', status: 'completed' };
			const fetchFn = mockFetch(data);
			const result = await fetchSimulationComparison('cmp-1', fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/simulations/comparisons/cmp-1');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(fetchSimulationComparison('bad-id', fetchFn)).rejects.toThrow(
				'Failed to fetch simulation comparison: 404'
			);
		});
	});

	describe('deleteSimulationComparisonClient', () => {
		it('sends DELETE request', async () => {
			const fetchFn = mockFetch(null);
			await deleteSimulationComparisonClient('cmp-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/simulations/comparisons/cmp-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(deleteSimulationComparisonClient('bad-id', fetchFn)).rejects.toThrow(
				'Failed to delete simulation comparison: 404'
			);
		});
	});
});
