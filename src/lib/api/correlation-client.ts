import type {
	CorrelationRule,
	CorrelationRuleListResponse,
	CreateCorrelationRuleRequest,
	UpdateCorrelationRuleRequest,
	ValidateExpressionRequest,
	ValidateExpressionResponse,
	CorrelationThreshold,
	UpsertCorrelationThresholdRequest,
	CorrelationJob,
	TriggerCorrelationRequest,
	CorrelationStatistics,
	CorrelationTrends,
	CorrelationCaseListResponse,
	CorrelationCaseDetail,
	ConfirmCaseRequest,
	RejectCaseRequest,
	CreateIdentityFromCaseRequest,
	ReassignCaseRequest,
	IdentityCorrelationRule,
	IdentityCorrelationRuleListResponse,
	CreateIdentityCorrelationRuleRequest,
	UpdateIdentityCorrelationRuleRequest,
	CorrelationAuditEvent,
	CorrelationAuditListResponse
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

// --- Connector-Scoped Rules ---

export async function fetchCorrelationRules(
	connectorId: string,
	params: { match_type?: string; is_active?: boolean; tier?: number; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<CorrelationRuleListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/rules${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch correlation rules: ${res.status}`);
	return res.json();
}

export async function fetchCorrelationRule(
	connectorId: string,
	ruleId: string,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationRule> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/rules/${ruleId}`);
	if (!res.ok) throw new Error(`Failed to fetch correlation rule: ${res.status}`);
	return res.json();
}

export async function createCorrelationRuleClient(
	connectorId: string,
	body: CreateCorrelationRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationRule> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/rules`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create correlation rule: ${res.status}`);
	return res.json();
}

export async function updateCorrelationRuleClient(
	connectorId: string,
	ruleId: string,
	body: UpdateCorrelationRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationRule> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/rules/${ruleId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update correlation rule: ${res.status}`);
	return res.json();
}

export async function deleteCorrelationRuleClient(
	connectorId: string,
	ruleId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/rules/${ruleId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete correlation rule: ${res.status}`);
}

export async function validateExpressionClient(
	connectorId: string,
	body: ValidateExpressionRequest,
	fetchFn: typeof fetch = fetch
): Promise<ValidateExpressionResponse> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/rules/validate-expression`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to validate expression: ${res.status}`);
	return res.json();
}

// --- Thresholds ---

export async function fetchCorrelationThresholds(
	connectorId: string,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationThreshold> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/thresholds`);
	if (!res.ok) throw new Error(`Failed to fetch thresholds: ${res.status}`);
	return res.json();
}

export async function upsertCorrelationThresholdsClient(
	connectorId: string,
	body: UpsertCorrelationThresholdRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationThreshold> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/thresholds`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to save thresholds: ${res.status}`);
	return res.json();
}

// --- Jobs ---

export async function triggerCorrelationClient(
	connectorId: string,
	body?: TriggerCorrelationRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationJob> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/evaluate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body ?? {})
	});
	if (!res.ok) throw new Error(`Failed to trigger correlation: ${res.status}`);
	return res.json();
}

export async function fetchCorrelationJobStatus(
	connectorId: string,
	jobId: string,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationJob> {
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/jobs/${jobId}`);
	if (!res.ok) throw new Error(`Failed to fetch job status: ${res.status}`);
	return res.json();
}

// --- Statistics ---

export async function fetchCorrelationStatistics(
	connectorId: string,
	params: { start_date?: string; end_date?: string } = {},
	fetchFn: typeof fetch = fetch
): Promise<CorrelationStatistics> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/statistics${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch statistics: ${res.status}`);
	return res.json();
}

export async function fetchCorrelationTrends(
	connectorId: string,
	params: { start_date: string; end_date: string },
	fetchFn: typeof fetch = fetch
): Promise<CorrelationTrends> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/connectors/${connectorId}/correlation/statistics/trends${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch trends: ${res.status}`);
	return res.json();
}

// --- Cases (Global) ---

export async function fetchCorrelationCases(
	params: {
		status?: string;
		connector_id?: string;
		assigned_to?: string;
		trigger_type?: string;
		start_date?: string;
		end_date?: string;
		sort_by?: string;
		sort_order?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<CorrelationCaseListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/correlation/cases${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch cases: ${res.status}`);
	return res.json();
}

export async function fetchCorrelationCase(
	caseId: string,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationCaseDetail> {
	const res = await fetchFn(`/api/governance/correlation/cases/${caseId}`);
	if (!res.ok) throw new Error(`Failed to fetch case: ${res.status}`);
	return res.json();
}

export async function confirmCaseClient(
	caseId: string,
	body: ConfirmCaseRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationCaseDetail> {
	const res = await fetchFn(`/api/governance/correlation/cases/${caseId}/confirm`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to confirm case: ${res.status}`);
	return res.json();
}

export async function rejectCaseClient(
	caseId: string,
	body: RejectCaseRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationCaseDetail> {
	const res = await fetchFn(`/api/governance/correlation/cases/${caseId}/reject`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to reject case: ${res.status}`);
	return res.json();
}

export async function createIdentityFromCaseClient(
	caseId: string,
	body: CreateIdentityFromCaseRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationCaseDetail> {
	const res = await fetchFn(`/api/governance/correlation/cases/${caseId}/create-identity`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create identity from case: ${res.status}`);
	return res.json();
}

export async function reassignCaseClient(
	caseId: string,
	body: ReassignCaseRequest,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationCaseDetail> {
	const res = await fetchFn(`/api/governance/correlation/cases/${caseId}/reassign`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to reassign case: ${res.status}`);
	return res.json();
}

// --- Identity Correlation Rules (Global) ---

export async function fetchIdentityCorrelationRules(
	params: { match_type?: string; is_active?: boolean; attribute?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<IdentityCorrelationRuleListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/correlation/identity-rules${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch identity rules: ${res.status}`);
	return res.json();
}

export async function createIdentityCorrelationRuleClient(
	body: CreateIdentityCorrelationRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<IdentityCorrelationRule> {
	const res = await fetchFn('/api/governance/correlation/identity-rules', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create identity rule: ${res.status}`);
	return res.json();
}

export async function updateIdentityCorrelationRuleClient(
	ruleId: string,
	body: UpdateIdentityCorrelationRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<IdentityCorrelationRule> {
	const res = await fetchFn(`/api/governance/correlation/identity-rules/${ruleId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update identity rule: ${res.status}`);
	return res.json();
}

export async function deleteIdentityCorrelationRuleClient(
	ruleId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/correlation/identity-rules/${ruleId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete identity rule: ${res.status}`);
}

// --- Audit (Global) ---

export async function fetchCorrelationAuditEvents(
	params: {
		connector_id?: string;
		event_type?: string;
		outcome?: string;
		start_date?: string;
		end_date?: string;
		actor_id?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<CorrelationAuditListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/correlation/audit${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch audit events: ${res.status}`);
	return res.json();
}

export async function fetchCorrelationAuditEvent(
	eventId: string,
	fetchFn: typeof fetch = fetch
): Promise<CorrelationAuditEvent> {
	const res = await fetchFn(`/api/governance/correlation/audit/${eventId}`);
	if (!res.ok) throw new Error(`Failed to fetch audit event: ${res.status}`);
	return res.json();
}
