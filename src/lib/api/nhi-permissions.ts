import { apiClient } from './client';
import type {
	NhiToolPermission,
	GrantToolPermissionRequest,
	NhiNhiPermission,
	GrantNhiPermissionRequest,
	NhiUserPermission,
	RevokeResponse,
	PaginatedPermissionResponse
} from './types';

export interface PaginationParams {
	limit?: number;
	offset?: number;
}

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

export async function grantToolPermission(
	agentId: string,
	toolId: string,
	body: GrantToolPermissionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiToolPermission> {
	return apiClient<NhiToolPermission>(`/nhi/agents/${agentId}/tools/${toolId}/grant`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeToolPermission(
	agentId: string,
	toolId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RevokeResponse> {
	return apiClient<RevokeResponse>(`/nhi/agents/${agentId}/tools/${toolId}/revoke`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listAgentTools(
	agentId: string,
	params: PaginationParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedPermissionResponse<NhiToolPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<PaginatedPermissionResponse<NhiToolPermission>>(
		`/nhi/agents/${agentId}/tools${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function listToolAgents(
	toolId: string,
	params: PaginationParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedPermissionResponse<NhiToolPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<PaginatedPermissionResponse<NhiToolPermission>>(
		`/nhi/tools/${toolId}/agents${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- NHI-to-NHI Permissions ---

export async function grantNhiPermission(
	id: string,
	targetId: string,
	body: GrantNhiPermissionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiNhiPermission> {
	return apiClient<NhiNhiPermission>(`/nhi/${id}/call/${targetId}/grant`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeNhiPermission(
	id: string,
	targetId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RevokeResponse> {
	return apiClient<RevokeResponse>(`/nhi/${id}/call/${targetId}/revoke`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listCallers(
	id: string,
	params: PaginationParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedPermissionResponse<NhiNhiPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<PaginatedPermissionResponse<NhiNhiPermission>>(`/nhi/${id}/callers${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listCallees(
	id: string,
	params: PaginationParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedPermissionResponse<NhiNhiPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<PaginatedPermissionResponse<NhiNhiPermission>>(`/nhi/${id}/callees${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- NHI-User Permissions ---

export async function grantUserPermission(
	id: string,
	userId: string,
	body: { permission_type: string; expires_at?: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiUserPermission> {
	return apiClient<NhiUserPermission>(`/nhi/${id}/users/${userId}/grant`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeUserPermission(
	id: string,
	userId: string,
	body: { permission_type: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RevokeResponse> {
	return apiClient<RevokeResponse>(`/nhi/${id}/users/${userId}/revoke`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listNhiUsers(
	id: string,
	params: PaginationParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedPermissionResponse<NhiUserPermission>> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<PaginatedPermissionResponse<NhiUserPermission>>(`/nhi/${id}/users${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
