import type {
	MicroCertification,
	MicroCertificationListResponse,
	TriggerRule,
	TriggerRuleListResponse,
	CertificationEventListResponse,
	MicroCertificationStats,
	DecideMicroCertificationRequest,
	DelegateMicroCertificationRequest,
	SkipMicroCertificationRequest,
	BulkDecisionRequest,
	BulkDecisionResponse,
	ManualTriggerRequest,
	CreateTriggerRuleRequest,
	UpdateTriggerRuleRequest
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

// --- Micro Certifications ---

export async function fetchMicroCertifications(
	params: {
		status?: string;
		user_id?: string;
		reviewer_id?: string;
		entitlement_id?: string;
		escalated?: boolean;
		past_deadline?: boolean;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<MicroCertificationListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/micro-certifications${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch micro certifications: ${res.status}`);
	return res.json();
}

export async function fetchMyPendingCertifications(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<MicroCertificationListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/micro-certifications/my-pending${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch pending certifications: ${res.status}`);
	return res.json();
}

export async function fetchMicroCertification(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<MicroCertification> {
	const res = await fetchFn(`/api/governance/micro-certifications/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch micro certification: ${res.status}`);
	return res.json();
}

export async function decideMicroCertificationClient(
	id: string,
	body: DecideMicroCertificationRequest,
	fetchFn: typeof fetch = fetch
): Promise<MicroCertification> {
	const res = await fetchFn(`/api/governance/micro-certifications/${id}/decide`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to decide on certification: ${res.status}`);
	return res.json();
}

export async function delegateMicroCertificationClient(
	id: string,
	body: DelegateMicroCertificationRequest,
	fetchFn: typeof fetch = fetch
): Promise<MicroCertification> {
	const res = await fetchFn(`/api/governance/micro-certifications/${id}/delegate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to delegate certification: ${res.status}`);
	return res.json();
}

export async function skipMicroCertificationClient(
	id: string,
	body: SkipMicroCertificationRequest,
	fetchFn: typeof fetch = fetch
): Promise<MicroCertification> {
	const res = await fetchFn(`/api/governance/micro-certifications/${id}/skip`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to skip certification: ${res.status}`);
	return res.json();
}

export async function bulkDecideMicroCertificationsClient(
	body: BulkDecisionRequest,
	fetchFn: typeof fetch = fetch
): Promise<BulkDecisionResponse> {
	const res = await fetchFn('/api/governance/micro-certifications/bulk-decide', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to bulk decide: ${res.status}`);
	return res.json();
}

export async function fetchMicroCertificationStats(
	fetchFn: typeof fetch = fetch
): Promise<MicroCertificationStats> {
	const res = await fetchFn('/api/governance/micro-certifications/stats');
	if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
	return res.json();
}

export async function fetchCertificationEvents(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<CertificationEventListResponse> {
	const res = await fetchFn(`/api/governance/micro-certifications/${id}/events`);
	if (!res.ok) throw new Error(`Failed to fetch certification events: ${res.status}`);
	return res.json();
}

export async function searchCertificationEventsClient(
	params: {
		event_type?: string;
		actor_id?: string;
		certification_id?: string;
		from_date?: string;
		to_date?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<CertificationEventListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/micro-certifications/events${qs}`);
	if (!res.ok) throw new Error(`Failed to search certification events: ${res.status}`);
	return res.json();
}

export async function manualTriggerCertificationClient(
	body: ManualTriggerRequest,
	fetchFn: typeof fetch = fetch
): Promise<MicroCertification> {
	const res = await fetchFn('/api/governance/micro-certifications/trigger', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to trigger certification: ${res.status}`);
	return res.json();
}

// --- Trigger Rules ---

export async function fetchTriggerRules(
	params: {
		trigger_type?: string;
		scope_type?: string;
		is_active?: boolean;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<TriggerRuleListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/micro-certifications/triggers${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch trigger rules: ${res.status}`);
	return res.json();
}

export async function fetchTriggerRule(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<TriggerRule> {
	const res = await fetchFn(`/api/governance/micro-certifications/triggers/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch trigger rule: ${res.status}`);
	return res.json();
}

export async function createTriggerRuleClient(
	body: CreateTriggerRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<TriggerRule> {
	const res = await fetchFn('/api/governance/micro-certifications/triggers', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create trigger rule: ${res.status}`);
	return res.json();
}

export async function updateTriggerRuleClient(
	id: string,
	body: UpdateTriggerRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<TriggerRule> {
	const res = await fetchFn(`/api/governance/micro-certifications/triggers/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update trigger rule: ${res.status}`);
	return res.json();
}

export async function deleteTriggerRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/micro-certifications/triggers/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete trigger rule: ${res.status}`);
}

export async function enableTriggerRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<TriggerRule> {
	const res = await fetchFn(`/api/governance/micro-certifications/triggers/${id}/enable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to enable trigger rule: ${res.status}`);
	return res.json();
}

export async function disableTriggerRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<TriggerRule> {
	const res = await fetchFn(`/api/governance/micro-certifications/triggers/${id}/disable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to disable trigger rule: ${res.status}`);
	return res.json();
}

export async function setDefaultTriggerRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<TriggerRule> {
	const res = await fetchFn(`/api/governance/micro-certifications/triggers/${id}/set-default`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to set default trigger rule: ${res.status}`);
	return res.json();
}
