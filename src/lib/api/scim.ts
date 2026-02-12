import { apiClient } from './client';
import type {
	ScimTokenInfo,
	ScimTokenCreated,
	ScimAttributeMapping,
	UpdateMappingsRequest
} from './types';

export async function listScimTokens(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScimTokenInfo[]> {
	return apiClient<ScimTokenInfo[]>('/admin/scim/tokens', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createScimToken(
	name: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScimTokenCreated> {
	return apiClient<ScimTokenCreated>('/admin/scim/tokens', {
		method: 'POST',
		body: { name },
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeScimToken(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<null> {
	await apiClient(`/admin/scim/tokens/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
	return null;
}

export async function listScimMappings(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScimAttributeMapping[]> {
	return apiClient<ScimAttributeMapping[]>('/admin/scim/mappings', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateScimMappings(
	body: UpdateMappingsRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScimAttributeMapping[]> {
	return apiClient<ScimAttributeMapping[]>('/admin/scim/mappings', {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}
