import type {
	NhiUsageListResponse,
	NhiUsageSummary,
	NhiStalenessReportResponse,
	NhiOverallSummary
} from './types';

export async function fetchNhiUsageHistory(
	nhiId: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiUsageListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/usage/${nhiId}${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI usage history: ${res.status}`);
	return res.json();
}

export async function fetchNhiUsageSummary(
	nhiId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiUsageSummary> {
	const res = await fetchFn(`/api/nhi/usage/${nhiId}/summary`);
	if (!res.ok) throw new Error(`Failed to fetch NHI usage summary: ${res.status}`);
	return res.json();
}

export async function fetchNhiStalenessReport(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiStalenessReportResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/usage/staleness${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch staleness report: ${res.status}`);
	return res.json();
}

export async function fetchNhiOverallSummary(
	fetchFn: typeof fetch = fetch
): Promise<NhiOverallSummary> {
	const res = await fetchFn('/api/nhi/summary');
	if (!res.ok) throw new Error(`Failed to fetch NHI summary: ${res.status}`);
	return res.json();
}
