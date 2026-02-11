import { apiClient } from './client';
import type {
	NhiListResponse,
	NhiDetailResponse,
	CreateToolRequest,
	UpdateToolRequest,
	CreateAgentRequest,
	UpdateAgentRequest,
	CreateServiceAccountRequest,
	UpdateServiceAccountRequest,
	NhiCredentialResponse,
	CredentialIssuedResponse,
	IssueCredentialRequest,
	RotateCredentialRequest
} from './types';

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
	return apiClient<NhiDetailResponse>('/nhi/tools', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getTool(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	return apiClient<NhiDetailResponse>(`/nhi/tools/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateTool(
	id: string,
	data: UpdateToolRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	return apiClient<NhiDetailResponse>(`/nhi/tools/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
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
	return apiClient<NhiDetailResponse>('/nhi/agents', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getAgent(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	return apiClient<NhiDetailResponse>(`/nhi/agents/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateAgent(
	id: string,
	data: UpdateAgentRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	return apiClient<NhiDetailResponse>(`/nhi/agents/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
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
	return apiClient<NhiDetailResponse>('/nhi/service-accounts', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getServiceAccount(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	return apiClient<NhiDetailResponse>(`/nhi/service-accounts/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateServiceAccount(
	id: string,
	data: UpdateServiceAccountRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiDetailResponse> {
	return apiClient<NhiDetailResponse>(`/nhi/service-accounts/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
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

// Credentials

export async function listCredentials(
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiCredentialResponse[]> {
	return apiClient<NhiCredentialResponse[]>(`/nhi/${nhiId}/credentials`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function issueCredential(
	nhiId: string,
	data: IssueCredentialRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CredentialIssuedResponse> {
	return apiClient<CredentialIssuedResponse>(`/nhi/${nhiId}/credentials`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function rotateCredential(
	nhiId: string,
	credId: string,
	data: RotateCredentialRequest | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CredentialIssuedResponse> {
	return apiClient<CredentialIssuedResponse>(`/nhi/${nhiId}/credentials/${credId}/rotate`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeCredential(
	nhiId: string,
	credId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${nhiId}/credentials/${credId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
