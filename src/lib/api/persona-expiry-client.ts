import type {
	ExtendPersonaRequest,
	ExtendPersonaResponse,
	ExpiringPersonaListResponse,
	PropagateAttributesResponse
} from './types';

export async function fetchExpiringPersonas(
	params: { days_ahead?: number; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ExpiringPersonaListResponse> {
	const searchParams = new URLSearchParams();
	if (params.days_ahead !== undefined) searchParams.set('days_ahead', String(params.days_ahead));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/personas/expiring${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch expiring personas: ${res.status}`);
	return res.json();
}

export async function extendPersonaClient(
	personaId: string,
	body: ExtendPersonaRequest,
	fetchFn: typeof fetch = fetch
): Promise<ExtendPersonaResponse> {
	const res = await fetchFn(`/api/personas/${personaId}/extend`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to extend persona: ${res.status}`);
	return res.json();
}

export async function propagateAttributesClient(
	personaId: string,
	fetchFn: typeof fetch = fetch
): Promise<PropagateAttributesResponse> {
	const res = await fetchFn(`/api/personas/${personaId}/propagate`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to propagate attributes: ${res.status}`);
	return res.json();
}
