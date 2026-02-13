import { apiClient } from './client';
import type {
	NhiUsageRecord,
	NhiUsageListResponse,
	NhiUsageSummary,
	NhiStalenessReportResponse,
	NhiOverallSummary
} from './types';

export async function getNhiUsageHistory(
	nhiId: string,
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiUsageListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<NhiUsageListResponse>(`/governance/nhis/${nhiId}/usage${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiUsageSummary(
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiUsageSummary> {
	return apiClient<NhiUsageSummary>(`/governance/nhis/${nhiId}/usage/summary`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiStalenessReport(
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiStalenessReportResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<NhiStalenessReportResponse>(`/governance/nhis/staleness-report${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiOverallSummary(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiOverallSummary> {
	return apiClient<NhiOverallSummary>('/governance/nhis/summary', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
