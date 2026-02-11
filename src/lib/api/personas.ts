import { apiClient } from './client';
import type {
	ArchetypeResponse,
	ArchetypeListResponse,
	CreateArchetypeRequest,
	UpdateArchetypeRequest,
	PersonaResponse,
	PersonaDetailResponse,
	PersonaListResponse,
	CreatePersonaRequest,
	UpdatePersonaRequest
} from './types';

// Archetype params

export interface ListArchetypesParams {
	offset?: number;
	limit?: number;
	name_contains?: string;
	is_active?: boolean;
}

// Archetype functions

export async function listArchetypes(
	params: ListArchetypesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ArchetypeListResponse> {
	const searchParams = new URLSearchParams();
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.name_contains) searchParams.set('name_contains', params.name_contains);
	if (params.is_active !== undefined) searchParams.set('is_active', String(params.is_active));

	const query = searchParams.toString();
	const endpoint = `/governance/persona-archetypes${query ? `?${query}` : ''}`;

	return apiClient<ArchetypeListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createArchetype(
	data: CreateArchetypeRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ArchetypeResponse> {
	return apiClient<ArchetypeResponse>('/governance/persona-archetypes', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getArchetype(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ArchetypeResponse> {
	return apiClient<ArchetypeResponse>(`/governance/persona-archetypes/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateArchetype(
	id: string,
	data: UpdateArchetypeRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ArchetypeResponse> {
	return apiClient<ArchetypeResponse>(`/governance/persona-archetypes/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteArchetype(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/persona-archetypes/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function activateArchetype(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ArchetypeResponse> {
	return apiClient<ArchetypeResponse>(`/governance/persona-archetypes/${id}/activate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deactivateArchetype(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ArchetypeResponse> {
	return apiClient<ArchetypeResponse>(`/governance/persona-archetypes/${id}/deactivate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Persona params

export interface ListPersonasParams {
	offset?: number;
	limit?: number;
	status?: string;
	archetype_id?: string;
	physical_user_id?: string;
}

// Persona functions

export async function listPersonas(
	params: ListPersonasParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PersonaListResponse> {
	const searchParams = new URLSearchParams();
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.status) searchParams.set('status', params.status);
	if (params.archetype_id) searchParams.set('archetype_id', params.archetype_id);
	if (params.physical_user_id) searchParams.set('physical_user_id', params.physical_user_id);

	const query = searchParams.toString();
	const endpoint = `/governance/personas${query ? `?${query}` : ''}`;

	return apiClient<PersonaListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createPersona(
	data: CreatePersonaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PersonaResponse> {
	return apiClient<PersonaResponse>('/governance/personas', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getPersona(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PersonaDetailResponse> {
	return apiClient<PersonaDetailResponse>(`/governance/personas/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updatePersona(
	id: string,
	data: UpdatePersonaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PersonaResponse> {
	return apiClient<PersonaResponse>(`/governance/personas/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function activatePersona(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PersonaResponse> {
	return apiClient<PersonaResponse>(`/governance/personas/${id}/activate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deactivatePersona(
	id: string,
	reason: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PersonaResponse> {
	return apiClient<PersonaResponse>(`/governance/personas/${id}/deactivate`, {
		method: 'POST',
		body: { reason },
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function archivePersona(
	id: string,
	reason: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PersonaResponse> {
	return apiClient<PersonaResponse>(`/governance/personas/${id}/archive`, {
		method: 'POST',
		body: { reason },
		token,
		tenantId,
		fetch: fetchFn
	});
}
