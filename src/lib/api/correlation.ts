import { apiClient } from './client';
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
	CorrelationCase,
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

// --- Connector-Scoped Correlation Rules ---

export async function listCorrelationRules(
	connectorId: string,
	params: {
		match_type?: string;
		is_active?: boolean;
		tier?: number;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationRuleListResponse> {
	const searchParams = new URLSearchParams();
	if (params.match_type) searchParams.set('match_type', params.match_type);
	if (params.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
	if (params.tier !== undefined) searchParams.set('tier', String(params.tier));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<CorrelationRuleListResponse>(
		`/governance/connectors/${connectorId}/correlation/rules${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getCorrelationRule(
	connectorId: string,
	ruleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationRule> {
	return apiClient<CorrelationRule>(
		`/governance/connectors/${connectorId}/correlation/rules/${ruleId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createCorrelationRule(
	connectorId: string,
	body: CreateCorrelationRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationRule> {
	return apiClient<CorrelationRule>(
		`/governance/connectors/${connectorId}/correlation/rules`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function updateCorrelationRule(
	connectorId: string,
	ruleId: string,
	body: UpdateCorrelationRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationRule> {
	return apiClient<CorrelationRule>(
		`/governance/connectors/${connectorId}/correlation/rules/${ruleId}`,
		{ method: 'PATCH', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteCorrelationRule(
	connectorId: string,
	ruleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/connectors/${connectorId}/correlation/rules/${ruleId}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

export async function validateExpression(
	connectorId: string,
	body: ValidateExpressionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ValidateExpressionResponse> {
	return apiClient<ValidateExpressionResponse>(
		`/governance/connectors/${connectorId}/correlation/rules/validate-expression`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

// --- Thresholds ---

export async function getCorrelationThresholds(
	connectorId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationThreshold> {
	return apiClient<CorrelationThreshold>(
		`/governance/connectors/${connectorId}/correlation/thresholds`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function upsertCorrelationThresholds(
	connectorId: string,
	body: UpsertCorrelationThresholdRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationThreshold> {
	return apiClient<CorrelationThreshold>(
		`/governance/connectors/${connectorId}/correlation/thresholds`,
		{ method: 'PUT', body, token, tenantId, fetch: fetchFn }
	);
}

// --- Jobs ---

export async function triggerCorrelation(
	connectorId: string,
	body: TriggerCorrelationRequest | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationJob> {
	return apiClient<CorrelationJob>(
		`/governance/connectors/${connectorId}/correlation/evaluate`,
		{ method: 'POST', body: body ?? {}, token, tenantId, fetch: fetchFn }
	);
}

export async function getCorrelationJobStatus(
	connectorId: string,
	jobId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationJob> {
	return apiClient<CorrelationJob>(
		`/governance/connectors/${connectorId}/correlation/jobs/${jobId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

// --- Statistics ---

export async function getCorrelationStatistics(
	connectorId: string,
	params: { start_date?: string; end_date?: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationStatistics> {
	const searchParams = new URLSearchParams();
	if (params.start_date) searchParams.set('start_date', params.start_date);
	if (params.end_date) searchParams.set('end_date', params.end_date);
	const qs = searchParams.toString();
	return apiClient<CorrelationStatistics>(
		`/governance/connectors/${connectorId}/correlation/statistics${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getCorrelationTrends(
	connectorId: string,
	params: { start_date: string; end_date: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationTrends> {
	const searchParams = new URLSearchParams();
	searchParams.set('start_date', params.start_date);
	searchParams.set('end_date', params.end_date);
	return apiClient<CorrelationTrends>(
		`/governance/connectors/${connectorId}/correlation/statistics/trends?${searchParams.toString()}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

// --- Cases (Global) ---

export async function listCorrelationCases(
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
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationCaseListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.connector_id) searchParams.set('connector_id', params.connector_id);
	if (params.assigned_to) searchParams.set('assigned_to', params.assigned_to);
	if (params.trigger_type) searchParams.set('trigger_type', params.trigger_type);
	if (params.start_date) searchParams.set('start_date', params.start_date);
	if (params.end_date) searchParams.set('end_date', params.end_date);
	if (params.sort_by) searchParams.set('sort_by', params.sort_by);
	if (params.sort_order) searchParams.set('sort_order', params.sort_order);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<CorrelationCaseListResponse>(
		`/governance/correlation/cases${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getCorrelationCase(
	caseId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationCaseDetail> {
	return apiClient<CorrelationCaseDetail>(
		`/governance/correlation/cases/${caseId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function confirmCorrelationCase(
	caseId: string,
	body: ConfirmCaseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationCaseDetail> {
	return apiClient<CorrelationCaseDetail>(
		`/governance/correlation/cases/${caseId}/confirm`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function rejectCorrelationCase(
	caseId: string,
	body: RejectCaseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationCaseDetail> {
	return apiClient<CorrelationCaseDetail>(
		`/governance/correlation/cases/${caseId}/reject`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function createIdentityFromCase(
	caseId: string,
	body: CreateIdentityFromCaseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationCaseDetail> {
	return apiClient<CorrelationCaseDetail>(
		`/governance/correlation/cases/${caseId}/create-identity`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function reassignCorrelationCase(
	caseId: string,
	body: ReassignCaseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationCaseDetail> {
	return apiClient<CorrelationCaseDetail>(
		`/governance/correlation/cases/${caseId}/reassign`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

// --- Identity Correlation Rules (Global) ---

export async function listIdentityCorrelationRules(
	params: {
		match_type?: string;
		is_active?: boolean;
		attribute?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<IdentityCorrelationRuleListResponse> {
	const searchParams = new URLSearchParams();
	if (params.match_type) searchParams.set('match_type', params.match_type);
	if (params.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
	if (params.attribute) searchParams.set('attribute', params.attribute);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<IdentityCorrelationRuleListResponse>(
		`/governance/identity-correlation-rules${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getIdentityCorrelationRule(
	ruleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<IdentityCorrelationRule> {
	return apiClient<IdentityCorrelationRule>(
		`/governance/identity-correlation-rules/${ruleId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createIdentityCorrelationRule(
	body: CreateIdentityCorrelationRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<IdentityCorrelationRule> {
	return apiClient<IdentityCorrelationRule>(
		'/governance/identity-correlation-rules',
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function updateIdentityCorrelationRule(
	ruleId: string,
	body: UpdateIdentityCorrelationRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<IdentityCorrelationRule> {
	return apiClient<IdentityCorrelationRule>(
		`/governance/identity-correlation-rules/${ruleId}`,
		{ method: 'PUT', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteIdentityCorrelationRule(
	ruleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/identity-correlation-rules/${ruleId}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

// --- Audit (Global) ---

export async function listCorrelationAuditEvents(
	params: {
		connector_id?: string;
		event_type?: string;
		outcome?: string;
		start_date?: string;
		end_date?: string;
		actor_id?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationAuditListResponse> {
	const searchParams = new URLSearchParams();
	if (params.connector_id) searchParams.set('connector_id', params.connector_id);
	if (params.event_type) searchParams.set('event_type', params.event_type);
	if (params.outcome) searchParams.set('outcome', params.outcome);
	if (params.start_date) searchParams.set('start_date', params.start_date);
	if (params.end_date) searchParams.set('end_date', params.end_date);
	if (params.actor_id) searchParams.set('actor_id', params.actor_id);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<CorrelationAuditListResponse>(
		`/governance/correlation/audit${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getCorrelationAuditEvent(
	eventId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CorrelationAuditEvent> {
	return apiClient<CorrelationAuditEvent>(
		`/governance/correlation/audit/${eventId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}
