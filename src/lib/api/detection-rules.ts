import { apiClient } from './client';
import type {
	DetectionRule,
	DetectionRuleListResponse,
	CreateDetectionRuleRequest,
	UpdateDetectionRuleRequest
} from './types';

export async function listDetectionRules(
	params: { rule_type?: string; is_enabled?: boolean; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DetectionRuleListResponse> {
	const searchParams = new URLSearchParams();
	if (params.rule_type) searchParams.set('rule_type', params.rule_type);
	if (params.is_enabled !== undefined) searchParams.set('is_enabled', String(params.is_enabled));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/governance/detection-rules${qs ? `?${qs}` : ''}`;

	return apiClient<DetectionRuleListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getDetectionRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DetectionRule> {
	return apiClient<DetectionRule>(`/governance/detection-rules/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createDetectionRule(
	body: CreateDetectionRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DetectionRule> {
	return apiClient<DetectionRule>('/governance/detection-rules', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateDetectionRule(
	id: string,
	body: UpdateDetectionRuleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DetectionRule> {
	return apiClient<DetectionRule>(`/governance/detection-rules/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteDetectionRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`/governance/detection-rules/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function enableDetectionRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DetectionRule> {
	return apiClient<DetectionRule>(`/governance/detection-rules/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableDetectionRule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DetectionRule> {
	return apiClient<DetectionRule>(`/governance/detection-rules/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function seedDefaultRules(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DetectionRule[]> {
	return apiClient<DetectionRule[]>('/governance/detection-rules/seed-defaults', {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
