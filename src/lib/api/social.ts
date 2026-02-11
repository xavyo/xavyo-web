import { apiClient } from './client';
import type {
	SocialProviderConfig,
	SocialProviderListResponse,
	UpdateSocialProviderRequest,
	SocialConnectionsResponse
} from './types';

export async function listSocialProviders(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SocialProviderListResponse> {
	return apiClient<SocialProviderListResponse>('/admin/social-providers', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateSocialProvider(
	provider: string,
	data: UpdateSocialProviderRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SocialProviderConfig> {
	return apiClient<SocialProviderConfig>(`/admin/social-providers/${provider}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteSocialProvider(
	provider: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/social-providers/${provider}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listSocialConnections(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SocialConnectionsResponse> {
	return apiClient<SocialConnectionsResponse>('/auth/social/connections', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function unlinkSocialAccount(
	provider: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/auth/social/unlink/${provider}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
