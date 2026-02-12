import { apiClient } from './client';
import type {
	OAuthClientListResponse,
	OAuthClientWithSecret,
	OAuthClient,
	CreateOAuthClientRequest,
	UpdateOAuthClientRequest
} from './types';

export async function listOAuthClients(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<OAuthClientListResponse> {
	return apiClient<OAuthClientListResponse>('/admin/oauth/clients', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createOAuthClient(
	body: CreateOAuthClientRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<OAuthClientWithSecret> {
	return apiClient<OAuthClientWithSecret>('/admin/oauth/clients', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getOAuthClient(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<OAuthClient> {
	return apiClient<OAuthClient>(`/admin/oauth/clients/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateOAuthClient(
	id: string,
	body: UpdateOAuthClientRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<OAuthClient> {
	return apiClient<OAuthClient>(`/admin/oauth/clients/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteOAuthClient(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/oauth/clients/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
