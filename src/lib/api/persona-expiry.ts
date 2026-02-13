import { apiClient } from './client';
import type {
	ExtendPersonaRequest,
	ExtendPersonaResponse,
	ExpiringPersonaListResponse,
	PropagateAttributesResponse
} from './types';

export async function listExpiringPersonas(
	params: { days_ahead?: number; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ExpiringPersonaListResponse> {
	const searchParams = new URLSearchParams();
	if (params.days_ahead !== undefined) searchParams.set('days_ahead', String(params.days_ahead));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<ExpiringPersonaListResponse>(`/governance/personas/expiring${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function extendPersona(
	personaId: string,
	body: ExtendPersonaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ExtendPersonaResponse> {
	return apiClient<ExtendPersonaResponse>(`/governance/personas/${personaId}/extend`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function propagateAttributes(
	personaId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PropagateAttributesResponse> {
	return apiClient<PropagateAttributesResponse>(`/governance/personas/${personaId}/propagate-attributes`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
