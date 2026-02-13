import type {
	PolicySimulation,
	PolicySimulationResult,
	BatchSimulation,
	BatchSimulationResult,
	SimulationComparison,
	StalenessCheck
} from './types';

function buildSearchParams(params: Record<string, string | number | boolean | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

// === Policy Simulations ===

export async function fetchPolicySimulations(
	params: { status?: string; simulation_type?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: PolicySimulation[]; total: number }> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/simulations/policy${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch policy simulations: ${res.status}`);
	return res.json();
}

export async function fetchPolicySimulation(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<PolicySimulation & { results?: PolicySimulationResult[] }> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch policy simulation: ${res.status}`);
	return res.json();
}

export async function executePolicySimulationClient(
	id: string,
	userIds?: string[],
	fetchFn: typeof fetch = fetch
): Promise<PolicySimulation> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}/execute`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(userIds ? { user_ids: userIds } : {})
	});
	if (!res.ok) throw new Error(`Failed to execute policy simulation: ${res.status}`);
	return res.json();
}

export async function cancelPolicySimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<PolicySimulation> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel policy simulation: ${res.status}`);
	return res.json();
}

export async function archivePolicySimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<PolicySimulation> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}/archive`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to archive policy simulation: ${res.status}`);
	return res.json();
}

export async function restorePolicySimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<PolicySimulation> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}/restore`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to restore policy simulation: ${res.status}`);
	return res.json();
}

export async function updatePolicyNotesClient(
	id: string,
	notes: string,
	fetchFn: typeof fetch = fetch
): Promise<PolicySimulation> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}/notes`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ notes })
	});
	if (!res.ok) throw new Error(`Failed to update policy simulation notes: ${res.status}`);
	return res.json();
}

export async function deletePolicySimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete policy simulation: ${res.status}`);
}

export async function checkPolicyStalenessClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<StalenessCheck> {
	const res = await fetchFn(`/api/governance/simulations/policy/${id}/staleness`);
	if (!res.ok) throw new Error(`Failed to check policy staleness: ${res.status}`);
	return res.json();
}

// === Batch Simulations ===

export async function fetchBatchSimulations(
	params: { status?: string; batch_type?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: BatchSimulation[]; total: number }> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/simulations/batch${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch batch simulations: ${res.status}`);
	return res.json();
}

export async function fetchBatchSimulation(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BatchSimulation & { results?: BatchSimulationResult[] }> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch batch simulation: ${res.status}`);
	return res.json();
}

export async function executeBatchSimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BatchSimulation> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}/execute`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({})
	});
	if (!res.ok) throw new Error(`Failed to execute batch simulation: ${res.status}`);
	return res.json();
}

export async function applyBatchSimulationClient(
	id: string,
	justification: string,
	acknowledgeScope: boolean,
	fetchFn: typeof fetch = fetch
): Promise<BatchSimulation> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}/apply`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ justification, acknowledge_scope: acknowledgeScope })
	});
	if (!res.ok) throw new Error(`Failed to apply batch simulation: ${res.status}`);
	return res.json();
}

export async function cancelBatchSimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BatchSimulation> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel batch simulation: ${res.status}`);
	return res.json();
}

export async function archiveBatchSimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BatchSimulation> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}/archive`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to archive batch simulation: ${res.status}`);
	return res.json();
}

export async function restoreBatchSimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BatchSimulation> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}/restore`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to restore batch simulation: ${res.status}`);
	return res.json();
}

export async function updateBatchNotesClient(
	id: string,
	notes: string,
	fetchFn: typeof fetch = fetch
): Promise<BatchSimulation> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}/notes`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ notes })
	});
	if (!res.ok) throw new Error(`Failed to update batch simulation notes: ${res.status}`);
	return res.json();
}

export async function deleteBatchSimulationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/simulations/batch/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete batch simulation: ${res.status}`);
}

// === Comparisons ===

export async function fetchSimulationComparisons(
	params: { comparison_type?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: SimulationComparison[]; total: number }> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/simulations/comparisons${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch simulation comparisons: ${res.status}`);
	return res.json();
}

export async function fetchSimulationComparison(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SimulationComparison> {
	const res = await fetchFn(`/api/governance/simulations/comparisons/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch simulation comparison: ${res.status}`);
	return res.json();
}

export async function deleteSimulationComparisonClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/simulations/comparisons/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete simulation comparison: ${res.status}`);
}
