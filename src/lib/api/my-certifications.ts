import { apiClient } from './client';
import type {
	MyCertificationListResponse,
	MyCertificationItem
} from './types';

export interface ListMyCertificationsParams {
	campaign_id?: string;
	status?: string;
	page?: number;
	page_size?: number;
}

function buildSearchParams(params: Record<string, string | number | boolean | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

export async function listMyCertifications(
	params: ListMyCertificationsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MyCertificationListResponse> {
	const pageSize = params.page_size ?? 50;
	const page = params.page ?? 1;
	const qs = buildSearchParams({
		campaign_id: params.campaign_id,
		limit: pageSize,
		offset: Math.max(0, (page - 1) * pageSize)
	});
	return apiClient<MyCertificationListResponse>(`/governance/my-certifications${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function certifyItem(
	itemId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MyCertificationItem> {
	return apiClient<MyCertificationItem>(`/governance/certification-items/${itemId}/decide`, {
		method: 'POST',
		body: { decision_type: 'approved' },
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeItem(
	itemId: string,
	justification: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MyCertificationItem> {
	return apiClient<MyCertificationItem>(`/governance/certification-items/${itemId}/decide`, {
		method: 'POST',
		body: { decision_type: 'revoked', justification },
		token,
		tenantId,
		fetch: fetchFn
	});
}
