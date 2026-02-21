import { apiClient } from './client';
import type {
	NhiRiskBreakdown,
	NhiRiskSummary,
	StalenessReportResponse,
	AutoSuspendResult,
	OrphanDetectionListResponse,
	NhiSodRule,
	NhiSodRuleListResponse,
	CreateNhiSodRuleRequest,
	NhiSodCheckResult,
	NhiSodCheckRequest,
	NhiCertificationCampaign,
	NhiCertificationItem,
	CreateNhiCertCampaignRequest
} from './types';

export interface ListNhiSodRulesParams {
	limit?: number;
	offset?: number;
}

export interface ListNhiCertCampaignsParams {
	status?: string;
	limit?: number;
	offset?: number;
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

// --- Risk Scoring ---

export async function getNhiRisk(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiRiskBreakdown> {
	return apiClient<NhiRiskBreakdown>(`/nhi/${id}/risk`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiRiskSummary(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiRiskSummary> {
	return apiClient<NhiRiskSummary>('/nhi/risk-summary', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Staleness Report (Inactivity Detection) ---

export async function getStalenessReport(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch,
	minInactiveDays?: number
): Promise<StalenessReportResponse> {
	const qs = minInactiveDays !== undefined
		? `?min_inactive_days=${minInactiveDays}`
		: '';
	return apiClient<StalenessReportResponse>(`/nhi/staleness-report${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Legacy alias
export const detectInactiveNhis = getStalenessReport;

// --- Grace Period & Suspend (via governance NHI endpoints) ---

export async function grantGracePeriod(
	id: string,
	graceDays: number,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	// Backend manages grace periods via governance NHI suspend flow
	await apiClient<void>(`/governance/nhis/${id}/grace-period`, {
		method: 'POST',
		token,
		tenantId,
		body: { grace_days: graceDays },
		fetch: fetchFn
	});
}

export async function autoSuspendExpired(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AutoSuspendResult> {
	return apiClient<AutoSuspendResult>('/governance/nhis/auto-suspend', {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Orphan Detection (via governance API) ---

export async function listOrphanDetections(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch,
	params?: { limit?: number; offset?: number; status?: string }
): Promise<OrphanDetectionListResponse> {
	const qs = buildSearchParams({
		limit: params?.limit ?? 50,
		offset: params?.offset ?? 0,
		status: params?.status
	});
	return apiClient<OrphanDetectionListResponse>(`/governance/orphan-detections${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Legacy alias
export const detectOrphanNhis = listOrphanDetections;

// --- NHI SoD Rules ---

// NHI SoD uses the governance SoD rules at /governance/sod-rules

export async function createNhiSodRule(
	body: CreateNhiSodRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSodRule> {
	return apiClient<NhiSodRule>('/governance/sod-rules', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listNhiSodRules(
	params: ListNhiSodRulesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSodRuleListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<NhiSodRuleListResponse>(`/governance/sod-rules${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiSodRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSodRule> {
	return apiClient<NhiSodRule>(`/governance/sod-rules/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteNhiSodRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/sod-rules/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function checkNhiSod(
	body: NhiSodCheckRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSodCheckResult> {
	return apiClient<NhiSodCheckResult>('/governance/sod-check', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

// --- NHI Certifications ---

export async function createNhiCertCampaign(
	body: CreateNhiCertCampaignRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>('/nhi/certifications', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listNhiCertCampaigns(
	params: ListNhiCertCampaignsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign[]> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<NhiCertificationCampaign[]>(`/nhi/certifications${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getNhiCertCampaign(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>(`/nhi/certifications/${campaignId}`, {
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
	return apiClient<NhiCertificationCampaign>(`/nhi/certifications/${campaignId}/launch`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelNhiCertCampaign(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>(`/nhi/certifications/${campaignId}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listNhiCertCampaignItems(
	campaignId: string,
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: NhiCertificationItem[]; total: number }> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<{ items: NhiCertificationItem[]; total: number }>(
		`/nhi/certifications/${campaignId}/items${qs}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function decideNhiCertItem(
	itemId: string,
	decision: 'certify' | 'revoke',
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationItem> {
	return apiClient<NhiCertificationItem>(`/nhi/certifications/items/${itemId}/decide`, {
		method: 'POST',
		token,
		tenantId,
		body: { decision },
		fetch: fetchFn
	});
}

