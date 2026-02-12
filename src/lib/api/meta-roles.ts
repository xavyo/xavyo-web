import { apiClient } from './client';
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

// --- Param interfaces ---

export interface ListMetaRolesParams {
	status?: string;
	name?: string;
	created_by?: string;
	limit?: number;
	offset?: number;
}

export interface ListInheritancesParams {
	status?: string;
	limit?: number;
	offset?: number;
}

export interface ListConflictsParams {
	affected_role_id?: string;
	meta_role_id?: string;
	conflict_type?: string;
	resolution_status?: string;
	limit?: number;
	offset?: number;
}

export interface ListEventsParams {
	meta_role_id: string;
	event_type?: string;
	actor_id?: string;
	from_date?: string;
	to_date?: string;
	limit?: number;
	offset?: number;
}

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

export async function listMetaRoles(
	params: ListMetaRolesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		name: params.name,
		created_by: params.created_by,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<MetaRoleListResponse>(`/governance/meta-roles${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createMetaRole(
	data: CreateMetaRoleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRole> {
	return apiClient<MetaRole>('/governance/meta-roles', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getMetaRole(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleWithDetails> {
	return apiClient<MetaRoleWithDetails>(`/governance/meta-roles/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateMetaRole(
	id: string,
	data: UpdateMetaRoleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRole> {
	return apiClient<MetaRole>(`/governance/meta-roles/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteMetaRole(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/meta-roles/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Enable / Disable ---

export async function enableMetaRole(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRole> {
	return apiClient<MetaRole>(`/governance/meta-roles/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableMetaRole(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRole> {
	return apiClient<MetaRole>(`/governance/meta-roles/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Criteria ---

export async function addCriterion(
	id: string,
	data: AddMetaRoleCriterionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleCriteria> {
	return apiClient<MetaRoleCriteria>(`/governance/meta-roles/${id}/criteria`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeCriterion(
	id: string,
	criteriaId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/meta-roles/${id}/criteria/${criteriaId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Entitlements ---

export async function addEntitlement(
	id: string,
	data: AddMetaRoleEntitlementRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleEntitlement> {
	return apiClient<MetaRoleEntitlement>(`/governance/meta-roles/${id}/entitlements`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeEntitlement(
	id: string,
	entitlementId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/meta-roles/${id}/entitlements/${entitlementId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Constraints ---

export async function addConstraint(
	id: string,
	data: AddMetaRoleConstraintRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleConstraint> {
	return apiClient<MetaRoleConstraint>(`/governance/meta-roles/${id}/constraints`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeConstraint(
	id: string,
	constraintId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/meta-roles/${id}/constraints/${constraintId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Inheritances ---

export async function listInheritances(
	id: string,
	params: ListInheritancesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleInheritanceListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<MetaRoleInheritanceListResponse>(
		`/governance/meta-roles/${id}/inheritances${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- Reevaluate ---

export async function reevaluateMetaRole(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleStats> {
	return apiClient<MetaRoleStats>(`/governance/meta-roles/${id}/reevaluate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Simulate ---

export async function simulateMetaRole(
	id: string,
	data: SimulateMetaRoleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleSimulationResult> {
	return apiClient<MetaRoleSimulationResult>(`/governance/meta-roles/${id}/simulate`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Cascade ---

export async function cascadeMetaRole(
	id: string,
	data: CascadeMetaRoleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleCascadeStatus> {
	return apiClient<MetaRoleCascadeStatus>(`/governance/meta-roles/${id}/cascade`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Conflicts ---

export async function listConflicts(
	params: ListConflictsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleConflictListResponse> {
	const qs = buildSearchParams({
		affected_role_id: params.affected_role_id,
		meta_role_id: params.meta_role_id,
		conflict_type: params.conflict_type,
		resolution_status: params.resolution_status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<MetaRoleConflictListResponse>(`/governance/meta-roles/conflicts${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function resolveConflict(
	conflictId: string,
	data: ResolveMetaRoleConflictRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MetaRoleConflict> {
	return apiClient<MetaRoleConflict>(
		`/governance/meta-roles/conflicts/${conflictId}/resolve`,
		{
			method: 'POST',
			body: data,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- Events ---

export async function listEvents(
	params: ListEventsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
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
	return apiClient<MetaRoleEventListResponse>(`/governance/meta-roles/events${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getEventStats(
	params: ListEventsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
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
	return apiClient<MetaRoleEventStats>(`/governance/meta-roles/events/stats${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
