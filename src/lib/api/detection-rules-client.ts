import type { DetectionRule, DetectionRuleListResponse, CreateDetectionRuleRequest } from './types';

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

export async function fetchDetectionRules(
	params: { rule_type?: string; is_enabled?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<DetectionRuleListResponse> {
	const qs = buildSearchParams({
		rule_type: params.rule_type,
		is_enabled: params.is_enabled,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/detection-rules${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch detection rules: ${res.status}`);
	return res.json();
}

export async function createDetectionRuleClient(
	data: CreateDetectionRuleRequest,
	fetchFn: typeof fetch = fetch
): Promise<DetectionRule> {
	const res = await fetchFn('/api/governance/detection-rules', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create detection rule: ${res.status}`);
	return res.json();
}

export async function deleteDetectionRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/detection-rules/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete detection rule: ${res.status}`);
}

export async function enableDetectionRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<DetectionRule> {
	const res = await fetchFn(`/api/governance/detection-rules/${id}/enable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to enable detection rule: ${res.status}`);
	return res.json();
}

export async function disableDetectionRuleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<DetectionRule> {
	const res = await fetchFn(`/api/governance/detection-rules/${id}/disable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to disable detection rule: ${res.status}`);
	return res.json();
}

export async function seedDefaultRulesClient(
	fetchFn: typeof fetch = fetch
): Promise<DetectionRule[]> {
	const res = await fetchFn('/api/governance/detection-rules/seed-defaults', {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to seed default rules: ${res.status}`);
	return res.json();
}
