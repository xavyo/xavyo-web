import { apiClient } from './client';
import type {
	ObjectTemplate,
	ObjectTemplateDetail,
	TemplateRule,
	TemplateScope,
	TemplateMergePolicy,
	TemplateSimulationResult
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

// --- Param interfaces ---

export interface ListObjectTemplatesParams {
	status?: string;
	object_type?: string;
	name?: string;
	limit?: number;
	offset?: number;
}

// --- Template CRUD ---

export async function createObjectTemplate(
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ObjectTemplate> {
	return apiClient<ObjectTemplate>('/governance/object-templates', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function listObjectTemplates(
	params: ListObjectTemplatesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: ObjectTemplate[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		status: params.status,
		object_type: params.object_type,
		name: params.name,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<{ items: ObjectTemplate[]; total: number; limit: number; offset: number }>(
		`/governance/object-templates${qs}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getObjectTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ObjectTemplateDetail> {
	return apiClient<ObjectTemplateDetail>(`/governance/object-templates/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateObjectTemplate(
	id: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ObjectTemplate> {
	return apiClient<ObjectTemplate>(`/governance/object-templates/${id}`, {
		method: 'PUT',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function deleteObjectTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/object-templates/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Lifecycle ---

export async function activateObjectTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ObjectTemplate> {
	return apiClient<ObjectTemplate>(`/governance/object-templates/${id}/activate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableObjectTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ObjectTemplate> {
	return apiClient<ObjectTemplate>(`/governance/object-templates/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Rules ---

export async function listTemplateRules(
	templateId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: TemplateRule[]; total: number; limit: number; offset: number }> {
	return apiClient<{ items: TemplateRule[]; total: number; limit: number; offset: number }>(
		`/governance/object-templates/${templateId}/rules`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createTemplateRule(
	templateId: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TemplateRule> {
	return apiClient<TemplateRule>(`/governance/object-templates/${templateId}/rules`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function updateTemplateRule(
	templateId: string,
	ruleId: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TemplateRule> {
	return apiClient<TemplateRule>(`/governance/object-templates/${templateId}/rules/${ruleId}`, {
		method: 'PUT',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function deleteTemplateRule(
	templateId: string,
	ruleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/object-templates/${templateId}/rules/${ruleId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Scopes ---

export async function listTemplateScopes(
	templateId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: TemplateScope[] }> {
	return apiClient<{ items: TemplateScope[] }>(
		`/governance/object-templates/${templateId}/scopes`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createTemplateScope(
	templateId: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TemplateScope> {
	return apiClient<TemplateScope>(`/governance/object-templates/${templateId}/scopes`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function deleteTemplateScope(
	templateId: string,
	scopeId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/object-templates/${templateId}/scopes/${scopeId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Merge Policies ---

export async function listTemplateMergePolicies(
	templateId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: TemplateMergePolicy[] }> {
	return apiClient<{ items: TemplateMergePolicy[] }>(
		`/governance/object-templates/${templateId}/merge-policies`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createTemplateMergePolicy(
	templateId: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TemplateMergePolicy> {
	return apiClient<TemplateMergePolicy>(
		`/governance/object-templates/${templateId}/merge-policies`,
		{
			method: 'POST',
			token,
			tenantId,
			body,
			fetch: fetchFn
		}
	);
}

export async function updateTemplateMergePolicy(
	templateId: string,
	policyId: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TemplateMergePolicy> {
	return apiClient<TemplateMergePolicy>(
		`/governance/object-templates/${templateId}/merge-policies/${policyId}`,
		{
			method: 'PUT',
			token,
			tenantId,
			body,
			fetch: fetchFn
		}
	);
}

export async function deleteTemplateMergePolicy(
	templateId: string,
	policyId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(
		`/governance/object-templates/${templateId}/merge-policies/${policyId}`,
		{
			method: 'DELETE',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- Simulation ---

export async function simulateTemplate(
	templateId: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TemplateSimulationResult> {
	return apiClient<TemplateSimulationResult>(
		`/governance/object-templates/${templateId}/simulate`,
		{
			method: 'POST',
			token,
			tenantId,
			body,
			fetch: fetchFn
		}
	);
}
