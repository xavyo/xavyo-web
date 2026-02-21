import { apiClient } from './client';
import type {
	NhiListResponse,
	NhiDetailResponse,
	NhiAgentExtension,
	NhiToolExtension,
	NhiServiceAccountExtension,
	CreateToolRequest,
	UpdateToolRequest,
	CreateAgentRequest,
	UpdateAgentRequest,
	CreateServiceAccountRequest,
	UpdateServiceAccountRequest
} from './types';

// Backend entity-specific endpoints return flat structs (all fields at top level).
// The frontend expects nested NhiDetailResponse with tool/agent/service_account sub-objects.
// These helpers extract extension fields from the flat response and nest them.

const AGENT_EXT_KEYS: (keyof NhiAgentExtension)[] = [
	'agent_type', 'model_provider', 'model_name', 'model_version',
	'max_token_lifetime_secs', 'requires_human_approval'
];

const TOOL_EXT_KEYS: (keyof NhiToolExtension)[] = [
	'category', 'input_schema', 'output_schema', 'requires_approval',
	'max_calls_per_hour', 'provider', 'provider_verified', 'checksum',
	'last_discovered_at', 'discovery_source'
];

const SA_EXT_KEYS: (keyof NhiServiceAccountExtension)[] = ['purpose', 'environment'];

function normalizeAgent(flat: Record<string, unknown>): NhiDetailResponse {
	const agent: Record<string, unknown> = {};
	for (const key of AGENT_EXT_KEYS) {
		if (key in flat) agent[key] = flat[key];
	}
	return { ...flat, agent: agent as unknown as NhiAgentExtension } as unknown as NhiDetailResponse;
}

function normalizeTool(flat: Record<string, unknown>): NhiDetailResponse {
	const tool: Record<string, unknown> = {};
	for (const key of TOOL_EXT_KEYS) {
		if (key in flat) tool[key] = flat[key];
	}
	return { ...flat, tool: tool as unknown as NhiToolExtension } as unknown as NhiDetailResponse;
}

function normalizeServiceAccount(flat: Record<string, unknown>): NhiDetailResponse {
	const sa: Record<string, unknown> = {};
	for (const key of SA_EXT_KEYS) {
		if (key in flat) sa[key] = flat[key];
	}
	return { ...flat, service_account: sa as unknown as NhiServiceAccountExtension } as unknown as NhiDetailResponse;
}

// List params

export interface ListNhiParams {
	offset?: number;
	limit?: number;
	nhi_type?: string;
	lifecycle_state?: string;
}

// Unified list

export async function listNhi(
	params: ListNhiParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiListResponse> {
	const searchParams = new URLSearchParams();
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.nhi_type) searchParams.set('nhi_type', params.nhi_type);
	if (params.lifecycle_state) searchParams.set('lifecycle_state', params.lifecycle_state);

	const query = searchParams.toString();
	const endpoint = `/nhi${query ? `?${query}` : ''}`;

	return apiClient<NhiListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Tool CRUD

export async function createTool(
	data: CreateToolRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>('/nhi/tools', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeTool(raw);
}

export async function getTool(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>(`/nhi/tools/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeTool(raw);
}

export async function updateTool(
	id: string,
	data: UpdateToolRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>(`/nhi/tools/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeTool(raw);
}

export async function deleteTool(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/tools/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Agent CRUD

export async function createAgent(
	data: CreateAgentRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>('/nhi/agents', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeAgent(raw);
}

export async function getAgent(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>(`/nhi/agents/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeAgent(raw);
}

export async function updateAgent(
	id: string,
	data: UpdateAgentRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>(`/nhi/agents/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeAgent(raw);
}

export async function deleteAgent(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/agents/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Service Account CRUD

export async function createServiceAccount(
	data: CreateServiceAccountRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>('/nhi/service-accounts', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeServiceAccount(raw);
}

export async function getServiceAccount(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>(`/nhi/service-accounts/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeServiceAccount(raw);
}

export async function updateServiceAccount(
	id: string,
	data: UpdateServiceAccountRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	const raw = await apiClient<Record<string, unknown>>(`/nhi/service-accounts/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
	return normalizeServiceAccount(raw);
}

export async function deleteServiceAccount(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/service-accounts/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Lifecycle

export async function activateNhi(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${id}/activate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function suspendNhi(
	id: string,
	reason: string | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${id}/suspend`, {
		method: 'POST',
		body: reason ? { reason } : undefined,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function reactivateNhi(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${id}/reactivate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deprecateNhi(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${id}/deprecate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function archiveNhi(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${id}/archive`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

