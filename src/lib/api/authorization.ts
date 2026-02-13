import { apiClient } from './client';
import type {
	PolicyListResponse,
	AuthorizationPolicy,
	CreatePolicyRequest,
	UpdatePolicyRequest,
	MappingListResponse,
	EntitlementActionMapping,
	CreateMappingRequest,
	AuthorizationDecision
} from './types';

export interface ListPoliciesParams {
	limit?: number;
	offset?: number;
}

export interface ListMappingsParams {
	limit?: number;
	offset?: number;
}

export interface CheckAuthorizationParams {
	user_id: string;
	action: string;
	resource_type: string;
	resource_id?: string;
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

export async function listPolicies(
	params: ListPoliciesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PolicyListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<PolicyListResponse>(`/admin/authorization/policies${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createPolicy(
	body: CreatePolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AuthorizationPolicy> {
	return apiClient<AuthorizationPolicy>('/admin/authorization/policies', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AuthorizationPolicy> {
	return apiClient<AuthorizationPolicy>(`/admin/authorization/policies/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updatePolicy(
	id: string,
	body: UpdatePolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AuthorizationPolicy> {
	return apiClient<AuthorizationPolicy>(`/admin/authorization/policies/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deletePolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/authorization/policies/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listMappings(
	params: ListMappingsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MappingListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<MappingListResponse>(`/admin/authorization/mappings${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createMapping(
	body: CreateMappingRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EntitlementActionMapping> {
	return apiClient<EntitlementActionMapping>('/admin/authorization/mappings', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteMapping(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/authorization/mappings/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function checkAuthorization(
	params: CheckAuthorizationParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AuthorizationDecision> {
	const qs = buildSearchParams({
		user_id: params.user_id,
		action: params.action,
		resource_type: params.resource_type,
		resource_id: params.resource_id
	});
	return apiClient<AuthorizationDecision>(`/admin/authorization/check${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
