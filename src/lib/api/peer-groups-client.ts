import type {
	PeerGroup,
	CreatePeerGroupRequest,
	PeerGroupRefreshResult,
	RefreshAllPeerGroupsResult,
	UserPeerComparison
} from './types';

interface PaginatedResponse<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
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

export async function fetchPeerGroups(
	params: { group_type?: string; attribute_key?: string; min_user_count?: number; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedResponse<PeerGroup>> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/peer-groups${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch peer groups: ${res.status}`);
	return res.json();
}

export async function createPeerGroupClient(body: CreatePeerGroupRequest, fetchFn: typeof fetch = fetch): Promise<PeerGroup> {
	const res = await fetchFn('/api/governance/peer-groups', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create peer group: ${res.status}`);
	return res.json();
}

export async function fetchPeerGroup(id: string, fetchFn: typeof fetch = fetch): Promise<PeerGroup> {
	const res = await fetchFn(`/api/governance/peer-groups/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch peer group: ${res.status}`);
	return res.json();
}

export async function deletePeerGroupClient(id: string, fetchFn: typeof fetch = fetch): Promise<void> {
	const res = await fetchFn(`/api/governance/peer-groups/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to delete peer group: ${res.status}`);
}

export async function refreshPeerGroupClient(id: string, fetchFn: typeof fetch = fetch): Promise<PeerGroupRefreshResult> {
	const res = await fetchFn(`/api/governance/peer-groups/${id}/refresh`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to refresh peer group: ${res.status}`);
	return res.json();
}

export async function refreshAllPeerGroupsClient(fetchFn: typeof fetch = fetch): Promise<RefreshAllPeerGroupsResult> {
	const res = await fetchFn('/api/governance/peer-groups/refresh-all', { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to refresh all peer groups: ${res.status}`);
	return res.json();
}

export async function fetchUserPeerComparison(userId: string, fetchFn: typeof fetch = fetch): Promise<UserPeerComparison> {
	const res = await fetchFn(`/api/governance/users/${userId}/peer-comparison`);
	if (!res.ok) throw new Error(`Failed to fetch peer comparison: ${res.status}`);
	return res.json();
}
