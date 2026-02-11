import { apiClient } from './client';
import type { SecurityAlert, SecurityAlertsResponse } from './types';

export interface AlertFilterParams {
	cursor?: string;
	limit?: number;
	type?: string;
	severity?: string;
	acknowledged?: boolean;
}

// --- Server-side functions (call xavyo-idp backend via apiClient) ---

export async function fetchAlerts(
	params: AlertFilterParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SecurityAlertsResponse> {
	const searchParams = new URLSearchParams();
	if (params.cursor !== undefined) searchParams.set('cursor', params.cursor);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.type) searchParams.set('type', params.type);
	if (params.severity) searchParams.set('severity', params.severity);
	if (params.acknowledged !== undefined)
		searchParams.set('acknowledged', String(params.acknowledged));

	const query = searchParams.toString();
	const endpoint = `/security-alerts${query ? `?${query}` : ''}`;

	return apiClient<SecurityAlertsResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function fetchAcknowledgeAlert(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SecurityAlert> {
	return apiClient<SecurityAlert>(`/security-alerts/${id}/acknowledge`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
