import type { SecurityAlert, SecurityAlertsResponse } from './types';

export interface AlertFilterParams {
	cursor?: string;
	limit?: number;
	type?: string;
	severity?: string;
	acknowledged?: boolean;
}

// --- Client-side functions (call SvelteKit BFF proxy routes) ---

export async function getAlerts(
	params: AlertFilterParams,
	fetchFn: typeof fetch = fetch
): Promise<SecurityAlertsResponse> {
	const searchParams = new URLSearchParams();
	if (params.cursor !== undefined) searchParams.set('cursor', params.cursor);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.type) searchParams.set('type', params.type);
	if (params.severity) searchParams.set('severity', params.severity);
	if (params.acknowledged !== undefined)
		searchParams.set('acknowledged', String(params.acknowledged));

	const query = searchParams.toString();
	const url = `/api/alerts${query ? `?${query}` : ''}`;

	const res = await fetchFn(url);
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.message || body.error || 'Failed to fetch alerts');
	}
	return res.json();
}

export async function acknowledgeAlert(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SecurityAlert> {
	const res = await fetchFn(`/api/alerts/${id}/acknowledge`, {
		method: 'POST'
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.message || body.error || 'Failed to acknowledge alert');
	}
	return res.json();
}

export async function getUnacknowledgedCount(
	fetchFn: typeof fetch = fetch
): Promise<number> {
	const response = await getAlerts({ limit: 1, acknowledged: false }, fetchFn);
	return response.unacknowledged_count;
}
