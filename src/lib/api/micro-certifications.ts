import { apiClient } from './client';
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

// --- Micro Certifications ---

export async function listMicroCertifications(
	params: {
		status?: string;
		user_id?: string;
		reviewer_id?: string;
		entitlement_id?: string;
		escalated?: boolean;
		past_deadline?: boolean;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertificationListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.user_id) searchParams.set('user_id', params.user_id);
	if (params.reviewer_id) searchParams.set('reviewer_id', params.reviewer_id);
	if (params.entitlement_id) searchParams.set('entitlement_id', params.entitlement_id);
	if (params.escalated !== undefined) searchParams.set('escalated', String(params.escalated));
	if (params.past_deadline !== undefined)
		searchParams.set('past_deadline', String(params.past_deadline));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<MicroCertificationListResponse>(
		`/governance/micro-certifications${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getMyPendingCertifications(
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertificationListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<MicroCertificationListResponse>(
		`/governance/micro-certifications/my-pending${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getMicroCertification(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertification> {
	return apiClient<MicroCertification>(`/governance/micro-certifications/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function decideMicroCertification(
	id: string,
	body: DecideMicroCertificationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertification> {
	return apiClient<MicroCertification>(`/governance/micro-certifications/${id}/decide`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function delegateMicroCertification(
	id: string,
	body: DelegateMicroCertificationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertification> {
	return apiClient<MicroCertification>(`/governance/micro-certifications/${id}/delegate`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function skipMicroCertification(
	id: string,
	body: SkipMicroCertificationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertification> {
	return apiClient<MicroCertification>(`/governance/micro-certifications/${id}/skip`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function bulkDecideMicroCertifications(
	body: BulkDecisionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkDecisionResponse> {
	return apiClient<BulkDecisionResponse>('/governance/micro-certifications/bulk-decide', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getMicroCertificationStats(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertificationStats> {
	return apiClient<MicroCertificationStats>('/governance/micro-certifications/stats', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getMicroCertificationEvents(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CertificationEventListResponse> {
	return apiClient<CertificationEventListResponse>(
		`/governance/micro-certifications/${id}/events`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function searchCertificationEvents(
	params: {
		event_type?: string;
		actor_id?: string;
		certification_id?: string;
		from_date?: string;
		to_date?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<CertificationEventListResponse> {
	const searchParams = new URLSearchParams();
	if (params.event_type) searchParams.set('event_type', params.event_type);
	if (params.actor_id) searchParams.set('actor_id', params.actor_id);
	if (params.certification_id) searchParams.set('certification_id', params.certification_id);
	if (params.from_date) searchParams.set('from_date', params.from_date);
	if (params.to_date) searchParams.set('to_date', params.to_date);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<CertificationEventListResponse>(
		`/governance/micro-cert-events${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function manualTriggerCertification(
	body: ManualTriggerRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<MicroCertification> {
	return apiClient<MicroCertification>('/governance/micro-certifications/trigger', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Trigger Rules ---

export async function listTriggerRules(
	params: {
		trigger_type?: string;
		scope_type?: string;
		is_active?: boolean;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TriggerRuleListResponse> {
	const searchParams = new URLSearchParams();
	if (params.trigger_type) searchParams.set('trigger_type', params.trigger_type);
	if (params.scope_type) searchParams.set('scope_type', params.scope_type);
	if (params.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<TriggerRuleListResponse>(
		`/governance/micro-cert-triggers${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getTriggerRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TriggerRule> {
	return apiClient<TriggerRule>(`/governance/micro-cert-triggers/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createTriggerRule(
	body: CreateTriggerRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TriggerRule> {
	return apiClient<TriggerRule>('/governance/micro-cert-triggers', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateTriggerRule(
	id: string,
	body: UpdateTriggerRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TriggerRule> {
	return apiClient<TriggerRule>(`/governance/micro-cert-triggers/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteTriggerRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<void>(`/governance/micro-cert-triggers/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function enableTriggerRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TriggerRule> {
	return apiClient<TriggerRule>(`/governance/micro-cert-triggers/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableTriggerRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TriggerRule> {
	return apiClient<TriggerRule>(`/governance/micro-cert-triggers/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function setDefaultTriggerRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TriggerRule> {
	return apiClient<TriggerRule>(`/governance/micro-cert-triggers/${id}/set-default`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
