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

// --- Destinations ---

export async function fetchSiemDestinations(
	params: { enabled?: boolean; destination_type?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<SiemDestinationListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/siem/destinations${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SIEM destinations: ${res.status}`);
	return res.json();
}

export async function fetchSiemDestination(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SiemDestination> {
	const res = await fetchFn(`/api/governance/siem/destinations/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch SIEM destination: ${res.status}`);
	return res.json();
}

export async function createSiemDestinationClient(
	body: CreateSiemDestinationRequest,
	fetchFn: typeof fetch = fetch
): Promise<SiemDestination> {
	const res = await fetchFn('/api/governance/siem/destinations', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create SIEM destination: ${res.status}`);
	return res.json();
}

export async function updateSiemDestinationClient(
	id: string,
	body: UpdateSiemDestinationRequest,
	fetchFn: typeof fetch = fetch
): Promise<SiemDestination> {
	const res = await fetchFn(`/api/governance/siem/destinations/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update SIEM destination: ${res.status}`);
	return res.json();
}

export async function deleteSiemDestinationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/siem/destinations/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete SIEM destination: ${res.status}`);
}

// --- Test ---

export async function testSiemDestinationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<TestConnectivityResponse> {
	const res = await fetchFn(`/api/governance/siem/destinations/${id}/test`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to test SIEM destination: ${res.status}`);
	return res.json();
}

// --- Health ---

export async function fetchSiemHealthSummary(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SiemHealthSummary> {
	const res = await fetchFn(`/api/governance/siem/destinations/${id}/health`);
	if (!res.ok) throw new Error(`Failed to fetch SIEM health summary: ${res.status}`);
	return res.json();
}

export async function fetchSiemHealthHistory(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<SiemDeliveryHealthListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/siem/destinations/${id}/health/history${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SIEM health history: ${res.status}`);
	return res.json();
}

// --- Dead Letter ---

export async function fetchSiemDeadLetter(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<SiemExportEventListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/siem/destinations/${id}/dead-letter${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SIEM dead letter queue: ${res.status}`);
	return res.json();
}

export async function redeliverSiemDeadLetterClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<RedeliverResponse> {
	const res = await fetchFn(`/api/governance/siem/destinations/${id}/dead-letter/redeliver`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to redeliver SIEM dead letter events: ${res.status}`);
	return res.json();
}

// --- Batch Exports ---

export async function fetchSiemExports(
	params: { status?: string; output_format?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<SiemBatchExportListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/siem/exports${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SIEM exports: ${res.status}`);
	return res.json();
}

export async function createSiemExportClient(
	body: CreateSiemExportRequest,
	fetchFn: typeof fetch = fetch
): Promise<SiemBatchExport> {
	const res = await fetchFn('/api/governance/siem/exports', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create SIEM export: ${res.status}`);
	return res.json();
}

export async function fetchSiemExport(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SiemBatchExport> {
	const res = await fetchFn(`/api/governance/siem/exports/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch SIEM export: ${res.status}`);
	return res.json();
}

export function downloadSiemExportUrl(id: string): string {
	return `/api/governance/siem/exports/${id}/download`;
}
