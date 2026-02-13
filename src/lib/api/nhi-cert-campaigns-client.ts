import type {
	NhiCertificationCampaign,
	NhiCertificationItem,
	NhiCertCampaignSummary,
	DecideNhiCertItemBody,
	BulkDecideNhiCertBody,
	BulkDecideResult
} from './types';

export async function fetchNhiCertCampaignsV2(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: NhiCertificationCampaign[]; total: number }> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/certification/campaigns${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch cert campaigns: ${res.status}`);
	return res.json();
}

export async function fetchNhiCertCampaignV2(
	campaignId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiCertificationCampaign> {
	const res = await fetchFn(`/api/nhi/certification/campaigns/${campaignId}`);
	if (!res.ok) throw new Error(`Failed to fetch cert campaign: ${res.status}`);
	return res.json();
}

export async function launchNhiCertCampaignClient(
	campaignId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiCertificationCampaign> {
	const res = await fetchFn(`/api/nhi/certification/campaigns/${campaignId}/launch`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to launch cert campaign: ${res.status}`);
	return res.json();
}

export async function cancelNhiCertCampaignClient(
	campaignId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiCertificationCampaign> {
	const res = await fetchFn(`/api/nhi/certification/campaigns/${campaignId}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel cert campaign: ${res.status}`);
	return res.json();
}

export async function fetchNhiCertCampaignSummary(
	campaignId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiCertCampaignSummary> {
	const res = await fetchFn(`/api/nhi/certification/campaigns/${campaignId}/summary`);
	if (!res.ok) throw new Error(`Failed to fetch campaign summary: ${res.status}`);
	return res.json();
}

export async function fetchNhiCertCampaignItems(
	campaignId: string,
	params: { decision?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: NhiCertificationItem[]; total: number }> {
	const searchParams = new URLSearchParams();
	if (params.decision) searchParams.set('decision', params.decision);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/certification/campaigns/${campaignId}/items${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch campaign items: ${res.status}`);
	return res.json();
}

export async function decideNhiCertItemClient(
	itemId: string,
	body: DecideNhiCertItemBody,
	fetchFn: typeof fetch = fetch
): Promise<NhiCertificationItem> {
	const res = await fetchFn(`/api/nhi/certification/items/${itemId}/decide`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to decide cert item: ${res.status}`);
	return res.json();
}

export async function bulkDecideNhiCertItemsClient(
	body: BulkDecideNhiCertBody,
	fetchFn: typeof fetch = fetch
): Promise<BulkDecideResult> {
	const res = await fetchFn('/api/nhi/certification/items/bulk-decide', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to bulk decide cert items: ${res.status}`);
	return res.json();
}

export async function fetchMyPendingCertItems(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: NhiCertificationItem[]; total: number }> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/certification/my-pending${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch my pending cert items: ${res.status}`);
	return res.json();
}
