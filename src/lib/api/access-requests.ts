import { apiClient } from './client';
import type {
	AccessRequestListResponse,
	AccessRequestResponse,
	CreateAccessRequestRequest,
	CreateAccessRequestResponse,
	ApproveAccessRequestRequest,
	RejectAccessRequestRequest
} from './types';

// List params

export interface ListAccessRequestsParams {
	status?: string;
	entitlement_id?: string;
	limit?: number;
	offset?: number;
}

export interface ListMyApprovalsParams {
	limit?: number;
	offset?: number;
}

// Helper

function buildSearchParams(params: Record<string, string | number | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== '') {
			searchParams.set(key, String(value));
		}
	}
	return searchParams.toString();
}

// Access Request functions

export async function listAccessRequests(
	params: ListAccessRequestsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AccessRequestListResponse> {
	const query = buildSearchParams({
		status: params.status,
		entitlement_id: params.entitlement_id,
		limit: params.limit,
		offset: params.offset
	});
	const endpoint = `/governance/access-requests${query ? `?${query}` : ''}`;

	return apiClient<AccessRequestListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createAccessRequest(
	data: CreateAccessRequestRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CreateAccessRequestResponse> {
	return apiClient<CreateAccessRequestResponse>('/governance/access-requests', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getAccessRequest(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AccessRequestResponse> {
	return apiClient<AccessRequestResponse>(`/governance/access-requests/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelAccessRequest(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AccessRequestResponse> {
	return apiClient<AccessRequestResponse>(`/governance/access-requests/${id}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function approveAccessRequest(
	id: string,
	data: ApproveAccessRequestRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AccessRequestResponse> {
	return apiClient<AccessRequestResponse>(`/governance/access-requests/${id}/approve`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function rejectAccessRequest(
	id: string,
	data: RejectAccessRequestRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AccessRequestResponse> {
	return apiClient<AccessRequestResponse>(`/governance/access-requests/${id}/reject`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listMyApprovals(
	params: ListMyApprovalsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AccessRequestListResponse> {
	const query = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const endpoint = `/governance/my-approvals${query ? `?${query}` : ''}`;

	return apiClient<AccessRequestListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
