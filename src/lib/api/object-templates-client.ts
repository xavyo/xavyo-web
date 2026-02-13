import type {
	ObjectTemplate,
	ObjectTemplateDetail,
	TemplateRule,
	TemplateScope,
	TemplateMergePolicy,
	TemplateSimulationResult
} from './types';

async function throwApiError(res: Response, fallback: string): Promise<never> {
	try {
		const body = await res.json();
		throw new Error(body?.message || `${fallback}: ${res.status}`);
	} catch (e) {
		if (e instanceof Error && !e.message.includes(fallback)) throw e;
		throw new Error(`${fallback}: ${res.status}`);
	}
}

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

// === Templates ===

export async function fetchObjectTemplates(
	params: { status?: string; object_type?: string; name?: string; limit?: number; offset?: number } = {}
): Promise<{ items: ObjectTemplate[]; total: number }> {
	const qs = buildSearchParams(params);
	const res = await fetch(`/api/governance/object-templates${qs}`, {
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to fetch object templates');
	return res.json();
}

export async function fetchObjectTemplate(id: string): Promise<ObjectTemplateDetail> {
	const res = await fetch(`/api/governance/object-templates/${id}`, {
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to fetch object template');
	return res.json();
}

export async function deleteObjectTemplateClient(id: string): Promise<void> {
	const res = await fetch(`/api/governance/object-templates/${id}`, {
		method: 'DELETE',
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to delete object template');
}

export async function activateObjectTemplateClient(id: string): Promise<ObjectTemplate> {
	const res = await fetch(`/api/governance/object-templates/${id}/activate`, {
		method: 'POST',
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to activate object template');
	return res.json();
}

export async function disableObjectTemplateClient(id: string): Promise<ObjectTemplate> {
	const res = await fetch(`/api/governance/object-templates/${id}/disable`, {
		method: 'POST',
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to disable object template');
	return res.json();
}

// === Rules ===

export async function fetchTemplateRules(templateId: string): Promise<TemplateRule[]> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/rules`, {
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to fetch template rules');
	const data: { items: TemplateRule[] } = await res.json();
	return data.items;
}

export async function createTemplateRuleClient(
	templateId: string,
	body: Record<string, unknown>
): Promise<TemplateRule> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/rules`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'same-origin',
		body: JSON.stringify(body)
	});
	if (!res.ok) await throwApiError(res, 'Failed to create template rule');
	return res.json();
}

export async function updateTemplateRuleClient(
	templateId: string,
	ruleId: string,
	body: Record<string, unknown>
): Promise<TemplateRule> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/rules/${ruleId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'same-origin',
		body: JSON.stringify(body)
	});
	if (!res.ok) await throwApiError(res, 'Failed to update template rule');
	return res.json();
}

export async function deleteTemplateRuleClient(
	templateId: string,
	ruleId: string
): Promise<void> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/rules/${ruleId}`, {
		method: 'DELETE',
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to delete template rule');
}

// === Scopes ===

export async function fetchTemplateScopes(templateId: string): Promise<TemplateScope[]> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/scopes`, {
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to fetch template scopes');
	const data: { items: TemplateScope[] } = await res.json();
	return data.items;
}

export async function createTemplateScopeClient(
	templateId: string,
	body: Record<string, unknown>
): Promise<TemplateScope> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/scopes`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'same-origin',
		body: JSON.stringify(body)
	});
	if (!res.ok) await throwApiError(res, 'Failed to create template scope');
	return res.json();
}

export async function deleteTemplateScopeClient(
	templateId: string,
	scopeId: string
): Promise<void> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/scopes/${scopeId}`, {
		method: 'DELETE',
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to delete template scope');
}

// === Merge Policies ===

export async function fetchMergePolicies(templateId: string): Promise<TemplateMergePolicy[]> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/merge-policies`, {
		credentials: 'same-origin'
	});
	if (!res.ok) await throwApiError(res, 'Failed to fetch merge policies');
	const data: { items: TemplateMergePolicy[] } = await res.json();
	return data.items;
}

export async function createMergePolicyClient(
	templateId: string,
	body: Record<string, unknown>
): Promise<TemplateMergePolicy> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/merge-policies`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'same-origin',
		body: JSON.stringify(body)
	});
	if (!res.ok) await throwApiError(res, 'Failed to create merge policy');
	return res.json();
}

export async function updateMergePolicyClient(
	templateId: string,
	policyId: string,
	body: Record<string, unknown>
): Promise<TemplateMergePolicy> {
	const res = await fetch(
		`/api/governance/object-templates/${templateId}/merge-policies/${policyId}`,
		{
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify(body)
		}
	);
	if (!res.ok) await throwApiError(res, 'Failed to update merge policy');
	return res.json();
}

export async function deleteMergePolicyClient(
	templateId: string,
	policyId: string
): Promise<void> {
	const res = await fetch(
		`/api/governance/object-templates/${templateId}/merge-policies/${policyId}`,
		{
			method: 'DELETE',
			credentials: 'same-origin'
		}
	);
	if (!res.ok) await throwApiError(res, 'Failed to delete merge policy');
}

// === Simulation ===

export async function simulateTemplateClient(
	templateId: string,
	sampleObject: Record<string, unknown>
): Promise<TemplateSimulationResult> {
	const res = await fetch(`/api/governance/object-templates/${templateId}/simulate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'same-origin',
		body: JSON.stringify(sampleObject)
	});
	if (!res.ok) await throwApiError(res, 'Failed to simulate template');
	return res.json();
}
