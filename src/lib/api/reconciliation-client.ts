import type {
	ReconciliationRunListResponse,
	ReconciliationRun,
	TriggerRunRequest,
	DiscrepancyListResponse,
	RemediateDiscrepancyRequest,
	RemediationResult,
	BulkRemediateRequest,
	BulkRemediateResponse,
	PreviewRemediationRequest,
	PreviewRemediationResponse,
	ReconciliationSchedule,
	ReconciliationScheduleListResponse,
	DiscrepancyTrendResponse
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

export async function fetchRuns(
	connectorId: string,
	params: {
		mode?: string;
		status?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<ReconciliationRunListResponse> {
	const qs = buildSearchParams({
		mode: params.mode,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/connectors/${connectorId}/reconciliation/runs${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch reconciliation runs: ${res.status}`);
	return res.json();
}

export async function triggerRunClient(
	connectorId: string,
	body: TriggerRunRequest,
	fetchFn: typeof fetch = fetch
): Promise<ReconciliationRun> {
	const res = await fetchFn(`/api/connectors/${connectorId}/reconciliation/runs`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to trigger reconciliation run: ${res.status}`);
	return res.json();
}

export async function fetchDiscrepancies(
	connectorId: string,
	params: {
		run_id?: string;
		discrepancy_type?: string;
		resolution_status?: string;
		identity_id?: string;
		external_uid?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<DiscrepancyListResponse> {
	const qs = buildSearchParams({
		run_id: params.run_id,
		discrepancy_type: params.discrepancy_type,
		resolution_status: params.resolution_status,
		identity_id: params.identity_id,
		external_uid: params.external_uid,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(
		`/api/connectors/${connectorId}/reconciliation/discrepancies${qs}`
	);
	if (!res.ok) throw new Error(`Failed to fetch discrepancies: ${res.status}`);
	return res.json();
}

export async function remediateClient(
	connectorId: string,
	discrepancyId: string,
	body: RemediateDiscrepancyRequest,
	fetchFn: typeof fetch = fetch
): Promise<RemediationResult> {
	const res = await fetchFn(
		`/api/connectors/${connectorId}/reconciliation/discrepancies/${discrepancyId}/remediate`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}
	);
	if (!res.ok) throw new Error(`Failed to remediate discrepancy: ${res.status}`);
	return res.json();
}

export async function bulkRemediateClient(
	connectorId: string,
	body: BulkRemediateRequest,
	fetchFn: typeof fetch = fetch
): Promise<BulkRemediateResponse> {
	const res = await fetchFn(
		`/api/connectors/${connectorId}/reconciliation/discrepancies/bulk-remediate`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}
	);
	if (!res.ok) throw new Error(`Failed to bulk remediate discrepancies: ${res.status}`);
	return res.json();
}

export async function previewClient(
	connectorId: string,
	body: PreviewRemediationRequest,
	fetchFn: typeof fetch = fetch
): Promise<PreviewRemediationResponse> {
	const res = await fetchFn(
		`/api/connectors/${connectorId}/reconciliation/discrepancies/preview`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}
	);
	if (!res.ok) throw new Error(`Failed to preview remediation: ${res.status}`);
	return res.json();
}

export async function ignoreClient(
	connectorId: string,
	discrepancyId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(
		`/api/connectors/${connectorId}/reconciliation/discrepancies/${discrepancyId}/ignore`,
		{
			method: 'POST'
		}
	);
	if (!res.ok) throw new Error(`Failed to ignore discrepancy: ${res.status}`);
}

export async function fetchSchedule(
	connectorId: string,
	fetchFn: typeof fetch = fetch
): Promise<ReconciliationSchedule> {
	const res = await fetchFn(
		`/api/connectors/${connectorId}/reconciliation/schedule`
	);
	if (!res.ok) throw new Error(`Failed to fetch reconciliation schedule: ${res.status}`);
	return res.json();
}

export async function fetchAllSchedules(
	fetchFn: typeof fetch = fetch
): Promise<ReconciliationScheduleListResponse> {
	const res = await fetchFn('/api/reconciliation/schedules');
	if (!res.ok) throw new Error(`Failed to fetch reconciliation schedules: ${res.status}`);
	return res.json();
}

export async function fetchTrend(
	params: {
		connector_id?: string;
		from?: string;
		to?: string;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<DiscrepancyTrendResponse> {
	const qs = buildSearchParams({
		connector_id: params.connector_id,
		from: params.from,
		to: params.to
	});
	const res = await fetchFn(`/api/reconciliation/trend${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch discrepancy trend: ${res.status}`);
	return res.json();
}
