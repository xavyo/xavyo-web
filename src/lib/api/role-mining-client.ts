import type {
	MiningJob,
	MiningJobListResponse,
	RoleCandidate,
	RoleCandidateListResponse,
	AccessPattern,
	AccessPatternListResponse,
	ExcessivePrivilege,
	ExcessivePrivilegeListResponse,
	ConsolidationSuggestion,
	ConsolidationSuggestionListResponse,
	Simulation,
	SimulationListResponse,
	CreateSimulationRequest,
	RoleMetrics,
	RoleMetricsListResponse,
	CalculateMetricsResponse
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

// --- Jobs ---

export async function fetchMiningJobs(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<MiningJobListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/role-mining/jobs${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch mining jobs: ${res.status}`);
	return res.json();
}

export async function fetchMiningJob(
	jobId: string,
	fetchFn: typeof fetch = fetch
): Promise<MiningJob> {
	const res = await fetchFn(`/api/governance/role-mining/jobs/${jobId}`);
	if (!res.ok) throw new Error(`Failed to fetch mining job: ${res.status}`);
	return res.json();
}

export async function runJobClient(
	jobId: string,
	fetchFn: typeof fetch = fetch
): Promise<MiningJob> {
	const res = await fetchFn(`/api/governance/role-mining/jobs/${jobId}/run`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to run mining job: ${res.status}`);
	return res.json();
}

export async function cancelJobClient(
	jobId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/role-mining/jobs/${jobId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to cancel mining job: ${res.status}`);
}

export const deleteJobClient = cancelJobClient;

// --- Candidates ---

export async function fetchCandidates(
	jobId: string,
	params: { promotion_status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<RoleCandidateListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/role-mining/jobs/${jobId}/candidates${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch candidates: ${res.status}`);
	return res.json();
}

export async function promoteCandidateClient(
	candidateId: string,
	body?: Record<string, unknown>,
	fetchFn: typeof fetch = fetch
): Promise<RoleCandidate> {
	const res = await fetchFn(`/api/governance/role-mining/candidates/${candidateId}/promote`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body ?? {})
	});
	if (!res.ok) throw new Error(`Failed to promote candidate: ${res.status}`);
	return res.json();
}

export async function dismissCandidateClient(
	candidateId: string,
	body?: Record<string, unknown>,
	fetchFn: typeof fetch = fetch
): Promise<RoleCandidate> {
	const res = await fetchFn(`/api/governance/role-mining/candidates/${candidateId}/dismiss`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body ?? {})
	});
	if (!res.ok) throw new Error(`Failed to dismiss candidate: ${res.status}`);
	return res.json();
}

// --- Patterns ---

export async function fetchAccessPatterns(
	jobId: string,
	params: { min_frequency?: number; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<AccessPatternListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/role-mining/jobs/${jobId}/patterns${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch access patterns: ${res.status}`);
	return res.json();
}

export async function fetchAccessPattern(
	patternId: string,
	fetchFn: typeof fetch = fetch
): Promise<AccessPattern> {
	const res = await fetchFn(`/api/governance/role-mining/patterns/${patternId}`);
	if (!res.ok) throw new Error(`Failed to fetch access pattern: ${res.status}`);
	return res.json();
}

// --- Excessive Privileges ---

export async function fetchExcessivePrivileges(
	jobId: string,
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ExcessivePrivilegeListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/role-mining/jobs/${jobId}/excessive-privileges${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch excessive privileges: ${res.status}`);
	return res.json();
}

export async function reviewPrivilegeClient(
	flagId: string,
	body: { action: string; notes?: string },
	fetchFn: typeof fetch = fetch
): Promise<ExcessivePrivilege> {
	const res = await fetchFn(`/api/governance/role-mining/excessive-privileges/${flagId}/review`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to review privilege: ${res.status}`);
	return res.json();
}

// --- Consolidation ---

export async function fetchConsolidationSuggestions(
	jobId: string,
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ConsolidationSuggestionListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/role-mining/jobs/${jobId}/consolidation-suggestions${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch consolidation suggestions: ${res.status}`);
	return res.json();
}

export async function dismissConsolidationClient(
	suggestionId: string,
	body?: Record<string, unknown>,
	fetchFn: typeof fetch = fetch
): Promise<ConsolidationSuggestion> {
	const res = await fetchFn(`/api/governance/role-mining/consolidation-suggestions/${suggestionId}/dismiss`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body ?? {})
	});
	if (!res.ok) throw new Error(`Failed to dismiss consolidation suggestion: ${res.status}`);
	return res.json();
}

// --- Simulations ---

export async function fetchSimulations(
	params: { status?: string; scenario_type?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<SimulationListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/role-mining/simulations${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch simulations: ${res.status}`);
	return res.json();
}

export async function createSimulationClient(
	body: CreateSimulationRequest,
	fetchFn: typeof fetch = fetch
): Promise<Simulation> {
	const res = await fetchFn('/api/governance/role-mining/simulations', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create simulation: ${res.status}`);
	return res.json();
}

export async function executeSimulationClient(
	simulationId: string,
	fetchFn: typeof fetch = fetch
): Promise<Simulation> {
	const res = await fetchFn(`/api/governance/role-mining/simulations/${simulationId}/execute`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to execute simulation: ${res.status}`);
	return res.json();
}

export async function applySimulationClient(
	simulationId: string,
	fetchFn: typeof fetch = fetch
): Promise<Simulation> {
	const res = await fetchFn(`/api/governance/role-mining/simulations/${simulationId}/apply`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to apply simulation: ${res.status}`);
	return res.json();
}

export async function cancelSimulationClient(
	simulationId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/role-mining/simulations/${simulationId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to cancel simulation: ${res.status}`);
}

// --- Metrics ---

export async function fetchRoleMetrics(
	params: { trend_direction?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<RoleMetricsListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/role-mining/metrics${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch role metrics: ${res.status}`);
	return res.json();
}

export async function fetchRoleMetricsDetail(
	roleId: string,
	fetchFn: typeof fetch = fetch
): Promise<RoleMetrics> {
	const res = await fetchFn(`/api/governance/role-mining/metrics/${roleId}`);
	if (!res.ok) throw new Error(`Failed to fetch role metrics detail: ${res.status}`);
	return res.json();
}

export async function calculateMetricsClient(
	body?: Record<string, unknown>,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn('/api/governance/role-mining/metrics/calculate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body ?? {})
	});
	if (!res.ok) throw new Error(`Failed to calculate metrics: ${res.status}`);
}
