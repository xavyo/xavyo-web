import { apiClient } from './client';
import type {
	SwitchContextRequest,
	SwitchBackRequest,
	SwitchContextResponse,
	CurrentContextResponse,
	ContextSessionListResponse
} from './types';

export async function switchContext(
	body: SwitchContextRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SwitchContextResponse> {
	return apiClient<SwitchContextResponse>('/governance/context/switch', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function switchBack(
	body: SwitchBackRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SwitchContextResponse> {
	return apiClient<SwitchContextResponse>('/governance/context/switch-back', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function getCurrentContext(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CurrentContextResponse> {
	return apiClient<CurrentContextResponse>('/governance/context/current', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listContextSessions(
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ContextSessionListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<ContextSessionListResponse>(`/governance/context/sessions${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
