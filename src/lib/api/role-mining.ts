import { apiClient } from './client';
import type {
	MiningJob,
	MiningJobListResponse,
	CreateMiningJobRequest,
	RoleCandidate,
	RoleCandidateListResponse,
	PromoteCandidateRequest,
	DismissCandidateRequest,
	AccessPattern,
	AccessPatternListResponse,
	ExcessivePrivilege,
	ExcessivePrivilegeListResponse,
	ReviewExcessivePrivilegeRequest,
	ConsolidationSuggestion,
	ConsolidationSuggestionListResponse,
	DismissConsolidationRequest,
	Simulation,
	SimulationListResponse,
	CreateSimulationRequest,
	RoleMetrics,
	RoleMetricsListResponse,
	CalculateMetricsRequest,
	CalculateMetricsResponse
} from './types';

const BASE = '/governance/role-mining';

// --- Jobs ---

export async function listMiningJobs(
	params: {
		status?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MiningJobListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<MiningJobListResponse>(`${BASE}/jobs${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getMiningJob(
	jobId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MiningJob> {
	return apiClient<MiningJob>(`${BASE}/jobs/${jobId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createMiningJob(
	body: CreateMiningJobRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MiningJob> {
	return apiClient<MiningJob>(`${BASE}/jobs`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function runMiningJob(
	jobId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MiningJob> {
	return apiClient<MiningJob>(`${BASE}/jobs/${jobId}/run`, {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteMiningJob(
	jobId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`${BASE}/jobs/${jobId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Candidates ---

export async function listCandidates(
	jobId: string,
	params: {
		promotion_status?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<RoleCandidateListResponse> {
	const searchParams = new URLSearchParams();
	if (params.promotion_status) searchParams.set('promotion_status', params.promotion_status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<RoleCandidateListResponse>(
		`${BASE}/jobs/${jobId}/candidates${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getCandidate(
	candidateId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<RoleCandidate> {
	return apiClient<RoleCandidate>(`${BASE}/candidates/${candidateId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function promoteCandidate(
	candidateId: string,
	body: PromoteCandidateRequest | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<RoleCandidate> {
	return apiClient<RoleCandidate>(`${BASE}/candidates/${candidateId}/promote`, {
		method: 'POST',
		body: body ?? {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function dismissCandidate(
	candidateId: string,
	body: DismissCandidateRequest | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<RoleCandidate> {
	return apiClient<RoleCandidate>(`${BASE}/candidates/${candidateId}/dismiss`, {
		method: 'POST',
		body: body ?? {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Access Patterns ---

export async function listAccessPatterns(
	jobId: string,
	params: {
		min_frequency?: number;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<AccessPatternListResponse> {
	const searchParams = new URLSearchParams();
	if (params.min_frequency !== undefined)
		searchParams.set('min_frequency', String(params.min_frequency));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<AccessPatternListResponse>(
		`${BASE}/jobs/${jobId}/patterns${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getAccessPattern(
	patternId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<AccessPattern> {
	return apiClient<AccessPattern>(`${BASE}/patterns/${patternId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Excessive Privileges ---

export async function listExcessivePrivileges(
	jobId: string,
	params: {
		status?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ExcessivePrivilegeListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<ExcessivePrivilegeListResponse>(
		`${BASE}/jobs/${jobId}/excessive-privileges${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getExcessivePrivilege(
	flagId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ExcessivePrivilege> {
	return apiClient<ExcessivePrivilege>(`${BASE}/excessive-privileges/${flagId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function reviewExcessivePrivilege(
	flagId: string,
	body: ReviewExcessivePrivilegeRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ExcessivePrivilege> {
	return apiClient<ExcessivePrivilege>(`${BASE}/excessive-privileges/${flagId}/review`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Consolidation Suggestions ---

export async function listConsolidationSuggestions(
	jobId: string,
	params: {
		status?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ConsolidationSuggestionListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<ConsolidationSuggestionListResponse>(
		`${BASE}/jobs/${jobId}/consolidation-suggestions${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getConsolidationSuggestion(
	suggestionId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ConsolidationSuggestion> {
	return apiClient<ConsolidationSuggestion>(
		`${BASE}/consolidation-suggestions/${suggestionId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function dismissConsolidationSuggestion(
	suggestionId: string,
	body: DismissConsolidationRequest | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ConsolidationSuggestion> {
	return apiClient<ConsolidationSuggestion>(
		`${BASE}/consolidation-suggestions/${suggestionId}/dismiss`,
		{ method: 'POST', body: body ?? {}, token, tenantId, fetch: fetchFn }
	);
}

// --- Simulations ---

export async function listSimulations(
	params: {
		status?: string;
		scenario_type?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SimulationListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.scenario_type) searchParams.set('scenario_type', params.scenario_type);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<SimulationListResponse>(`${BASE}/simulations${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSimulation(
	simulationId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Simulation> {
	return apiClient<Simulation>(`${BASE}/simulations/${simulationId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createSimulation(
	body: CreateSimulationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Simulation> {
	return apiClient<Simulation>(`${BASE}/simulations`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function executeSimulation(
	simulationId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Simulation> {
	return apiClient<Simulation>(`${BASE}/simulations/${simulationId}/execute`, {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function applySimulation(
	simulationId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Simulation> {
	return apiClient<Simulation>(`${BASE}/simulations/${simulationId}/apply`, {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteSimulation(
	simulationId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`${BASE}/simulations/${simulationId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Metrics ---

export async function listRoleMetrics(
	params: {
		trend_direction?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<RoleMetricsListResponse> {
	const searchParams = new URLSearchParams();
	if (params.trend_direction) searchParams.set('trend_direction', params.trend_direction);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<RoleMetricsListResponse>(`${BASE}/metrics${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRoleMetrics(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<RoleMetrics> {
	return apiClient<RoleMetrics>(`${BASE}/metrics/${roleId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function calculateRoleMetrics(
	body: CalculateMetricsRequest | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CalculateMetricsResponse> {
	return apiClient<CalculateMetricsResponse>(`${BASE}/metrics/calculate`, {
		method: 'POST',
		body: body ?? {},
		token,
		tenantId,
		fetch: fetchFn
	});
}
