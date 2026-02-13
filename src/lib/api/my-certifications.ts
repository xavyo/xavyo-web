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
	const qs = buildSearchParams({
		campaign_id: params.campaign_id,
		status: params.status,
		page: params.page,
		page_size: params.page_size
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
	return apiClient<MyCertificationItem>(`/governance/my-certifications/${itemId}/certify`, {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeItem(
	itemId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MyCertificationItem> {
	return apiClient<MyCertificationItem>(`/governance/my-certifications/${itemId}/revoke`, {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}
