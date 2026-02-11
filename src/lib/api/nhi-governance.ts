import { apiClient } from './client';
import type {
	NhiRiskBreakdown,
	NhiRiskSummary,
	InactiveNhiEntity,
	AutoSuspendResult,
	OrphanNhiEntity,
	NhiSodRule,
	NhiSodRuleListResponse,
	CreateNhiSodRuleRequest,
	NhiSodCheckResult,
	NhiSodCheckRequest,
	NhiCertificationCampaign,
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

// --- Inactivity Detection ---

export async function detectInactiveNhis(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<InactiveNhiEntity[]> {
	return apiClient<InactiveNhiEntity[]>('/nhi/inactivity/detect', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

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

// --- Orphan Detection ---

export async function detectOrphanNhis(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<OrphanNhiEntity[]> {
	return apiClient<OrphanNhiEntity[]>('/nhi/orphans/detect', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

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
	return apiClient<NhiSodRuleListResponse>(`/nhi/sod/rules${qs}`, {
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

export async function certifyNhi(
	campaignId: string,
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertifyNhiResponse> {
	return apiClient<CertifyNhiResponse>(`/nhi/certifications/${campaignId}/certify/${nhiId}`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeNhiCert(
	campaignId: string,
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RevokeNhiCertResponse> {
	return apiClient<RevokeNhiCertResponse>(`/nhi/certifications/${campaignId}/revoke/${nhiId}`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
