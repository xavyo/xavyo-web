import type {
	NhiAccessRequest,
	NhiAccessRequestListResponse,
	SubmitNhiRequestBody,
	NhiRequestSummary,
	ApproveNhiRequestBody,
	RejectNhiRequestBody
} from './types';

export async function submitNhiRequestClient(
	body: SubmitNhiRequestBody,
	fetchFn: typeof fetch = fetch
): Promise<NhiAccessRequest> {
	const res = await fetchFn('/api/nhi/requests', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to submit NHI request: ${res.status}`);
	return res.json();
}

export async function fetchNhiRequests(
	params: { status?: string; requester_id?: string; pending_only?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiAccessRequestListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.requester_id) searchParams.set('requester_id', params.requester_id);
	if (params.pending_only) searchParams.set('pending_only', 'true');
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/requests${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI requests: ${res.status}`);
	return res.json();
}

export async function fetchNhiRequestSummary(
	fetchFn: typeof fetch = fetch
): Promise<NhiRequestSummary> {
	const res = await fetchFn('/api/nhi/requests/summary');
	if (!res.ok) throw new Error(`Failed to fetch NHI request summary: ${res.status}`);
	return res.json();
}

export async function fetchMyPendingRequests(
	fetchFn: typeof fetch = fetch
): Promise<NhiAccessRequestListResponse> {
	const res = await fetchFn('/api/nhi/requests/my-pending');
	if (!res.ok) throw new Error(`Failed to fetch my pending requests: ${res.status}`);
	return res.json();
}

export async function fetchNhiRequest(
	requestId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiAccessRequest> {
	const res = await fetchFn(`/api/nhi/requests/${requestId}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI request: ${res.status}`);
	return res.json();
}

export async function approveNhiRequestClient(
	requestId: string,
	body: ApproveNhiRequestBody = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiAccessRequest> {
	const res = await fetchFn(`/api/nhi/requests/${requestId}/approve`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to approve NHI request: ${res.status}`);
	return res.json();
}

export async function rejectNhiRequestClient(
	requestId: string,
	body: RejectNhiRequestBody,
	fetchFn: typeof fetch = fetch
): Promise<NhiAccessRequest> {
	const res = await fetchFn(`/api/nhi/requests/${requestId}/reject`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to reject NHI request: ${res.status}`);
	return res.json();
}

export async function cancelNhiRequestClient(
	requestId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiAccessRequest> {
	const res = await fetchFn(`/api/nhi/requests/${requestId}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel NHI request: ${res.status}`);
	return res.json();
}
