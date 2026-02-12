import type {
	PolicyListResponse,
	MappingListResponse,
	AuthorizationDecision
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

export async function fetchPolicies(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PolicyListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/authorization/policies${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch policies: ${res.status}`);
	return res.json();
}

export async function fetchMappings(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<MappingListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/authorization/mappings${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch mappings: ${res.status}`);
	return res.json();
}

export async function checkAuthorizationClient(
	params: { user_id: string; action: string; resource_type: string; resource_id?: string },
	fetchFn: typeof fetch = fetch
): Promise<AuthorizationDecision> {
	const qs = buildSearchParams({
		user_id: params.user_id,
		action: params.action,
		resource_type: params.resource_type,
		resource_id: params.resource_id
	});
	const res = await fetchFn(`/api/admin/authorization/check${qs}`);
	if (!res.ok) throw new Error(`Failed to check authorization: ${res.status}`);
	return res.json();
}
