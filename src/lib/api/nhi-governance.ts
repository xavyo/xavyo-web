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
	CreateNhiCertCampaignRequest,
	CertifyNhiResponse,
	RevokeNhiCertResponse
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
	return apiClient<StalenessReportResponse>(`/governance/nhis/staleness-report${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Legacy alias
export const detectInactiveNhis = getStalenessReport;

// --- Grace Period & Suspend ---

export async function grantGracePeriod(
	id: string,
	graceDays: number,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/nhi/inactivity/grace-period/${id}`, {
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
	return apiClient<AutoSuspendResult>('/nhi/inactivity/auto-suspend', {
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
	params?: {
		limit?: number;
		offset?: number;
		status?: string;
		reason?: string;
		run_id?: string;
		user_id?: string;
		since?: string;
		until?: string;
	}
): Promise<OrphanDetectionListResponse> {
	const qs = buildSearchParams({
		limit: params?.limit ?? 50,
		offset: params?.offset ?? 0,
		status: params?.status,
		reason: params?.reason,
		run_id: params?.run_id,
		user_id: params?.user_id,
		since: params?.since,
		until: params?.until
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

export async function createNhiSodRule(
	body: CreateNhiSodRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSodRule> {
	return apiClient<NhiSodRule>('/nhi/sod/rules', {
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
	const raw = await apiClient<{
		items?: NhiSodRule[];
		data?: NhiSodRule[];
		total?: number;
		limit?: number;
		offset?: number;
	}>(`/nhi/sod/rules${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
	const items = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.data) ? raw.data : [];
	return {
		items,
		total: typeof raw.total === 'number' ? raw.total : items.length,
		limit: typeof raw.limit === 'number' ? raw.limit : (params.limit ?? items.length),
		offset: typeof raw.offset === 'number' ? raw.offset : (params.offset ?? 0)
	};
}

export async function getNhiSodRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSodRule> {
	return apiClient<NhiSodRule>(`/nhi/sod/rules/${id}`, {
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
	await apiClient<void>(`/nhi/sod/rules/${id}`, {
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
	return apiClient<NhiSodCheckResult>('/nhi/sod/check', {
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
	return apiClient<NhiCertificationCampaign>(
		`/governance/nhis/certification/campaigns/${campaignId}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function launchNhiCertCampaign(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>(
		`/governance/nhis/certification/campaigns/${campaignId}/launch`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function cancelNhiCertCampaign(
	campaignId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCertificationCampaign> {
	return apiClient<NhiCertificationCampaign>(
		`/governance/nhis/certification/campaigns/${campaignId}/cancel`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
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
		`/governance/nhis/certification/campaigns/${campaignId}/items${qs}`,
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
	return apiClient<NhiCertificationItem>(
		`/governance/nhis/certification/items/${itemId}/decide`,
		{
			method: 'POST',
			token,
			tenantId,
			body: { decision },
			fetch: fetchFn
		}
	);
}

export async function certifyNhi(
	campaignId: string,
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertifyNhiResponse> {
	return apiClient<CertifyNhiResponse>(
		`/nhi/certifications/${campaignId}/certify/${nhiId}`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function revokeNhiCertification(
	campaignId: string,
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RevokeNhiCertResponse> {
	return apiClient<RevokeNhiCertResponse>(
		`/nhi/certifications/${campaignId}/revoke/${nhiId}`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

