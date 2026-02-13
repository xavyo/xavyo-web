// Provisioning Scripts client-side API
// All calls go through BFF proxy at /api/provisioning-scripts/...

import type {
	ProvisioningScript,
	ProvisioningScriptListResponse,
	ScriptVersion,
	ScriptVersionListResponse,
	VersionCompareResponse,
	HookBinding,
	HookBindingListResponse,
	ScriptTemplate,
	ScriptTemplateListResponse,
	ScriptValidationResult,
	ScriptDryRunResult
} from './types';

function buildSearchParams(params: Record<string, string | number | boolean | undefined>): string {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined) sp.set(k, String(v));
	}
	const qs = sp.toString();
	return qs ? `?${qs}` : '';
}

async function clientFetch<T>(url: string, options?: RequestInit): Promise<T> {
	const res = await fetch(url, options);
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Request failed' }));
		throw new Error(body.error || `Request failed: ${res.status}`);
	}
	return res.json();
}

// Scripts
export async function fetchScripts(
	params: { status?: string; search?: string; page?: number; page_size?: number } = {}
): Promise<ProvisioningScriptListResponse> {
	return clientFetch(`/api/provisioning-scripts${buildSearchParams(params)}`);
}

export async function fetchScript(id: string): Promise<ProvisioningScript> {
	return clientFetch(`/api/provisioning-scripts/${id}`);
}

export async function createScriptClient(data: {
	name: string;
	description?: string;
}): Promise<ProvisioningScript> {
	return clientFetch('/api/provisioning-scripts', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function updateScriptClient(
	id: string,
	data: { name?: string; description?: string }
): Promise<ProvisioningScript> {
	return clientFetch(`/api/provisioning-scripts/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function deleteScriptClient(id: string): Promise<void> {
	const res = await fetch(`/api/provisioning-scripts/${id}`, { method: 'DELETE' });
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Delete failed' }));
		throw new Error(body.error || 'Delete failed');
	}
}

export async function activateScriptClient(id: string): Promise<ProvisioningScript> {
	return clientFetch(`/api/provisioning-scripts/${id}/activate`, { method: 'POST' });
}

export async function deactivateScriptClient(id: string): Promise<ProvisioningScript> {
	return clientFetch(`/api/provisioning-scripts/${id}/deactivate`, { method: 'POST' });
}

// Versions
export async function fetchVersions(scriptId: string): Promise<ScriptVersionListResponse> {
	return clientFetch(`/api/provisioning-scripts/${scriptId}/versions`);
}

export async function fetchVersion(
	scriptId: string,
	versionNumber: number
): Promise<ScriptVersion> {
	return clientFetch(`/api/provisioning-scripts/${scriptId}/versions/${versionNumber}`);
}

export async function createVersionClient(
	scriptId: string,
	data: { script_body: string; change_description?: string }
): Promise<ScriptVersion> {
	return clientFetch(`/api/provisioning-scripts/${scriptId}/versions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function compareVersionsClient(
	scriptId: string,
	from: number,
	to: number
): Promise<VersionCompareResponse> {
	return clientFetch(
		`/api/provisioning-scripts/${scriptId}/versions/compare?from=${from}&to=${to}`
	);
}

export async function rollbackScriptClient(
	scriptId: string,
	data: { target_version: number; reason?: string }
): Promise<ScriptVersion> {
	return clientFetch(`/api/provisioning-scripts/${scriptId}/rollback`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

// Bindings
export async function fetchBindings(
	params: {
		connector_id?: string;
		script_id?: string;
		hook_phase?: string;
		operation_type?: string;
		page?: number;
		page_size?: number;
	} = {}
): Promise<HookBindingListResponse> {
	return clientFetch(`/api/provisioning-scripts/bindings${buildSearchParams(params)}`);
}

export async function fetchBinding(id: string): Promise<HookBinding> {
	return clientFetch(`/api/provisioning-scripts/bindings/${id}`);
}

export async function createBindingClient(data: {
	script_id: string;
	connector_id: string;
	hook_phase: string;
	operation_type: string;
	execution_order: number;
	failure_policy?: string;
	max_retries?: number;
	timeout_seconds?: number;
}): Promise<HookBinding> {
	return clientFetch('/api/provisioning-scripts/bindings', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function updateBindingClient(
	id: string,
	data: {
		execution_order?: number;
		failure_policy?: string;
		max_retries?: number;
		timeout_seconds?: number;
		enabled?: boolean;
	}
): Promise<HookBinding> {
	return clientFetch(`/api/provisioning-scripts/bindings/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function deleteBindingClient(id: string): Promise<void> {
	const res = await fetch(`/api/provisioning-scripts/bindings/${id}`, { method: 'DELETE' });
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Delete failed' }));
		throw new Error(body.error || 'Delete failed');
	}
}

export async function fetchBindingsByConnector(
	connectorId: string
): Promise<HookBindingListResponse> {
	return clientFetch(`/api/provisioning-scripts/connectors/${connectorId}/bindings`);
}

// Templates
export async function fetchTemplates(
	params: { category?: string; search?: string; page?: number; page_size?: number } = {}
): Promise<ScriptTemplateListResponse> {
	return clientFetch(`/api/provisioning-scripts/templates${buildSearchParams(params)}`);
}

export async function fetchTemplate(id: string): Promise<ScriptTemplate> {
	return clientFetch(`/api/provisioning-scripts/templates/${id}`);
}

export async function createTemplateClient(data: {
	name: string;
	description?: string;
	category: string;
	template_body: string;
	placeholder_annotations?: unknown;
}): Promise<ScriptTemplate> {
	return clientFetch('/api/provisioning-scripts/templates', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function updateTemplateClient(
	id: string,
	data: {
		name?: string;
		description?: string;
		category?: string;
		template_body?: string;
		placeholder_annotations?: unknown;
	}
): Promise<ScriptTemplate> {
	return clientFetch(`/api/provisioning-scripts/templates/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function deleteTemplateClient(id: string): Promise<void> {
	const res = await fetch(`/api/provisioning-scripts/templates/${id}`, { method: 'DELETE' });
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Delete failed' }));
		throw new Error(body.error || 'Delete failed');
	}
}

export async function instantiateTemplateClient(
	templateId: string,
	data: { name: string; description?: string }
): Promise<ProvisioningScript> {
	return clientFetch(`/api/provisioning-scripts/templates/${templateId}/instantiate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

// Validate & Dry-run
export async function validateScriptClient(
	scriptBody: string
): Promise<ScriptValidationResult> {
	return clientFetch('/api/provisioning-scripts/validate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ script_body: scriptBody })
	});
}

export async function dryRunScriptClient(context: unknown): Promise<ScriptDryRunResult> {
	return clientFetch('/api/provisioning-scripts/dry-run', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ context })
	});
}

export async function dryRunVersionClient(
	scriptId: string,
	versionNumber: number,
	context: unknown
): Promise<ScriptDryRunResult> {
	return clientFetch(
		`/api/provisioning-scripts/${scriptId}/versions/${versionNumber}/dry-run`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ context })
		}
	);
}
