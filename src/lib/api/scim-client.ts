import type {
	ScimTokenInfo,
	ScimTokenCreated,
	ScimAttributeMapping,
	MappingRequest
} from './types';

export async function fetchScimTokens(
	fetchFn: typeof fetch = fetch
): Promise<ScimTokenInfo[]> {
	const res = await fetchFn('/api/admin/scim/tokens');
	if (!res.ok) throw new Error(`Failed to fetch SCIM tokens: ${res.status}`);
	return res.json();
}

export async function createScimTokenClient(
	name: string,
	fetchFn: typeof fetch = fetch
): Promise<ScimTokenCreated> {
	const res = await fetchFn('/api/admin/scim/tokens', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name })
	});
	if (!res.ok) throw new Error(`Failed to create SCIM token: ${res.status}`);
	return res.json();
}

export async function revokeScimTokenClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/scim/tokens/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to revoke SCIM token: ${res.status}`);
}

export async function fetchScimMappings(
	fetchFn: typeof fetch = fetch
): Promise<ScimAttributeMapping[]> {
	const res = await fetchFn('/api/admin/scim/mappings');
	if (!res.ok) throw new Error(`Failed to fetch SCIM mappings: ${res.status}`);
	return res.json();
}

export async function updateScimMappingsClient(
	mappings: MappingRequest[],
	fetchFn: typeof fetch = fetch
): Promise<ScimAttributeMapping[]> {
	const res = await fetchFn('/api/admin/scim/mappings', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ mappings })
	});
	if (!res.ok) throw new Error(`Failed to update SCIM mappings: ${res.status}`);
	return res.json();
}
