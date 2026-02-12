import type {
	UserGroupListResponse
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

export async function fetchGroups(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<UserGroupListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/groups${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch groups: ${res.status}`);
	return res.json();
}

export async function addMembersClient(
	groupId: string,
	memberIds: string[],
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/groups/${groupId}/members`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ member_ids: memberIds })
	});
	if (!res.ok) throw new Error(`Failed to add group members: ${res.status}`);
}

export async function removeMemberClient(
	groupId: string,
	userId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/groups/${groupId}/members/${userId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove group member: ${res.status}`);
}
