import type {
	NhiRiskBreakdown,
	NhiRiskSummary,
	StalenessReportResponse,
	AutoSuspendResult,
	OrphanDetectionListResponse,
	NhiSodRuleListResponse,
	NhiSodCheckResult,
	NhiCertificationCampaign,
	CertifyNhiResponse,
	RevokeNhiCertResponse
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

// --- Risk Scoring ---

export async function fetchNhiRisk(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiRiskBreakdown> {
	const res = await fetchFn(`/api/nhi/governance/risk/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI risk: ${res.status}`);
	return res.json();
}

export async function fetchNhiRiskSummary(
	fetchFn: typeof fetch = fetch
): Promise<NhiRiskSummary> {
	const res = await fetchFn('/api/nhi/governance/risk/summary');
	if (!res.ok) throw new Error(`Failed to fetch NHI risk summary: ${res.status}`);
	return res.json();
}

// --- Staleness / Inactivity ---

export async function fetchStalenessReport(
	fetchFn: typeof fetch = fetch,
	minInactiveDays?: number
): Promise<StalenessReportResponse> {
	const qs = minInactiveDays !== undefined ? `?min_inactive_days=${minInactiveDays}` : '';
	const res = await fetchFn(`/api/nhi/governance/inactivity${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch staleness report: ${res.status}`);
	return res.json();
}

// Legacy alias
export const fetchInactiveNhis = fetchStalenessReport;

export async function grantGracePeriodClient(
	id: string,
	graceDays: number,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/nhi/governance/inactivity/grace-period/${id}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ grace_days: graceDays })
	});
	if (!res.ok) throw new Error(`Failed to grant grace period: ${res.status}`);
}

export async function triggerAutoSuspend(
	fetchFn: typeof fetch = fetch
): Promise<AutoSuspendResult> {
	const res = await fetchFn('/api/nhi/governance/inactivity/auto-suspend', {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to auto-suspend: ${res.status}`);
	return res.json();
}

// --- Orphan Detections ---

export async function fetchOrphanDetections(
	fetchFn: typeof fetch = fetch,
	params?: { limit?: number; offset?: number; status?: string }
): Promise<OrphanDetectionListResponse> {
	const qs = params ? buildSearchParams(params) : '';
	const res = await fetchFn(`/api/nhi/governance/orphans${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch orphan detections: ${res.status}`);
	return res.json();
}

// Legacy alias
export const fetchOrphanNhis = fetchOrphanDetections;

// --- SoD Rules ---

export async function fetchNhiSodRules(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiSodRuleListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/nhi/governance/sod/rules${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI SoD rules: ${res.status}`);
	return res.json();
}

export async function deleteNhiSodRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/nhi/governance/sod/rules/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete NHI SoD rule: ${res.status}`);
}

export async function checkNhiSodClient(
	agentId: string,
	toolId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiSodCheckResult> {
	const res = await fetchFn('/api/nhi/governance/sod/check', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ agent_id: agentId, tool_id: toolId })
	});
	if (!res.ok) throw new Error(`Failed to check NHI SoD: ${res.status}`);
	return res.json();
}

// --- Certifications ---

export async function fetchNhiCertCampaigns(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<NhiCertificationCampaign[]> {
	const qs = buildSearchParams({ status: params.status, limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/nhi/governance/certifications${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch NHI cert campaigns: ${res.status}`);
	return res.json();
}

export async function certifyNhiClient(
	campaignId: string,
	nhiId: string,
	fetchFn: typeof fetch = fetch
): Promise<CertifyNhiResponse> {
	const res = await fetchFn(`/api/nhi/governance/certifications/${campaignId}/certify/${nhiId}`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to certify NHI: ${res.status}`);
	return res.json();
}

export async function revokeNhiCertClient(
	campaignId: string,
	nhiId: string,
	fetchFn: typeof fetch = fetch
): Promise<RevokeNhiCertResponse> {
	const res = await fetchFn(`/api/nhi/governance/certifications/${campaignId}/revoke/${nhiId}`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to revoke NHI cert: ${res.status}`);
	return res.json();
}
