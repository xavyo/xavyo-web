import { apiClient } from './client';
import type {
	SemiManualApplication,
	SemiManualApplicationListResponse,
	ConfigureSemiManualRequest
} from './types';

export async function listSemiManualApplications(
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SemiManualApplicationListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/governance/semi-manual/applications${qs ? `?${qs}` : ''}`;

	return apiClient<SemiManualApplicationListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSemiManualApplication(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SemiManualApplication> {
	return apiClient<SemiManualApplication>(`/governance/semi-manual/applications/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function configureSemiManual(
	id: string,
	body: ConfigureSemiManualRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SemiManualApplication> {
	return apiClient<SemiManualApplication>(`/governance/semi-manual/applications/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeSemiManualConfig(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SemiManualApplication> {
	return apiClient<SemiManualApplication>(`/governance/semi-manual/applications/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
