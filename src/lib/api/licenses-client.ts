import type {
	LicensePool,
	LicensePoolListResponse,
	LicenseAssignmentListResponse,
	LicenseDashboardResponse,
	LicenseRecommendation,
	ExpiringLicensesResponse,
	ReclamationRuleListResponse,
	LicenseIncompatibilityListResponse,
	LicenseEntitlementLink,
	LicenseEntitlementLinkListResponse,
	ComplianceReportRequest,
	ComplianceReport,
	LicenseAuditTrailResponse
} from './types';

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

// --- Pools ---

export async function fetchLicensePools(
	params: { vendor?: string; license_type?: string; status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<LicensePoolListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/licenses/pools${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch license pools: ${res.status}`);
	return res.json();
}

export async function deletePoolClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/licenses/pools/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete license pool: ${res.status}`);
}

export async function archivePoolClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<LicensePool> {
	const res = await fetchFn(`/api/governance/licenses/pools/${id}/archive`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to archive license pool: ${res.status}`);
	return res.json();
}

// --- Assignments ---

export async function fetchLicenseAssignments(
	params: { license_pool_id?: string; user_id?: string; status?: string; source?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<LicenseAssignmentListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/licenses/assignments${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch license assignments: ${res.status}`);
	return res.json();
}

export async function deallocateAssignmentClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/licenses/assignments/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to deallocate license assignment: ${res.status}`);
}

// --- Analytics ---

export async function fetchLicenseDashboard(
	fetchFn: typeof fetch = fetch
): Promise<LicenseDashboardResponse> {
	const res = await fetchFn('/api/governance/licenses/analytics/dashboard');
	if (!res.ok) throw new Error(`Failed to fetch license dashboard: ${res.status}`);
	return res.json();
}

export async function fetchLicenseRecommendations(
	fetchFn: typeof fetch = fetch
): Promise<LicenseRecommendation[]> {
	const res = await fetchFn('/api/governance/licenses/analytics/recommendations');
	if (!res.ok) throw new Error(`Failed to fetch license recommendations: ${res.status}`);
	return res.json();
}

export async function fetchExpiringPools(
	withinDays?: number,
	fetchFn: typeof fetch = fetch
): Promise<ExpiringLicensesResponse> {
	const qs = withinDays !== undefined ? `?within_days=${withinDays}` : '';
	const res = await fetchFn(`/api/governance/licenses/analytics/expiring${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch expiring pools: ${res.status}`);
	return res.json();
}

// --- Reclamation Rules ---

export async function fetchReclamationRules(
	params: { license_pool_id?: string; trigger_type?: string; enabled?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ReclamationRuleListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/licenses/reclamation-rules${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch reclamation rules: ${res.status}`);
	return res.json();
}

export async function deleteRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/licenses/reclamation-rules/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete reclamation rule: ${res.status}`);
}

// --- Incompatibilities ---

export async function fetchLicenseIncompatibilities(
	params: { pool_id?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<LicenseIncompatibilityListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/licenses/incompatibilities${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch license incompatibilities: ${res.status}`);
	return res.json();
}

export async function deleteIncompatibilityClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/licenses/incompatibilities/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete license incompatibility: ${res.status}`);
}

// --- Entitlement Links ---

export async function fetchEntitlementLinks(
	params: { license_pool_id?: string; entitlement_id?: string; enabled?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<LicenseEntitlementLinkListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/licenses/entitlement-links${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch entitlement links: ${res.status}`);
	return res.json();
}

export async function deleteEntitlementLinkClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/licenses/entitlement-links/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete entitlement link: ${res.status}`);
}

export async function toggleEntitlementLinkClient(
	id: string,
	enabled: boolean,
	fetchFn: typeof fetch = fetch
): Promise<LicenseEntitlementLink> {
	const res = await fetchFn(`/api/governance/licenses/entitlement-links/${id}/enabled`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ enabled })
	});
	if (!res.ok) throw new Error(`Failed to toggle entitlement link: ${res.status}`);
	return res.json();
}

// --- Reports ---

export async function generateComplianceReportClient(
	body?: ComplianceReportRequest,
	fetchFn: typeof fetch = fetch
): Promise<ComplianceReport> {
	const res = await fetchFn('/api/governance/licenses/reports/compliance', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body ?? {})
	});
	if (!res.ok) throw new Error(`Failed to generate compliance report: ${res.status}`);
	return res.json();
}

export async function fetchLicenseAuditTrail(
	params: { pool_id?: string; user_id?: string; action?: string; from_date?: string; to_date?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<LicenseAuditTrailResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/licenses/reports/audit-trail${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch license audit trail: ${res.status}`);
	return res.json();
}
