import type {
	NhiDelegationGrant,
	CreateDelegationGrantRequest,
	PaginatedDelegationResponse
} from './types';

export async function createDelegationGrantClient(
	body: CreateDelegationGrantRequest,
	fetchFn: typeof fetch = fetch
): Promise<NhiDelegationGrant> {
	const res = await fetchFn('/api/nhi/delegations', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create delegation grant: ${res.status}`);
	return res.json();
}

export async function fetchDelegationGrants(
	params: { principal_id?: string; actor_nhi_id?: string; status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedDelegationResponse> {
	const searchParams = new URLSearchParams();
	if (params.principal_id) searchParams.set('principal_id', params.principal_id);
	if (params.actor_nhi_id) searchParams.set('actor_nhi_id', params.actor_nhi_id);
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/delegations${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch delegation grants: ${res.status}`);
	return res.json();
}

export async function fetchDelegationGrant(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiDelegationGrant> {
	const res = await fetchFn(`/api/nhi/delegations/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch delegation grant: ${res.status}`);
	return res.json();
}

export async function revokeDelegationGrantClient(
	id: string,
	body: { revoked_by?: string } = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiDelegationGrant> {
	const res = await fetchFn(`/api/nhi/delegations/${id}/revoke`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to revoke delegation grant: ${res.status}`);
	return res.json();
}

export async function fetchIncomingDelegations(
	nhiId: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedDelegationResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/delegations/entity/${nhiId}/incoming${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch incoming delegations: ${res.status}`);
	return res.json();
}

export async function fetchOutgoingDelegations(
	nhiId: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedDelegationResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/delegations/entity/${nhiId}/outgoing${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch outgoing delegations: ${res.status}`);
	return res.json();
}
