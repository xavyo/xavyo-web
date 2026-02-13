import type {
	SocialProviderListResponse,
	UpdateSocialProviderRequest,
	SocialProviderConfig,
	SocialConnectionsResponse
} from './types';

export async function listSocialProviders(
	fetchFn: typeof fetch = fetch
): Promise<SocialProviderListResponse> {
	const res = await fetchFn('/api/federation/social/providers');
	if (!res.ok) throw new Error(`Failed to fetch social providers: ${res.status}`);
	return res.json();
}

export async function updateSocialProvider(
	provider: string,
	data: UpdateSocialProviderRequest,
	fetchFn: typeof fetch = fetch
): Promise<SocialProviderConfig> {
	const res = await fetchFn(`/api/federation/social/providers/${provider}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update social provider: ${res.status}`);
	return res.json();
}

export async function deleteSocialProvider(
	provider: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/federation/social/providers/${provider}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete social provider: ${res.status}`);
}

export async function listSocialConnections(
	fetchFn: typeof fetch = fetch
): Promise<SocialConnectionsResponse> {
	const res = await fetchFn('/api/federation/social/connections');
	if (!res.ok) throw new Error(`Failed to fetch social connections: ${res.status}`);
	return res.json();
}

export function initiateSocialLink(provider: string): void {
	window.location.href = `/api/federation/social/link/${provider}/authorize`;
}

export async function unlinkSocialAccount(
	provider: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/federation/social/unlink/${provider}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to unlink social account: ${res.status}`);
}
