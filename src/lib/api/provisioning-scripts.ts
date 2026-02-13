import { apiClient } from './client';
import type {
	ProvisioningScript,
	ProvisioningScriptListResponse,
	ScriptVersion,
	ScriptVersionListResponse,
	VersionCompareResponse,
	CreateProvisioningScriptRequest,
	UpdateProvisioningScriptRequest,
	CreateScriptVersionRequest,
	RollbackScriptRequest,
	HookBinding,
	HookBindingListResponse,
	CreateHookBindingRequest,
	UpdateHookBindingRequest,
	ScriptTemplate,
	ScriptTemplateListResponse,
	CreateScriptTemplateRequest,
	UpdateScriptTemplateRequest,
	InstantiateTemplateRequest,
	ScriptValidationResult,
	ScriptDryRunResult
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

// --- Provisioning Scripts ---

export interface ListProvisioningScriptsParams {
	status?: string;
	search?: string;
	page?: number;
	page_size?: number;
}

export async function listProvisioningScripts(
	params: ListProvisioningScriptsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScriptListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		search: params.search,
		page: params.page,
		page_size: params.page_size
	});
	return apiClient<ProvisioningScriptListResponse>(`/governance/scripts${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createProvisioningScript(
	data: CreateProvisioningScriptRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScript> {
	return apiClient<ProvisioningScript>('/governance/scripts', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getProvisioningScript(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScript> {
	return apiClient<ProvisioningScript>(`/governance/scripts/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateProvisioningScript(
	id: string,
	data: UpdateProvisioningScriptRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScript> {
	return apiClient<ProvisioningScript>(`/governance/scripts/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteProvisioningScript(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/scripts/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function activateProvisioningScript(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScript> {
	return apiClient<ProvisioningScript>(`/governance/scripts/${id}/activate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deactivateProvisioningScript(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScript> {
	return apiClient<ProvisioningScript>(`/governance/scripts/${id}/deactivate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Script Versions ---

export async function listScriptVersions(
	scriptId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptVersionListResponse> {
	return apiClient<ScriptVersionListResponse>(`/governance/scripts/${scriptId}/versions`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getScriptVersion(
	scriptId: string,
	versionNumber: number,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptVersion> {
	return apiClient<ScriptVersion>(
		`/governance/scripts/${scriptId}/versions/${versionNumber}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function createScriptVersion(
	scriptId: string,
	data: CreateScriptVersionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptVersion> {
	return apiClient<ScriptVersion>(`/governance/scripts/${scriptId}/versions`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function compareScriptVersions(
	scriptId: string,
	from: number,
	to: number,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<VersionCompareResponse> {
	const qs = buildSearchParams({ from, to });
	return apiClient<VersionCompareResponse>(
		`/governance/scripts/${scriptId}/versions/compare${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function rollbackScript(
	scriptId: string,
	data: RollbackScriptRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScript> {
	return apiClient<ProvisioningScript>(`/governance/scripts/${scriptId}/rollback`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Hook Bindings ---

export interface ListHookBindingsParams {
	connector_id?: string;
	script_id?: string;
	hook_phase?: string;
	operation_type?: string;
	page?: number;
	page_size?: number;
}

export async function listHookBindings(
	params: ListHookBindingsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<HookBindingListResponse> {
	const qs = buildSearchParams({
		connector_id: params.connector_id,
		script_id: params.script_id,
		hook_phase: params.hook_phase,
		operation_type: params.operation_type,
		page: params.page,
		page_size: params.page_size
	});
	return apiClient<HookBindingListResponse>(`/governance/script-bindings${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createHookBinding(
	data: CreateHookBindingRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<HookBinding> {
	return apiClient<HookBinding>('/governance/script-bindings', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getHookBinding(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<HookBinding> {
	return apiClient<HookBinding>(`/governance/script-bindings/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateHookBinding(
	id: string,
	data: UpdateHookBindingRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<HookBinding> {
	return apiClient<HookBinding>(`/governance/script-bindings/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteHookBinding(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/script-bindings/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listBindingsByConnector(
	connectorId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<HookBindingListResponse> {
	return apiClient<HookBindingListResponse>(
		`/governance/connectors/${connectorId}/script-bindings`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- Script Templates ---

export interface ListScriptTemplatesParams {
	category?: string;
	search?: string;
	page?: number;
	page_size?: number;
}

export async function listScriptTemplates(
	params: ListScriptTemplatesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptTemplateListResponse> {
	const qs = buildSearchParams({
		category: params.category,
		search: params.search,
		page: params.page,
		page_size: params.page_size
	});
	return apiClient<ScriptTemplateListResponse>(`/governance/script-templates${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createScriptTemplate(
	data: CreateScriptTemplateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptTemplate> {
	return apiClient<ScriptTemplate>('/governance/script-templates', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getScriptTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptTemplate> {
	return apiClient<ScriptTemplate>(`/governance/script-templates/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateScriptTemplate(
	id: string,
	data: UpdateScriptTemplateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptTemplate> {
	return apiClient<ScriptTemplate>(`/governance/script-templates/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteScriptTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/script-templates/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function instantiateTemplate(
	templateId: string,
	data: InstantiateTemplateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisioningScript> {
	return apiClient<ProvisioningScript>(
		`/governance/script-templates/${templateId}/instantiate`,
		{
			method: 'POST',
			body: data,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- Validate & Dry-Run ---

export async function validateScript(
	body: { script_body: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptValidationResult> {
	return apiClient<ScriptValidationResult>('/governance/scripts/validate', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function dryRunScript(
	body: { context: unknown },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptDryRunResult> {
	return apiClient<ScriptDryRunResult>('/governance/scripts/dry-run', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function dryRunScriptVersion(
	scriptId: string,
	versionNumber: number,
	body: { context: unknown },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptDryRunResult> {
	return apiClient<ScriptDryRunResult>(
		`/governance/scripts/${scriptId}/versions/${versionNumber}/dry-run`,
		{
			method: 'POST',
			body,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}
