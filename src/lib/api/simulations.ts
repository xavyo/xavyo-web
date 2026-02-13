import { API_BASE_URL } from '$env/static/private';
import { apiClient, ApiError } from './client';
import type {
	PolicySimulation,
	PolicySimulationResult,
	BatchSimulation,
	BatchSimulationResult,
	SimulationComparison,
	StalenessCheck
} from './types';

// --- Helper ---

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

// --- Param interfaces ---

export interface ListPolicySimulationsParams {
	simulation_type?: string;
	status?: string;
	created_by?: string;
	include_archived?: boolean;
	offset?: number;
	limit?: number;
}

export interface ListPolicySimulationResultsParams {
	impact_type?: string;
	severity?: string;
	user_id?: string;
	offset?: number;
	limit?: number;
}

export interface ListBatchSimulationsParams {
	batch_type?: string;
	status?: string;
	created_by?: string;
	include_archived?: boolean;
	offset?: number;
	limit?: number;
}

export interface ListBatchSimulationResultsParams {
	user_id?: string;
	has_warnings?: boolean;
	offset?: number;
	limit?: number;
}

export interface ListSimulationComparisonsParams {
	comparison_type?: string;
	created_by?: string;
	offset?: number;
	limit?: number;
}

// --- Policy Simulations ---

export async function createPolicySimulation(
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicySimulation> {
	return apiClient<PolicySimulation>('/governance/simulations/policy', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listPolicySimulations(
	params: ListPolicySimulationsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: PolicySimulation[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		simulation_type: params.simulation_type,
		status: params.status,
		created_by: params.created_by,
		include_archived: params.include_archived,
		offset: params.offset,
		limit: params.limit
	});
	return apiClient<{ items: PolicySimulation[]; total: number; limit: number; offset: number }>(
		`/governance/simulations/policy${qs}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getPolicySimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicySimulation> {
	return apiClient<PolicySimulation>(`/governance/simulations/policy/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function executePolicySimulation(
	id: string,
	body: { user_ids?: string[] } | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicySimulation> {
	return apiClient<PolicySimulation>(`/governance/simulations/policy/${id}/execute`, {
		method: 'POST',
		token,
		tenantId,
		body: body ?? {},
		fetch: fetchFn
	});
}

export async function cancelPolicySimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicySimulation> {
	return apiClient<PolicySimulation>(`/governance/simulations/policy/${id}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function archivePolicySimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicySimulation> {
	return apiClient<PolicySimulation>(`/governance/simulations/policy/${id}/archive`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function restorePolicySimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicySimulation> {
	return apiClient<PolicySimulation>(`/governance/simulations/policy/${id}/restore`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updatePolicySimulationNotes(
	id: string,
	notes: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicySimulation> {
	return apiClient<PolicySimulation>(`/governance/simulations/policy/${id}/notes`, {
		method: 'PATCH',
		token,
		tenantId,
		body: { notes },
		fetch: fetchFn
	});
}

export async function listPolicySimulationResults(
	id: string,
	params: ListPolicySimulationResultsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: PolicySimulationResult[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		impact_type: params.impact_type,
		severity: params.severity,
		user_id: params.user_id,
		offset: params.offset,
		limit: params.limit
	});
	return apiClient<{ items: PolicySimulationResult[]; total: number; limit: number; offset: number }>(
		`/governance/simulations/policy/${id}/results${qs}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function checkPolicySimulationStaleness(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<StalenessCheck> {
	return apiClient<StalenessCheck>(`/governance/simulations/policy/${id}/staleness`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deletePolicySimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/simulations/policy/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function exportPolicySimulation(
	id: string,
	format: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<Response> {
	const f = fetchFn ?? globalThis.fetch;
	const res = await f(`${API_BASE_URL}/governance/simulations/policy/${id}/export?format=${format}`, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'X-Tenant-Id': tenantId
		}
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Export failed' }));
		throw new ApiError(body.error || 'Export failed', res.status);
	}
	return res;
}

// --- Batch Simulations ---

export async function createBatchSimulation(
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>('/governance/simulations/batch', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listBatchSimulations(
	params: ListBatchSimulationsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: BatchSimulation[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		batch_type: params.batch_type,
		status: params.status,
		created_by: params.created_by,
		include_archived: params.include_archived,
		offset: params.offset,
		limit: params.limit
	});
	return apiClient<{ items: BatchSimulation[]; total: number; limit: number; offset: number }>(
		`/governance/simulations/batch${qs}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getBatchSimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>(`/governance/simulations/batch/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function executeBatchSimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>(`/governance/simulations/batch/${id}/execute`, {
		method: 'POST',
		token,
		tenantId,
		body: {},
		fetch: fetchFn
	});
}

export async function applyBatchSimulation(
	id: string,
	body: { justification: string; acknowledge_scope: boolean },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>(`/governance/simulations/batch/${id}/apply`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function cancelBatchSimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>(`/governance/simulations/batch/${id}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function archiveBatchSimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>(`/governance/simulations/batch/${id}/archive`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function restoreBatchSimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>(`/governance/simulations/batch/${id}/restore`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateBatchSimulationNotes(
	id: string,
	notes: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchSimulation> {
	return apiClient<BatchSimulation>(`/governance/simulations/batch/${id}/notes`, {
		method: 'PATCH',
		token,
		tenantId,
		body: { notes },
		fetch: fetchFn
	});
}

export async function listBatchSimulationResults(
	id: string,
	params: ListBatchSimulationResultsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: BatchSimulationResult[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		user_id: params.user_id,
		has_warnings: params.has_warnings,
		offset: params.offset,
		limit: params.limit
	});
	return apiClient<{ items: BatchSimulationResult[]; total: number; limit: number; offset: number }>(
		`/governance/simulations/batch/${id}/results${qs}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function deleteBatchSimulation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/simulations/batch/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function exportBatchSimulation(
	id: string,
	format: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<Response> {
	const f = fetchFn ?? globalThis.fetch;
	const res = await f(`${API_BASE_URL}/governance/simulations/batch/${id}/export?format=${format}`, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'X-Tenant-Id': tenantId
		}
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Export failed' }));
		throw new ApiError(body.error || 'Export failed', res.status);
	}
	return res;
}

// --- Comparisons ---

export async function createSimulationComparison(
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SimulationComparison> {
	return apiClient<SimulationComparison>('/governance/simulations/comparisons', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listSimulationComparisons(
	params: ListSimulationComparisonsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: SimulationComparison[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		comparison_type: params.comparison_type,
		created_by: params.created_by,
		offset: params.offset,
		limit: params.limit
	});
	return apiClient<{ items: SimulationComparison[]; total: number; limit: number; offset: number }>(
		`/governance/simulations/comparisons${qs}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getSimulationComparison(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SimulationComparison> {
	return apiClient<SimulationComparison>(`/governance/simulations/comparisons/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteSimulationComparison(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/simulations/comparisons/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function exportSimulationComparison(
	id: string,
	format: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<Response> {
	const f = fetchFn ?? globalThis.fetch;
	const res = await f(`${API_BASE_URL}/governance/simulations/comparisons/${id}/export?format=${format}`, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'X-Tenant-Id': tenantId
		}
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Export failed' }));
		throw new ApiError(body.error || 'Export failed', res.status);
	}
	return res;
}
