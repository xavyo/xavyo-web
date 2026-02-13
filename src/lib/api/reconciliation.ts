import { apiClient } from './client';
import type {
	ReconciliationRun,
	ReconciliationRunListResponse,
	TriggerRunRequest,
	ReconciliationReport,
	Discrepancy,
	DiscrepancyListResponse,
	RemediateDiscrepancyRequest,
	RemediationResult,
	BulkRemediateRequest,
	BulkRemediateResponse,
	PreviewRemediationRequest,
	PreviewRemediationResponse,
	ReconciliationActionListResponse,
	ReconciliationSchedule,
	ReconciliationScheduleListResponse,
	UpsertScheduleRequest,
	DiscrepancyTrendResponse
} from './types';

export async function triggerRun(
	connectorId: string,
	body: TriggerRunRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationRun> {
	return apiClient<ReconciliationRun>(`/connectors/${connectorId}/reconciliation/runs`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listRuns(
	connectorId: string,
	params: {
		mode?: string;
		status?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationRunListResponse> {
	const searchParams = new URLSearchParams();
	if (params.mode) searchParams.set('mode', params.mode);
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/connectors/${connectorId}/reconciliation/runs${qs ? `?${qs}` : ''}`;

	return apiClient<ReconciliationRunListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRun(
	connectorId: string,
	runId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationRun> {
	return apiClient<ReconciliationRun>(
		`/connectors/${connectorId}/reconciliation/runs/${runId}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function cancelRun(
	connectorId: string,
	runId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/connectors/${connectorId}/reconciliation/runs/${runId}/cancel`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function resumeRun(
	connectorId: string,
	runId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationRun> {
	return apiClient<ReconciliationRun>(
		`/connectors/${connectorId}/reconciliation/runs/${runId}/resume`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function getRunReport(
	connectorId: string,
	runId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationReport> {
	return apiClient<ReconciliationReport>(
		`/connectors/${connectorId}/reconciliation/runs/${runId}/report`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function listDiscrepancies(
	connectorId: string,
	params: {
		run_id?: string;
		discrepancy_type?: string;
		resolution_status?: string;
		identity_id?: string;
		external_uid?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DiscrepancyListResponse> {
	const searchParams = new URLSearchParams();
	if (params.run_id) searchParams.set('run_id', params.run_id);
	if (params.discrepancy_type) searchParams.set('discrepancy_type', params.discrepancy_type);
	if (params.resolution_status) searchParams.set('resolution_status', params.resolution_status);
	if (params.identity_id) searchParams.set('identity_id', params.identity_id);
	if (params.external_uid) searchParams.set('external_uid', params.external_uid);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/connectors/${connectorId}/reconciliation/discrepancies${qs ? `?${qs}` : ''}`;

	return apiClient<DiscrepancyListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getDiscrepancy(
	connectorId: string,
	discrepancyId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Discrepancy> {
	return apiClient<Discrepancy>(
		`/connectors/${connectorId}/reconciliation/discrepancies/${discrepancyId}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function remediateDiscrepancy(
	connectorId: string,
	discrepancyId: string,
	body: RemediateDiscrepancyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<RemediationResult> {
	return apiClient<RemediationResult>(
		`/connectors/${connectorId}/reconciliation/discrepancies/${discrepancyId}/remediate`,
		{
			method: 'POST',
			body,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function bulkRemediate(
	connectorId: string,
	body: BulkRemediateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkRemediateResponse> {
	return apiClient<BulkRemediateResponse>(
		`/connectors/${connectorId}/reconciliation/discrepancies/bulk-remediate`,
		{
			method: 'POST',
			body,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function previewRemediation(
	connectorId: string,
	body: PreviewRemediationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<PreviewRemediationResponse> {
	return apiClient<PreviewRemediationResponse>(
		`/connectors/${connectorId}/reconciliation/discrepancies/preview`,
		{
			method: 'POST',
			body,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function ignoreDiscrepancy(
	connectorId: string,
	discrepancyId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/connectors/${connectorId}/reconciliation/discrepancies/${discrepancyId}/ignore`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function listReconciliationActions(
	connectorId: string,
	params: {
		discrepancy_id?: string;
		action_type?: string;
		result?: string;
		dry_run?: boolean;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationActionListResponse> {
	const searchParams = new URLSearchParams();
	if (params.discrepancy_id) searchParams.set('discrepancy_id', params.discrepancy_id);
	if (params.action_type) searchParams.set('action_type', params.action_type);
	if (params.result) searchParams.set('result', params.result);
	if (params.dry_run !== undefined) searchParams.set('dry_run', String(params.dry_run));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/connectors/${connectorId}/reconciliation/actions${qs ? `?${qs}` : ''}`;

	return apiClient<ReconciliationActionListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSchedule(
	connectorId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationSchedule> {
	return apiClient<ReconciliationSchedule>(
		`/connectors/${connectorId}/reconciliation/schedule`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function upsertSchedule(
	connectorId: string,
	body: UpsertScheduleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationSchedule> {
	return apiClient<ReconciliationSchedule>(
		`/connectors/${connectorId}/reconciliation/schedule`,
		{
			method: 'PUT',
			body,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function deleteSchedule(
	connectorId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/connectors/${connectorId}/reconciliation/schedule`,
		{
			method: 'DELETE',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function enableSchedule(
	connectorId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/connectors/${connectorId}/reconciliation/schedule/enable`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function disableSchedule(
	connectorId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/connectors/${connectorId}/reconciliation/schedule/disable`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function listAllSchedules(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ReconciliationScheduleListResponse> {
	return apiClient<ReconciliationScheduleListResponse>('/reconciliation/schedules', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getDiscrepancyTrend(
	params: {
		connector_id?: string;
		from?: string;
		to?: string;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DiscrepancyTrendResponse> {
	const searchParams = new URLSearchParams();
	if (params.connector_id) searchParams.set('connector_id', params.connector_id);
	if (params.from) searchParams.set('from', params.from);
	if (params.to) searchParams.set('to', params.to);
	const qs = searchParams.toString();
	const endpoint = `/reconciliation/trend${qs ? `?${qs}` : ''}`;

	return apiClient<DiscrepancyTrendResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
