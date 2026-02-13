import { apiClient } from './client';
import type {
	NhiAccessRequest,
	NhiAccessRequestListResponse,
	SubmitNhiRequestBody,
	NhiRequestSummary,
	ApproveNhiRequestBody,
	RejectNhiRequestBody
} from './types';

export async function submitNhiRequest(
	body: SubmitNhiRequestBody,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiAccessRequest> {
	return apiClient<NhiAccessRequest>('/governance/nhis/requests', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listNhiRequests(
	params: { status?: string; requester_id?: string; pending_only?: boolean; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiAccessRequestListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.requester_id) searchParams.set('requester_id', params.requester_id);
	if (params.pending_only) searchParams.set('pending_only', 'true');
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<NhiAccessRequestListResponse>(`/governance/nhis/requests${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiRequestSummary(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiRequestSummary> {
	return apiClient<NhiRequestSummary>('/governance/nhis/requests/summary', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getMyPendingRequests(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiAccessRequestListResponse> {
	return apiClient<NhiAccessRequestListResponse>('/governance/nhis/requests/my-pending', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiRequest(
	requestId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiAccessRequest> {
	return apiClient<NhiAccessRequest>(`/governance/nhis/requests/${requestId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function approveNhiRequest(
	requestId: string,
	body: ApproveNhiRequestBody,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiAccessRequest> {
	return apiClient<NhiAccessRequest>(`/governance/nhis/requests/${requestId}/approve`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function rejectNhiRequest(
	requestId: string,
	body: RejectNhiRequestBody,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiAccessRequest> {
	return apiClient<NhiAccessRequest>(`/governance/nhis/requests/${requestId}/reject`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function cancelNhiRequest(
	requestId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiAccessRequest> {
	return apiClient<NhiAccessRequest>(`/governance/nhis/requests/${requestId}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
