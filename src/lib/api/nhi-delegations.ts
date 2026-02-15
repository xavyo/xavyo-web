import { apiClient } from './client';
import type {
	NhiDelegationGrant,
	CreateDelegationGrantRequest,
	PaginatedDelegationResponse
} from './types';

export async function createDelegationGrant(
	body: CreateDelegationGrantRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDelegationGrant> {
	return apiClient<NhiDelegationGrant>('/nhi/delegations', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listDelegationGrants(
	params: { principal_id?: string; actor_nhi_id?: string; status?: string; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedDelegationResponse> {
	const searchParams = new URLSearchParams();
	if (params.principal_id) searchParams.set('principal_id', params.principal_id);
	if (params.actor_nhi_id) searchParams.set('actor_nhi_id', params.actor_nhi_id);
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<PaginatedDelegationResponse>(`/nhi/delegations${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getDelegationGrant(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDelegationGrant> {
	return apiClient<NhiDelegationGrant>(`/nhi/delegations/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeDelegationGrant(
	id: string,
	body: { revoked_by?: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDelegationGrant> {
	return apiClient<NhiDelegationGrant>(`/nhi/delegations/${id}/revoke`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listIncomingDelegations(
	nhiId: string,
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedDelegationResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<PaginatedDelegationResponse>(`/nhi/${nhiId}/delegations/incoming${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listOutgoingDelegations(
	nhiId: string,
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedDelegationResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<PaginatedDelegationResponse>(`/nhi/${nhiId}/delegations/outgoing${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
