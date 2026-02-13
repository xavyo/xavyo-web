import { API_BASE_URL } from '$env/static/private';
import { apiClient, ApiError } from './client';
import type {
	SiemDestination,
	SiemDestinationListResponse,
	CreateSiemDestinationRequest,
	UpdateSiemDestinationRequest,
	SiemBatchExport,
	SiemBatchExportListResponse,
	CreateSiemExportRequest,
	SiemHealthSummary,
	SiemDeliveryHealthListResponse,
	SiemExportEventListResponse,
	TestConnectivityResponse,
	RedeliverResponse
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

// --- SIEM Destinations ---

export interface ListSiemDestinationsParams {
	enabled?: boolean;
	destination_type?: string;
	limit?: number;
	offset?: number;
}

export async function listSiemDestinations(
	params: ListSiemDestinationsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemDestinationListResponse> {
	const qs = buildSearchParams({
		enabled: params.enabled,
		destination_type: params.destination_type,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<SiemDestinationListResponse>(`/governance/siem/destinations${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createSiemDestination(
	data: CreateSiemDestinationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemDestination> {
	return apiClient<SiemDestination>('/governance/siem/destinations', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSiemDestination(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemDestination> {
	return apiClient<SiemDestination>(`/governance/siem/destinations/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateSiemDestination(
	id: string,
	data: UpdateSiemDestinationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemDestination> {
	return apiClient<SiemDestination>(`/governance/siem/destinations/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteSiemDestination(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/siem/destinations/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- SIEM Destination Test ---

export async function testSiemDestination(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TestConnectivityResponse> {
	return apiClient<TestConnectivityResponse>(`/governance/siem/destinations/${id}/test`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- SIEM Health ---

export async function getSiemHealthSummary(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemHealthSummary> {
	return apiClient<SiemHealthSummary>(`/governance/siem/destinations/${id}/health`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export interface ListSiemHealthHistoryParams {
	limit?: number;
	offset?: number;
}

export async function getSiemHealthHistory(
	id: string,
	params: ListSiemHealthHistoryParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemDeliveryHealthListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<SiemDeliveryHealthListResponse>(
		`/governance/siem/destinations/${id}/health/history${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- SIEM Dead Letter ---

export interface ListSiemDeadLetterParams {
	limit?: number;
	offset?: number;
}

export async function listSiemDeadLetter(
	id: string,
	params: ListSiemDeadLetterParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemExportEventListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<SiemExportEventListResponse>(
		`/governance/siem/destinations/${id}/dead-letter${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function redeliverSiemDeadLetter(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RedeliverResponse> {
	return apiClient<RedeliverResponse>(`/governance/siem/destinations/${id}/dead-letter/redeliver`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- SIEM Batch Exports ---

export interface ListSiemExportsParams {
	status?: string;
	output_format?: string;
	limit?: number;
	offset?: number;
}

export async function listSiemExports(
	params: ListSiemExportsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemBatchExportListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		output_format: params.output_format,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<SiemBatchExportListResponse>(`/governance/siem/exports${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createSiemExport(
	data: CreateSiemExportRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemBatchExport> {
	return apiClient<SiemBatchExport>('/governance/siem/exports', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSiemExport(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SiemBatchExport> {
	return apiClient<SiemBatchExport>(`/governance/siem/exports/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function downloadSiemExport(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<Response> {
	const f = fetchFn ?? globalThis.fetch;
	const res = await f(`${API_BASE_URL}/governance/siem/exports/${id}/download`, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'X-Tenant-Id': tenantId
		}
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Download failed' }));
		throw new ApiError(body.error || 'Download failed', res.status);
	}
	return res;
}
