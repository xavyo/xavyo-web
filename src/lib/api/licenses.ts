import { apiClient } from './client';
import type {
	LicensePoolListResponse,
	LicensePool,
	CreateLicensePoolRequest,
	UpdateLicensePoolRequest,
	LicenseAssignmentListResponse,
	LicenseAssignment,
	AssignLicenseRequest,
	BulkAssignLicenseRequest,
	BulkReclaimLicenseRequest,
	BulkOperationResult,
	ReclamationRuleListResponse,
	ReclamationRule,
	CreateReclamationRuleRequest,
	UpdateReclamationRuleRequest,
	LicenseIncompatibilityListResponse,
	LicenseIncompatibility,
	CreateLicenseIncompatibilityRequest,
	LicenseEntitlementLinkListResponse,
	LicenseEntitlementLink,
	CreateLicenseEntitlementLinkRequest,
	LicenseDashboardResponse,
	LicenseRecommendation,
	ExpiringLicensesResponse,
	ComplianceReportRequest,
	ComplianceReport,
	LicenseAuditTrailResponse
} from './types';

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

// --- License Pools ---

export interface ListLicensePoolsParams {
	vendor?: string;
	license_type?: string;
	status?: string;
	limit?: number;
	offset?: number;
}

export async function listLicensePools(
	params: ListLicensePoolsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicensePoolListResponse> {
	const qs = buildSearchParams({
		vendor: params.vendor,
		license_type: params.license_type,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<LicensePoolListResponse>(`/governance/license-pools${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createLicensePool(
	data: CreateLicensePoolRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicensePool> {
	return apiClient<LicensePool>('/governance/license-pools', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getLicensePool(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicensePool> {
	return apiClient<LicensePool>(`/governance/license-pools/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateLicensePool(
	id: string,
	data: UpdateLicensePoolRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicensePool> {
	return apiClient<LicensePool>(`/governance/license-pools/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteLicensePool(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/license-pools/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function archiveLicensePool(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicensePool> {
	return apiClient<LicensePool>(`/governance/license-pools/${id}/archive`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- License Assignments ---

export interface ListLicenseAssignmentsParams {
	license_pool_id?: string;
	user_id?: string;
	status?: string;
	source?: string;
	limit?: number;
	offset?: number;
}

export async function listLicenseAssignments(
	params: ListLicenseAssignmentsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseAssignmentListResponse> {
	const qs = buildSearchParams({
		license_pool_id: params.license_pool_id,
		user_id: params.user_id,
		status: params.status,
		source: params.source,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<LicenseAssignmentListResponse>(`/governance/license-assignments${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createLicenseAssignment(
	data: AssignLicenseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseAssignment> {
	return apiClient<LicenseAssignment>('/governance/license-assignments', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getLicenseAssignment(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseAssignment> {
	return apiClient<LicenseAssignment>(`/governance/license-assignments/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deallocateLicenseAssignment(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/license-assignments/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function bulkAssignLicenses(
	data: BulkAssignLicenseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BulkOperationResult> {
	return apiClient<BulkOperationResult>('/governance/license-assignments/bulk-assign', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function bulkReclaimLicenses(
	data: BulkReclaimLicenseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BulkOperationResult> {
	return apiClient<BulkOperationResult>('/governance/license-assignments/bulk-reclaim', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Reclamation Rules ---

export interface ListReclamationRulesParams {
	license_pool_id?: string;
	trigger_type?: string;
	enabled?: boolean;
	limit?: number;
	offset?: number;
}

export async function listReclamationRules(
	params: ListReclamationRulesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReclamationRuleListResponse> {
	const qs = buildSearchParams({
		license_pool_id: params.license_pool_id,
		trigger_type: params.trigger_type,
		enabled: params.enabled,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ReclamationRuleListResponse>(`/governance/license-reclamation-rules${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createReclamationRule(
	data: CreateReclamationRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReclamationRule> {
	return apiClient<ReclamationRule>('/governance/license-reclamation-rules', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getReclamationRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReclamationRule> {
	return apiClient<ReclamationRule>(`/governance/license-reclamation-rules/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateReclamationRule(
	id: string,
	data: UpdateReclamationRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReclamationRule> {
	return apiClient<ReclamationRule>(`/governance/license-reclamation-rules/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteReclamationRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/license-reclamation-rules/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- License Incompatibilities ---

export interface ListLicenseIncompatibilitiesParams {
	pool_id?: string;
	limit?: number;
	offset?: number;
}

export async function listLicenseIncompatibilities(
	params: ListLicenseIncompatibilitiesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseIncompatibilityListResponse> {
	const qs = buildSearchParams({
		pool_id: params.pool_id,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<LicenseIncompatibilityListResponse>(
		`/governance/license-incompatibilities${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function createLicenseIncompatibility(
	data: CreateLicenseIncompatibilityRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseIncompatibility> {
	return apiClient<LicenseIncompatibility>('/governance/license-incompatibilities', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getLicenseIncompatibility(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseIncompatibility> {
	return apiClient<LicenseIncompatibility>(`/governance/license-incompatibilities/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteLicenseIncompatibility(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/license-incompatibilities/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- License-Entitlement Links ---

export interface ListLicenseEntitlementLinksParams {
	license_pool_id?: string;
	entitlement_id?: string;
	enabled?: boolean;
	limit?: number;
	offset?: number;
}

export async function listLicenseEntitlementLinks(
	params: ListLicenseEntitlementLinksParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseEntitlementLinkListResponse> {
	const qs = buildSearchParams({
		license_pool_id: params.license_pool_id,
		entitlement_id: params.entitlement_id,
		enabled: params.enabled,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<LicenseEntitlementLinkListResponse>(
		`/governance/license-entitlement-links${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function createLicenseEntitlementLink(
	data: CreateLicenseEntitlementLinkRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseEntitlementLink> {
	return apiClient<LicenseEntitlementLink>('/governance/license-entitlement-links', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getLicenseEntitlementLink(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseEntitlementLink> {
	return apiClient<LicenseEntitlementLink>(`/governance/license-entitlement-links/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteLicenseEntitlementLink(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/license-entitlement-links/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function toggleLicenseEntitlementLink(
	id: string,
	enabled: boolean,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseEntitlementLink> {
	return apiClient<LicenseEntitlementLink>(
		`/governance/license-entitlement-links/${id}/${enabled ? 'enable' : 'disable'}`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- License Analytics ---

export async function getLicenseDashboard(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseDashboardResponse> {
	return apiClient<LicenseDashboardResponse>('/governance/license-analytics/dashboard', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getLicenseRecommendations(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseRecommendation[]> {
	return apiClient<LicenseRecommendation[]>('/governance/license-analytics/recommendations', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getExpiringLicensePools(
	withinDays: number | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ExpiringLicensesResponse> {
	const qs = buildSearchParams({ within_days: withinDays });
	return apiClient<ExpiringLicensesResponse>(
		`/governance/license-analytics/expiring${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- License Reports ---

export async function generateComplianceReport(
	data: ComplianceReportRequest | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ComplianceReport> {
	return apiClient<ComplianceReport>('/governance/license-reports/compliance', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export interface ListLicenseAuditTrailParams {
	pool_id?: string;
	user_id?: string;
	action?: string;
	from_date?: string;
	to_date?: string;
	limit?: number;
	offset?: number;
}

export async function getLicenseAuditTrail(
	params: ListLicenseAuditTrailParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LicenseAuditTrailResponse> {
	const qs = buildSearchParams({
		pool_id: params.pool_id,
		user_id: params.user_id,
		action: params.action,
		from_date: params.from_date,
		to_date: params.to_date,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<LicenseAuditTrailResponse>(
		`/governance/license-reports/audit-trail${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}
