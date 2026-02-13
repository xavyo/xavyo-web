import type {
	EntitlementListResponse,
	EntitlementResponse,
	CreateEntitlementRequest,
	UpdateEntitlementRequest,
	SetEntitlementOwnerRequest,
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
	EntitlementStatus,
	RiskLevel,
	DataProtectionClassification,
	CampaignStatus,
	CertificationItemStatus
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

// --- Entitlements ---

export async function fetchEntitlements(
	params: {
		status?: EntitlementStatus;
		risk_level?: RiskLevel;
		classification?: DataProtectionClassification;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<EntitlementListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		risk_level: params.risk_level,
		classification: params.classification,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/entitlements${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch entitlements: ${res.status}`);
	return res.json();
}

export async function createEntitlementClient(
	data: CreateEntitlementRequest,
	fetchFn: typeof fetch = fetch
): Promise<EntitlementResponse> {
	const res = await fetchFn('/api/governance/entitlements', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create entitlement: ${res.status}`);
	return res.json();
}

export async function fetchEntitlement(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<EntitlementResponse> {
	const res = await fetchFn(`/api/governance/entitlements/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch entitlement: ${res.status}`);
	return res.json();
}

export async function updateEntitlementClient(
	id: string,
	data: UpdateEntitlementRequest,
	fetchFn: typeof fetch = fetch
): Promise<EntitlementResponse> {
	const res = await fetchFn(`/api/governance/entitlements/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update entitlement: ${res.status}`);
	return res.json();
}

export async function deleteEntitlementClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/entitlements/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete entitlement: ${res.status}`);
}

export async function setEntitlementOwnerClient(
	id: string,
	ownerId: string,
	fetchFn: typeof fetch = fetch
): Promise<EntitlementResponse> {
	const body: SetEntitlementOwnerRequest = { owner_id: ownerId };
	const res = await fetchFn(`/api/governance/entitlements/${id}/owner`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to set entitlement owner: ${res.status}`);
	return res.json();
}

export async function removeEntitlementOwnerClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/entitlements/${id}/owner`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove entitlement owner: ${res.status}`);
}

// --- SoD Rules ---

export async function fetchSodRules(
	params: {
		status?: string;
		severity?: RiskLevel;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<SodRuleListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		severity: params.severity,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/sod-rules${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SoD rules: ${res.status}`);
	return res.json();
}

export async function createSodRuleClient(
	data: CreateSodRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<SodRuleResponse> {
	const res = await fetchFn('/api/governance/sod-rules', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create SoD rule: ${res.status}`);
	return res.json();
}

export async function fetchSodRule(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SodRuleResponse> {
	const res = await fetchFn(`/api/governance/sod-rules/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch SoD rule: ${res.status}`);
	return res.json();
}

export async function updateSodRuleClient(
	id: string,
	data: UpdateSodRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<SodRuleResponse> {
	const res = await fetchFn(`/api/governance/sod-rules/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update SoD rule: ${res.status}`);
	return res.json();
}

export async function deleteSodRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/sod-rules/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete SoD rule: ${res.status}`);
}

export async function enableSodRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SodRuleResponse> {
	const res = await fetchFn(`/api/governance/sod-rules/${id}/enable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to enable SoD rule: ${res.status}`);
	return res.json();
}

export async function disableSodRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SodRuleResponse> {
	const res = await fetchFn(`/api/governance/sod-rules/${id}/disable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to disable SoD rule: ${res.status}`);
	return res.json();
}

export async function fetchSodViolations(
	params: {
		rule_id?: string;
		user_id?: string;
		severity?: RiskLevel;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<SodViolationListResponse> {
	const qs = buildSearchParams({
		rule_id: params.rule_id,
		user_id: params.user_id,
		severity: params.severity,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/sod-violations${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SoD violations: ${res.status}`);
	return res.json();
}

// --- Certification Campaigns ---

export async function fetchCampaigns(
	params: {
		status?: CampaignStatus;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<CertificationCampaignListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/certification-campaigns${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch campaigns: ${res.status}`);
	return res.json();
}

export async function createCampaignClient(
	data: CreateCampaignRequest,
	fetchFn: typeof fetch = fetch
): Promise<CertificationCampaignResponse> {
	const res = await fetchFn('/api/governance/certification-campaigns', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create campaign: ${res.status}`);
	return res.json();
}

export async function fetchCampaign(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<CertificationCampaignResponse> {
	const res = await fetchFn(`/api/governance/certification-campaigns/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch campaign: ${res.status}`);
	return res.json();
}

export async function updateCampaignClient(
	id: string,
	data: UpdateCampaignRequest,
	fetchFn: typeof fetch = fetch
): Promise<CertificationCampaignResponse> {
	const res = await fetchFn(`/api/governance/certification-campaigns/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update campaign: ${res.status}`);
	return res.json();
}

export async function deleteCampaignClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/certification-campaigns/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete campaign: ${res.status}`);
}

export async function launchCampaignClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<CertificationCampaignResponse> {
	const res = await fetchFn(`/api/governance/certification-campaigns/${id}/launch`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to launch campaign: ${res.status}`);
	return res.json();
}

export async function cancelCampaignClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<CertificationCampaignResponse> {
	const res = await fetchFn(`/api/governance/certification-campaigns/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel campaign: ${res.status}`);
	return res.json();
}

export async function fetchCampaignProgress(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<CampaignProgressResponse> {
	const res = await fetchFn(`/api/governance/certification-campaigns/${id}/progress`);
	if (!res.ok) throw new Error(`Failed to fetch campaign progress: ${res.status}`);
	return res.json();
}

export async function fetchCampaignItems(
	campaignId: string,
	params: {
		status?: CertificationItemStatus;
		reviewer_id?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<CertificationItemListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		reviewer_id: params.reviewer_id,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/certification-campaigns/${campaignId}/items${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch campaign items: ${res.status}`);
	return res.json();
}

export async function decideCertificationItemClient(
	itemId: string,
	data: CertificationDecisionRequest,
	fetchFn: typeof fetch = fetch
): Promise<CertificationItemResponse> {
	const res = await fetchFn(`/api/governance/certification-items/${itemId}/decide`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to decide certification item: ${res.status}`);
	return res.json();
}

export async function fetchMyCertifications(
	params: {
		status?: CertificationItemStatus;
		campaign_id?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<CertificationItemListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		campaign_id: params.campaign_id,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/my-certifications${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch my certifications: ${res.status}`);
	return res.json();
}
