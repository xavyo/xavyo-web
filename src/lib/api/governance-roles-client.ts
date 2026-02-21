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
	AddInheritanceBlockRequest,
	RoleInducement,
	InducementListResponse,
	CreateRoleInducementRequest,
	InducedRoleInfo
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

// --- Role CRUD ---

export async function fetchRoles(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<GovernanceRoleListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/governance/roles${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch roles: ${res.status}`);
	return res.json();
}

export async function fetchRole(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<GovernanceRole> {
	const res = await fetchFn(`/api/governance/roles/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch role: ${res.status}`);
	return res.json();
}

export async function createRoleClient(
	data: CreateGovernanceRoleRequest,
	fetchFn: typeof fetch = fetch
): Promise<GovernanceRole> {
	const res = await fetchFn('/api/governance/roles', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create role: ${res.status}`);
	return res.json();
}

export async function updateRoleClient(
	id: string,
	data: UpdateGovernanceRoleRequest,
	fetchFn: typeof fetch = fetch
): Promise<GovernanceRole> {
	const res = await fetchFn(`/api/governance/roles/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update role: ${res.status}`);
	return res.json();
}

export async function deleteRoleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/roles/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete role: ${res.status}`);
}

// --- Hierarchy ---

export async function fetchRoleTree(
	fetchFn: typeof fetch = fetch
): Promise<RoleTreeResponse> {
	const res = await fetchFn('/api/governance/roles/tree');
	if (!res.ok) throw new Error(`Failed to fetch role tree: ${res.status}`);
	return res.json();
}

export async function fetchRoleAncestors(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<GovernanceRole[]> {
	const res = await fetchFn(`/api/governance/roles/${id}/ancestors`);
	if (!res.ok) throw new Error(`Failed to fetch role ancestors: ${res.status}`);
	return res.json();
}

export async function fetchRoleChildren(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<GovernanceRole[]> {
	const res = await fetchFn(`/api/governance/roles/${id}/children`);
	if (!res.ok) throw new Error(`Failed to fetch role children: ${res.status}`);
	return res.json();
}

export async function fetchRoleDescendants(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<GovernanceRole[]> {
	const res = await fetchFn(`/api/governance/roles/${id}/descendants`);
	if (!res.ok) throw new Error(`Failed to fetch role descendants: ${res.status}`);
	return res.json();
}

export async function moveRoleClient(
	id: string,
	data: MoveRoleRequest,
	fetchFn: typeof fetch = fetch
): Promise<MoveRoleResponse> {
	const res = await fetchFn(`/api/governance/roles/${id}/move`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to move role: ${res.status}`);
	return res.json();
}

export async function fetchRoleImpact(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ImpactAnalysisResponse> {
	const res = await fetchFn(`/api/governance/roles/${id}/impact`);
	if (!res.ok) throw new Error(`Failed to fetch role impact: ${res.status}`);
	return res.json();
}

// --- Entitlements ---

export async function fetchRoleEntitlements(
	roleId: string,
	fetchFn: typeof fetch = fetch
): Promise<RoleEntitlement[]> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/entitlements`);
	if (!res.ok) throw new Error(`Failed to fetch role entitlements: ${res.status}`);
	return res.json();
}

export async function addRoleEntitlementClient(
	roleId: string,
	data: AddRoleEntitlementRequest,
	fetchFn: typeof fetch = fetch
): Promise<RoleEntitlement> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/entitlements`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add role entitlement: ${res.status}`);
	return res.json();
}

export async function removeRoleEntitlementClient(
	roleId: string,
	entitlementId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/entitlements/${entitlementId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove role entitlement: ${res.status}`);
}

export async function fetchEffectiveEntitlements(
	roleId: string,
	fetchFn: typeof fetch = fetch
): Promise<EffectiveEntitlementsResponse> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/effective-entitlements`);
	if (!res.ok) throw new Error(`Failed to fetch effective entitlements: ${res.status}`);
	return res.json();
}

export async function recomputeEntitlementsClient(
	roleId: string,
	fetchFn: typeof fetch = fetch
): Promise<any> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/effective-entitlements/recompute`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to recompute entitlements: ${res.status}`);
	return res.json();
}

// --- Parameters ---

export async function fetchRoleParameters(
	roleId: string,
	fetchFn: typeof fetch = fetch
): Promise<RoleParameterListResponse> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/parameters`);
	if (!res.ok) throw new Error(`Failed to fetch role parameters: ${res.status}`);
	return res.json();
}

export async function addRoleParameterClient(
	roleId: string,
	data: CreateRoleParameterRequest,
	fetchFn: typeof fetch = fetch
): Promise<RoleParameter> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/parameters`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add role parameter: ${res.status}`);
	return res.json();
}

export async function fetchRoleParameter(
	roleId: string,
	parameterId: string,
	fetchFn: typeof fetch = fetch
): Promise<RoleParameter> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/parameters/${parameterId}`);
	if (!res.ok) throw new Error(`Failed to fetch role parameter: ${res.status}`);
	return res.json();
}

export async function updateRoleParameterClient(
	roleId: string,
	parameterId: string,
	data: UpdateRoleParameterRequest,
	fetchFn: typeof fetch = fetch
): Promise<RoleParameter> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/parameters/${parameterId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update role parameter: ${res.status}`);
	return res.json();
}

export async function deleteRoleParameterClient(
	roleId: string,
	parameterId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/parameters/${parameterId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete role parameter: ${res.status}`);
}

export async function validateRoleParametersClient(
	roleId: string,
	data: ValidateParametersRequest,
	fetchFn: typeof fetch = fetch
): Promise<ValidateParametersResponse> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/parameters/validate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to validate role parameters: ${res.status}`);
	return res.json();
}

// --- Inheritance Blocks ---

export async function fetchInheritanceBlocks(
	roleId: string,
	fetchFn: typeof fetch = fetch
): Promise<InheritanceBlock[]> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/inheritance-blocks`);
	if (!res.ok) throw new Error(`Failed to fetch inheritance blocks: ${res.status}`);
	return res.json();
}

export async function addInheritanceBlockClient(
	roleId: string,
	data: AddInheritanceBlockRequest,
	fetchFn: typeof fetch = fetch
): Promise<InheritanceBlock> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/inheritance-blocks`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add inheritance block: ${res.status}`);
	return res.json();
}

export async function removeInheritanceBlockClient(
	roleId: string,
	blockId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/inheritance-blocks/${blockId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove inheritance block: ${res.status}`);
}

// --- Inducements ---

export async function fetchRoleInducements(
	roleId: string,
	params: { enabled_only?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<InducementListResponse> {
	const qs = buildSearchParams({ enabled_only: params.enabled_only, limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/governance/roles/${roleId}/inducements${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch inducements: ${res.status}`);
	return res.json();
}

export async function createRoleInducementClient(
	roleId: string,
	data: CreateRoleInducementRequest,
	fetchFn: typeof fetch = fetch
): Promise<RoleInducement> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/inducements`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create inducement: ${res.status}`);
	return res.json();
}

export async function deleteRoleInducementClient(
	roleId: string,
	inducementId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/inducements/${inducementId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete inducement: ${res.status}`);
}

export async function enableRoleInducementClient(
	roleId: string,
	inducementId: string,
	fetchFn: typeof fetch = fetch
): Promise<RoleInducement> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/inducements/${inducementId}/enable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to enable inducement: ${res.status}`);
	return res.json();
}

export async function disableRoleInducementClient(
	roleId: string,
	inducementId: string,
	fetchFn: typeof fetch = fetch
): Promise<RoleInducement> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/inducements/${inducementId}/disable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to disable inducement: ${res.status}`);
	return res.json();
}

export async function fetchInducedRoles(
	roleId: string,
	fetchFn: typeof fetch = fetch
): Promise<InducedRoleInfo[]> {
	const res = await fetchFn(`/api/governance/roles/${roleId}/induced-roles`);
	if (!res.ok) throw new Error(`Failed to fetch induced roles: ${res.status}`);
	return res.json();
}
