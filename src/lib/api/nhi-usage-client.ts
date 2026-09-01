import type {
	NhiUsageListResponse,
	NhiUsageSummary,
	NhiStalenessReportResponse,
	NhiOverallSummary
} from './types';

export async function fetchNhiUsageHistory(
	nhiId: string,
	params: {
		target_resource?: string;
		outcome?: string;
		start_date?: string;
		end_date?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiUsageListResponse> {
	const searchParams = new URLSearchParams();
	if (params.target_resource) searchParams.set('target_resource', params.target_resource);
	if (params.outcome) searchParams.set('outcome', params.outcome);
	if (params.start_date) searchParams.set('start_date', params.start_date);
	if (params.end_date) searchParams.set('end_date', params.end_date);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/usage/${nhiId}${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI usage history: ${res.status}`);
	return res.json();
}

export async function fetchNhiUsageSummary(
	nhiId: string,
	fetchFn: typeof fetch = fetch,
	params: { period_days?: number } = {}
): Promise<NhiUsageSummary> {
	const searchParams = new URLSearchParams();
	if (params.period_days !== undefined) searchParams.set('period_days', String(params.period_days));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/nhi/usage/${nhiId}/summary${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI usage summary: ${res.status}`);
	return res.json();
}

export async function fetchNhiStalenessReport(
	params: { min_inactive_days?: number; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiStalenessReportResponse> {
	const searchParams = new URLSearchParams();
	if (params.min_inactive_days !== undefined) {
		searchParams.set('min_inactive_days', String(params.min_inactive_days));
	}
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
