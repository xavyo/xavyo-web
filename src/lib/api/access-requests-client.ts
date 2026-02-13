import type {
	AccessRequestListResponse,
	AccessRequestResponse,
	CreateAccessRequestRequest,
	CreateAccessRequestResponse,
	ApproveAccessRequestRequest,
	RejectAccessRequestRequest,
	AccessRequestStatus
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

// --- Access Requests ---

export async function fetchAccessRequests(
	params: {
		status?: AccessRequestStatus;
		requester_id?: string;
		entitlement_id?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<AccessRequestListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		requester_id: params.requester_id,
		entitlement_id: params.entitlement_id,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/access-requests${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch access requests: ${res.status}`);
	return res.json();
}

export async function createAccessRequestClient(
	data: CreateAccessRequestRequest,
	fetchFn: typeof fetch = fetch
): Promise<CreateAccessRequestResponse> {
	const res = await fetchFn('/api/governance/access-requests', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create access request: ${res.status}`);
	return res.json();
}

export async function fetchAccessRequest(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<AccessRequestResponse> {
	const res = await fetchFn(`/api/governance/access-requests/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch access request: ${res.status}`);
	return res.json();
}

export async function cancelAccessRequestClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<AccessRequestResponse> {
	const res = await fetchFn(`/api/governance/access-requests/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel access request: ${res.status}`);
	return res.json();
}

export async function approveAccessRequestClient(
	id: string,
	data: ApproveAccessRequestRequest,
	fetchFn: typeof fetch = fetch
): Promise<AccessRequestResponse> {
	const res = await fetchFn(`/api/governance/access-requests/${id}/approve`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to approve access request: ${res.status}`);
	return res.json();
}

export async function rejectAccessRequestClient(
	id: string,
	data: RejectAccessRequestRequest,
	fetchFn: typeof fetch = fetch
): Promise<AccessRequestResponse> {
	const res = await fetchFn(`/api/governance/access-requests/${id}/reject`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to reject access request: ${res.status}`);
	return res.json();
}

export async function fetchMyApprovals(
	params: {
		status?: AccessRequestStatus;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<AccessRequestListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/my-approvals${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch my approvals: ${res.status}`);
	return res.json();
}
