import { apiClient } from './client';
import type {
	NhiCertificationCampaign,
	CreateNhiCertCampaignRequest,
	NhiCertificationItem,
	NhiCertCampaignSummary,
	DecideNhiCertItemBody,
	BulkDecideNhiCertBody,
	BulkDecideResult
} from './types';

export async function createNhiCertCampaignV2(
	body: CreateNhiCertCampaignRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>('/governance/nhis/certification/campaigns', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listNhiCertCampaignsV2(
	params: { status?: string; created_by?: string; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: NhiCertificationCampaign[]; total: number }> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.created_by) searchParams.set('created_by', params.created_by);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient(`/governance/nhis/certification/campaigns${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiCertCampaignV2(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>(`/governance/nhis/certification/campaigns/${campaignId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function launchNhiCertCampaign(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>(`/governance/nhis/certification/campaigns/${campaignId}/launch`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelNhiCertCampaignV2(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>(`/governance/nhis/certification/campaigns/${campaignId}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiCertCampaignSummary(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertCampaignSummary> {
	return apiClient<NhiCertCampaignSummary>(`/governance/nhis/certification/campaigns/${campaignId}/summary`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listNhiCertCampaignItems(
	campaignId: string,
	params: {
		decision?: string;
		status?: string;
		reviewer_id?: string;
		owner_id?: string;
		my_pending?: boolean;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: NhiCertificationItem[]; total: number }> {
	const searchParams = new URLSearchParams();
	if (params.decision) searchParams.set('decision', params.decision);
	if (params.status) searchParams.set('status', params.status);
	if (params.reviewer_id) searchParams.set('reviewer_id', params.reviewer_id);
	if (params.owner_id) searchParams.set('owner_id', params.owner_id);
	if (params.my_pending !== undefined) searchParams.set('my_pending', String(params.my_pending));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient(`/governance/nhis/certification/campaigns/${campaignId}/items${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiCertItem(
	itemId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationItem> {
	return apiClient<NhiCertificationItem>(`/governance/nhis/certification/items/${itemId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function decideNhiCertItem(
	itemId: string,
	body: DecideNhiCertItemBody,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationItem> {
	return apiClient<NhiCertificationItem>(`/governance/nhis/certification/items/${itemId}/decide`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function bulkDecideNhiCertItems(
	body: BulkDecideNhiCertBody,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BulkDecideResult> {
	return apiClient<BulkDecideResult>('/governance/nhis/certification/items/bulk-decide', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function getMyPendingCertItems(
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: NhiCertificationItem[]; total: number }> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient(`/governance/nhis/certification/my-pending${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
