import type {
	PoaGrant,
	PoaListResponse,
	GrantPoaRequest,
	RevokePoaRequest,
	ExtendPoaRequest,
	AssumeIdentityResponse,
	CurrentAssumptionStatus,
	PoaAuditListResponse
} from './types';

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

export async function listPoaClient(
	params: { direction: 'incoming' | 'outgoing'; status?: string; limit?: number; offset?: number } = { direction: 'outgoing' },
	fetchFn: typeof fetch = fetch
): Promise<PoaListResponse> {
	const qs = buildSearchParams({
		direction: params.direction,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/power-of-attorney${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch PoA list: ${res.status}`);
	return res.json();
}

export async function getPoaClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<PoaGrant> {
	const res = await fetchFn(`/api/governance/power-of-attorney/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch PoA: ${res.status}`);
	return res.json();
}

export async function grantPoaClient(
	data: GrantPoaRequest,
	fetchFn: typeof fetch = fetch
): Promise<PoaGrant> {
	const res = await fetchFn('/api/governance/power-of-attorney', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to grant PoA: ${res.status}`);
	return res.json();
}

export async function revokePoaClient(
	id: string,
	data: RevokePoaRequest = {},
	fetchFn: typeof fetch = fetch
): Promise<PoaGrant> {
	const res = await fetchFn(`/api/governance/power-of-attorney/${id}/revoke`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to revoke PoA: ${res.status}`);
	return res.json();
}

export async function extendPoaClient(
	id: string,
	data: ExtendPoaRequest,
	fetchFn: typeof fetch = fetch
): Promise<PoaGrant> {
	const res = await fetchFn(`/api/governance/power-of-attorney/${id}/extend`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to extend PoA: ${res.status}`);
	return res.json();
}

export async function assumeIdentityClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<AssumeIdentityResponse> {
	const res = await fetchFn(`/api/governance/power-of-attorney/${id}/assume`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({})
	});
	if (!res.ok) throw new Error(`Failed to assume identity: ${res.status}`);
	return res.json();
}

export async function dropIdentityClient(
	fetchFn: typeof fetch = fetch
): Promise<{ message: string }> {
	const res = await fetchFn('/api/governance/power-of-attorney/drop', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({})
	});
	if (!res.ok) throw new Error(`Failed to drop identity: ${res.status}`);
	return res.json();
}

export async function getCurrentAssumptionClient(
	fetchFn: typeof fetch = fetch
): Promise<CurrentAssumptionStatus> {
	const res = await fetchFn('/api/governance/power-of-attorney/current-assumption');
	if (!res.ok) throw new Error(`Failed to get current assumption: ${res.status}`);
	return res.json();
}

export async function getPoaAuditClient(
	id: string,
	params: { event_type?: string; from?: string; to?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PoaAuditListResponse> {
	const qs = buildSearchParams({
		event_type: params.event_type,
		from: params.from,
		to: params.to,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/power-of-attorney/${id}/audit${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch PoA audit: ${res.status}`);
	return res.json();
}

export async function adminListPoaClient(
	params: { donor_id?: string; attorney_id?: string; status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PoaListResponse> {
	const qs = buildSearchParams({
		donor_id: params.donor_id,
		attorney_id: params.attorney_id,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/power-of-attorney/admin${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch admin PoA list: ${res.status}`);
	return res.json();
}

export async function adminRevokePoaClient(
	id: string,
	data: RevokePoaRequest = {},
	fetchFn: typeof fetch = fetch
): Promise<PoaGrant> {
	const res = await fetchFn(`/api/governance/power-of-attorney/admin/${id}/revoke`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to admin revoke PoA: ${res.status}`);
	return res.json();
}
