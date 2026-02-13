import { apiClient } from './client';
import type {
	GovernanceRoleListResponse,
	GovernanceRole,
	CreateGovernanceRoleRequest,
	UpdateGovernanceRoleRequest,
	RoleTreeResponse,
	MoveRoleRequest,
	MoveRoleResponse,
	ImpactAnalysisResponse,
	RoleEntitlement,
	AddRoleEntitlementRequest,
	EffectiveEntitlementsResponse,
	RoleParameterListResponse,
	RoleParameter,
	CreateRoleParameterRequest,
	UpdateRoleParameterRequest,
	ValidateParametersRequest,
	ValidateParametersResponse,
	InheritanceBlock,
	AddInheritanceBlockRequest
} from './types';

// --- Param interfaces ---

export interface ListRolesParams {
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

// --- Role CRUD ---

export async function listRoles(
	params: ListRolesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GovernanceRoleListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<GovernanceRoleListResponse>(`/governance/roles${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createRole(
	data: CreateGovernanceRoleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GovernanceRole> {
	return apiClient<GovernanceRole>('/governance/roles', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRole(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GovernanceRole> {
	return apiClient<GovernanceRole>(`/governance/roles/${roleId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateRole(
	roleId: string,
	data: UpdateGovernanceRoleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GovernanceRole> {
	return apiClient<GovernanceRole>(`/governance/roles/${roleId}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteRole(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/roles/${roleId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Hierarchy ---

export async function getRoleTree(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RoleTreeResponse> {
	return apiClient<RoleTreeResponse>('/governance/roles/tree', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRoleAncestors(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GovernanceRole[]> {
	return apiClient<GovernanceRole[]>(`/governance/roles/${roleId}/ancestors`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRoleChildren(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GovernanceRole[]> {
	return apiClient<GovernanceRole[]>(`/governance/roles/${roleId}/children`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRoleDescendants(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GovernanceRole[]> {
	return apiClient<GovernanceRole[]>(`/governance/roles/${roleId}/descendants`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function moveRole(
	roleId: string,
	data: MoveRoleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MoveRoleResponse> {
	return apiClient<MoveRoleResponse>(`/governance/roles/${roleId}/move`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRoleImpact(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ImpactAnalysisResponse> {
	return apiClient<ImpactAnalysisResponse>(`/governance/roles/${roleId}/impact`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Entitlements ---

export async function listRoleEntitlements(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RoleEntitlement[]> {
	return apiClient<RoleEntitlement[]>(`/governance/roles/${roleId}/entitlements`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function addRoleEntitlement(
	roleId: string,
	data: AddRoleEntitlementRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RoleEntitlement> {
	return apiClient<RoleEntitlement>(`/governance/roles/${roleId}/entitlements`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeRoleEntitlement(
	roleId: string,
	entitlementId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/roles/${roleId}/entitlements/${entitlementId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getEffectiveEntitlements(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EffectiveEntitlementsResponse> {
	return apiClient<EffectiveEntitlementsResponse>(
		`/governance/roles/${roleId}/effective-entitlements`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function recomputeEffectiveEntitlements(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<unknown> {
	return apiClient(`/governance/roles/${roleId}/effective-entitlements/recompute`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Parameters ---

export async function listRoleParameters(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RoleParameterListResponse> {
	return apiClient<RoleParameterListResponse>(`/governance/roles/${roleId}/parameters`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function addRoleParameter(
	roleId: string,
	data: CreateRoleParameterRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RoleParameter> {
	return apiClient<RoleParameter>(`/governance/roles/${roleId}/parameters`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRoleParameter(
	roleId: string,
	parameterId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RoleParameter> {
	return apiClient<RoleParameter>(`/governance/roles/${roleId}/parameters/${parameterId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateRoleParameter(
	roleId: string,
	parameterId: string,
	data: UpdateRoleParameterRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RoleParameter> {
	return apiClient<RoleParameter>(`/governance/roles/${roleId}/parameters/${parameterId}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteRoleParameter(
	roleId: string,
	parameterId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/roles/${roleId}/parameters/${parameterId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function validateRoleParameters(
	roleId: string,
	data: ValidateParametersRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ValidateParametersResponse> {
	return apiClient<ValidateParametersResponse>(
		`/governance/roles/${roleId}/parameters/validate`,
		{
			method: 'POST',
			body: data,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- Inheritance Blocks ---

export async function listInheritanceBlocks(
	roleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<InheritanceBlock[]> {
	return apiClient<InheritanceBlock[]>(`/governance/roles/${roleId}/inheritance-blocks`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function addInheritanceBlock(
	roleId: string,
	data: AddInheritanceBlockRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<InheritanceBlock> {
	return apiClient<InheritanceBlock>(`/governance/roles/${roleId}/inheritance-blocks`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeInheritanceBlock(
	roleId: string,
	blockId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/roles/${roleId}/inheritance-blocks/${blockId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
