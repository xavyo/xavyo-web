import type {
	MetaRoleListResponse,
	MetaRole,
	MetaRoleWithDetails,
	CreateMetaRoleRequest,
	UpdateMetaRoleRequest,
	MetaRoleCriteria,
	AddMetaRoleCriterionRequest,
	MetaRoleEntitlement,
	AddMetaRoleEntitlementRequest,
	MetaRoleConstraint,
	AddMetaRoleConstraintRequest,
	MetaRoleInheritanceListResponse,
	MetaRoleStats,
	MetaRoleSimulationResult,
	SimulateMetaRoleRequest,
	MetaRoleCascadeStatus,
	CascadeMetaRoleRequest,
	MetaRoleConflictListResponse,
	MetaRoleConflict,
	ResolveMetaRoleConflictRequest,
	MetaRoleEventListResponse,
	MetaRoleEventStats
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

// --- Meta-Role CRUD ---

export async function fetchMetaRoles(
	params: { status?: string; name?: string; created_by?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		name: params.name,
		created_by: params.created_by,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/meta-roles${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch meta-roles: ${res.status}`);
	return res.json();
}

export async function createMetaRoleClient(
	data: CreateMetaRoleRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRole> {
	const res = await fetchFn('/api/governance/meta-roles', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create meta-role: ${res.status}`);
	return res.json();
}

export async function fetchMetaRole(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleWithDetails> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch meta-role: ${res.status}`);
	return res.json();
}

export async function updateMetaRoleClient(
	id: string,
	data: UpdateMetaRoleRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRole> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update meta-role: ${res.status}`);
	return res.json();
}

export async function deleteMetaRoleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete meta-role: ${res.status}`);
}

// --- Enable / Disable ---

export async function enableMetaRoleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<MetaRole> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/enable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to enable meta-role: ${res.status}`);
	return res.json();
}

export async function disableMetaRoleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<MetaRole> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/disable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to disable meta-role: ${res.status}`);
	return res.json();
}

// --- Criteria ---

export async function addCriterionClient(
	id: string,
	data: AddMetaRoleCriterionRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleCriteria> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/criteria`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add criterion: ${res.status}`);
	return res.json();
}

export async function removeCriterionClient(
	id: string,
	criteriaId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/criteria/${criteriaId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove criterion: ${res.status}`);
}

// --- Entitlements ---

export async function addEntitlementClient(
	id: string,
	data: AddMetaRoleEntitlementRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleEntitlement> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/entitlements`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add entitlement: ${res.status}`);
	return res.json();
}

export async function removeEntitlementClient(
	id: string,
	entitlementId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/entitlements/${entitlementId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove entitlement: ${res.status}`);
}

// --- Constraints ---

export async function addConstraintClient(
	id: string,
	data: AddMetaRoleConstraintRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleConstraint> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/constraints`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add constraint: ${res.status}`);
	return res.json();
}

export async function removeConstraintClient(
	id: string,
	constraintId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/constraints/${constraintId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove constraint: ${res.status}`);
}

// --- Inheritances ---

export async function fetchInheritances(
	id: string,
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleInheritanceListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/meta-roles/${id}/inheritances${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch inheritances: ${res.status}`);
	return res.json();
}

// --- Reevaluate ---

export async function reevaluateMetaRoleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleStats> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/reevaluate`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to reevaluate meta-role: ${res.status}`);
	return res.json();
}

// --- Simulate ---

export async function simulateMetaRoleClient(
	id: string,
	data: SimulateMetaRoleRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleSimulationResult> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/simulate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to simulate meta-role: ${res.status}`);
	return res.json();
}

// --- Cascade ---

export async function cascadeMetaRoleClient(
	id: string,
	data: CascadeMetaRoleRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleCascadeStatus> {
	const res = await fetchFn(`/api/governance/meta-roles/${id}/cascade`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to cascade meta-role: ${res.status}`);
	return res.json();
}

// --- Conflicts ---

export async function fetchConflicts(
	params: { affected_role_id?: string; meta_role_id?: string; conflict_type?: string; resolution_status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleConflictListResponse> {
	const qs = buildSearchParams({
		affected_role_id: params.affected_role_id,
		meta_role_id: params.meta_role_id,
		conflict_type: params.conflict_type,
		resolution_status: params.resolution_status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/meta-roles/conflicts${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch conflicts: ${res.status}`);
	return res.json();
}

export async function resolveConflictClient(
	conflictId: string,
	data: ResolveMetaRoleConflictRequest,
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleConflict> {
	const res = await fetchFn(`/api/governance/meta-roles/conflicts/${conflictId}/resolve`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to resolve conflict: ${res.status}`);
	return res.json();
}

// --- Events ---

export async function fetchEvents(
	params: { meta_role_id: string; event_type?: string; actor_id?: string; from_date?: string; to_date?: string; limit?: number; offset?: number },
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleEventListResponse> {
	const qs = buildSearchParams({
		meta_role_id: params.meta_role_id,
		event_type: params.event_type,
		actor_id: params.actor_id,
		from_date: params.from_date,
		to_date: params.to_date,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/meta-roles/events${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
	return res.json();
}

export async function getEventStatsClient(
	params: { meta_role_id: string; event_type?: string; actor_id?: string; from_date?: string; to_date?: string; limit?: number; offset?: number },
	fetchFn: typeof fetch = fetch
): Promise<MetaRoleEventStats> {
	const qs = buildSearchParams({
		meta_role_id: params.meta_role_id,
		event_type: params.event_type,
		actor_id: params.actor_id,
		from_date: params.from_date,
		to_date: params.to_date,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/meta-roles/events/stats${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch event stats: ${res.status}`);
	return res.json();
}
