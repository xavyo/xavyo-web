import { apiClient } from './client';
import type {
	EntitlementListResponse,
	EntitlementResponse,
	CreateEntitlementRequest,
	UpdateEntitlementRequest,
	SodRuleListResponse,
	SodRuleResponse,
	CreateSodRuleRequest,
	UpdateSodRuleRequest,
	SodViolationListResponse,
	CertificationCampaignListResponse,
	CertificationCampaignResponse,
	CreateCampaignRequest,
	UpdateCampaignRequest,
	CampaignProgressResponse,
	CertificationItemListResponse,
	CertificationItemResponse,
	CertificationDecisionRequest,
	ApplicationListResponse
} from './types';

// --- Param interfaces ---

export interface ListEntitlementsParams {
	status?: string;
	risk_level?: string;
	classification?: string;
	limit?: number;
	offset?: number;
}

export interface ListSodRulesParams {
	status?: string;
	severity?: string;
	entitlement_id?: string;
	limit?: number;
	offset?: number;
}

export interface ListSodViolationsParams {
	limit?: number;
	offset?: number;
}

export interface ListCampaignsParams {
	status?: string;
	limit?: number;
	offset?: number;
}

export interface ListCampaignItemsParams {
	limit?: number;
	offset?: number;
}

export interface ListMyCertificationsParams {
	limit?: number;
	offset?: number;
}

export interface ListApplicationsParams {
	status?: string;
	app_type?: string;
	limit?: number;
	offset?: number;
}

// --- Helper ---

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

// --- Entitlements ---

export async function listEntitlements(
	params: ListEntitlementsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EntitlementListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		risk_level: params.risk_level,
		classification: params.classification,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<EntitlementListResponse>(`/governance/entitlements${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createEntitlement(
	data: CreateEntitlementRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EntitlementResponse> {
	return apiClient<EntitlementResponse>('/governance/entitlements', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getEntitlement(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EntitlementResponse> {
	return apiClient<EntitlementResponse>(`/governance/entitlements/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateEntitlement(
	id: string,
	data: UpdateEntitlementRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EntitlementResponse> {
	return apiClient<EntitlementResponse>(`/governance/entitlements/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteEntitlement(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/entitlements/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function setEntitlementOwner(
	id: string,
	ownerId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EntitlementResponse> {
	return apiClient<EntitlementResponse>(`/governance/entitlements/${id}/owner`, {
		method: 'PUT',
		body: { owner_id: ownerId },
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeEntitlementOwner(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EntitlementResponse> {
	return apiClient<EntitlementResponse>(`/governance/entitlements/${id}/owner`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- SoD Rules ---

export async function listSodRules(
	params: ListSodRulesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodRuleListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		severity: params.severity,
		entitlement_id: params.entitlement_id,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<SodRuleListResponse>(`/governance/sod-rules${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createSodRule(
	data: CreateSodRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodRuleResponse> {
	return apiClient<SodRuleResponse>('/governance/sod-rules', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSodRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodRuleResponse> {
	return apiClient<SodRuleResponse>(`/governance/sod-rules/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateSodRule(
	id: string,
	data: UpdateSodRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodRuleResponse> {
	return apiClient<SodRuleResponse>(`/governance/sod-rules/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteSodRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/sod-rules/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function enableSodRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodRuleResponse> {
	return apiClient<SodRuleResponse>(`/governance/sod-rules/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableSodRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodRuleResponse> {
	return apiClient<SodRuleResponse>(`/governance/sod-rules/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listSodViolations(
	params: ListSodViolationsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodViolationListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<SodViolationListResponse>(`/governance/sod-violations${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Certification Campaigns ---

export async function listCampaigns(
	params: ListCampaignsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationCampaignListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<CertificationCampaignListResponse>(`/governance/certification-campaigns${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createCampaign(
	data: CreateCampaignRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationCampaignResponse> {
	return apiClient<CertificationCampaignResponse>('/governance/certification-campaigns', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getCampaign(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationCampaignResponse> {
	return apiClient<CertificationCampaignResponse>(`/governance/certification-campaigns/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateCampaign(
	id: string,
	data: UpdateCampaignRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationCampaignResponse> {
	return apiClient<CertificationCampaignResponse>(`/governance/certification-campaigns/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteCampaign(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/certification-campaigns/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function launchCampaign(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationCampaignResponse> {
	return apiClient<CertificationCampaignResponse>(`/governance/certification-campaigns/${id}/launch`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelCampaign(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationCampaignResponse> {
	return apiClient<CertificationCampaignResponse>(`/governance/certification-campaigns/${id}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getCampaignProgress(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CampaignProgressResponse> {
	return apiClient<CampaignProgressResponse>(`/governance/certification-campaigns/${id}/progress`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listCampaignItems(
	campaignId: string,
	params: ListCampaignItemsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationItemListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<CertificationItemListResponse>(
		`/governance/certification-campaigns/${campaignId}/items${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function decideCertificationItem(
	itemId: string,
	data: CertificationDecisionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationItemResponse> {
	return apiClient<CertificationItemResponse>(`/governance/certification-items/${itemId}/decide`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listMyCertifications(
	params: ListMyCertificationsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificationItemListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<CertificationItemListResponse>(`/governance/my-certifications${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Applications ---

export async function listApplications(
	params: ListApplicationsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApplicationListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		app_type: params.app_type,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ApplicationListResponse>(`/governance/applications${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
