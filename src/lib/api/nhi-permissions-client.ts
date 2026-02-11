import type {
	NhiToolPermission,
	GrantToolPermissionRequest,
	NhiNhiPermission,
	GrantNhiPermissionRequest,
	NhiUserPermission,
	RevokeResponse,
	PaginatedPermissionResponse
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

// --- Agent-Tool Permissions ---

export async function grantToolPermissionClient(
	agentId: string,
	toolId: string,
	body: GrantToolPermissionRequest,
	fetchFn: typeof fetch = fetch
): Promise<NhiToolPermission> {
	const res = await fetchFn(`/api/nhi/permissions/agents/${agentId}/tools/${toolId}/grant`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to grant tool permission: ${res.status}`);
	return res.json();
}

export async function revokeToolPermissionClient(
	agentId: string,
	toolId: string,
	fetchFn: typeof fetch = fetch
): Promise<RevokeResponse> {
	const res = await fetchFn(`/api/nhi/permissions/agents/${agentId}/tools/${toolId}/revoke`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to revoke tool permission: ${res.status}`);
	return res.json();
}

export async function fetchAgentTools(
	agentId: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedPermissionResponse<NhiToolPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/nhi/permissions/agents/${agentId}/tools${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch agent tools: ${res.status}`);
	return res.json();
}

export async function fetchToolAgents(
	toolId: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedPermissionResponse<NhiToolPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/nhi/permissions/tools/${toolId}/agents${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch tool agents: ${res.status}`);
	return res.json();
}

// --- NHI-to-NHI Permissions ---

export async function grantNhiPermissionClient(
	id: string,
	targetId: string,
	body: GrantNhiPermissionRequest,
	fetchFn: typeof fetch = fetch
): Promise<NhiNhiPermission> {
	const res = await fetchFn(`/api/nhi/permissions/${id}/call/${targetId}/grant`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to grant NHI permission: ${res.status}`);
	return res.json();
}

export async function revokeNhiPermissionClient(
	id: string,
	targetId: string,
	fetchFn: typeof fetch = fetch
): Promise<RevokeResponse> {
	const res = await fetchFn(`/api/nhi/permissions/${id}/call/${targetId}/revoke`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to revoke NHI permission: ${res.status}`);
	return res.json();
}

export async function fetchCallers(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedPermissionResponse<NhiNhiPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/nhi/permissions/${id}/callers${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch callers: ${res.status}`);
	return res.json();
}

export async function fetchCallees(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedPermissionResponse<NhiNhiPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/nhi/permissions/${id}/callees${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch callees: ${res.status}`);
	return res.json();
}

// --- NHI-User Permissions ---

export async function grantUserPermissionClient(
	id: string,
	userId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiUserPermission> {
	const res = await fetchFn(`/api/nhi/permissions/${id}/users/${userId}/grant`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to grant user permission: ${res.status}`);
	return res.json();
}

export async function revokeUserPermissionClient(
	id: string,
	userId: string,
	fetchFn: typeof fetch = fetch
): Promise<RevokeResponse> {
	const res = await fetchFn(`/api/nhi/permissions/${id}/users/${userId}/revoke`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to revoke user permission: ${res.status}`);
	return res.json();
}

export async function fetchNhiUsers(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedPermissionResponse<NhiUserPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/nhi/permissions/${id}/users${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI users: ${res.status}`);
	return res.json();
}
