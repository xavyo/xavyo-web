import type {
	OperationListResponse,
	QueueStatistics,
	DlqResponse,
	ProvisioningOperation,
	ConflictListResponse,
	ProvisioningConflict,
	ResolveConflictRequest
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

export async function fetchOperations(
	params: {
		connector_id?: string;
		user_id?: string;
		status?: string;
		operation_type?: string;
		from_date?: string;
		to_date?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<OperationListResponse> {
	const qs = buildSearchParams({
		connector_id: params.connector_id,
		user_id: params.user_id,
		status: params.status,
		operation_type: params.operation_type,
		from_date: params.from_date,
		to_date: params.to_date,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/operations${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch operations: ${res.status}`);
	return res.json();
}

export async function fetchOperationStats(
	connectorId?: string,
	fetchFn: typeof fetch = fetch
): Promise<QueueStatistics> {
	const qs = buildSearchParams({ connector_id: connectorId });
	const res = await fetchFn(`/api/operations/stats${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch operation stats: ${res.status}`);
	return res.json();
}

export async function fetchOperationsDlq(
	params: {
		connector_id?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<DlqResponse> {
	const qs = buildSearchParams({
		connector_id: params.connector_id,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/operations/dlq${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch DLQ operations: ${res.status}`);
	return res.json();
}

export async function retryOperationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ProvisioningOperation> {
	const res = await fetchFn(`/api/operations/${id}/retry`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to retry operation: ${res.status}`);
	return res.json();
}

export async function cancelOperationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ProvisioningOperation> {
	const res = await fetchFn(`/api/operations/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel operation: ${res.status}`);
	return res.json();
}

export async function resolveOperationClient(
	id: string,
	notes?: string,
	fetchFn: typeof fetch = fetch
): Promise<ProvisioningOperation> {
	const res = await fetchFn(`/api/operations/${id}/resolve`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ resolution_notes: notes })
	});
	if (!res.ok) throw new Error(`Failed to resolve operation: ${res.status}`);
	return res.json();
}

export async function fetchConflicts(
	params: {
		operation_id?: string;
		conflict_type?: string;
		pending_only?: boolean;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<ConflictListResponse> {
	const qs = buildSearchParams({
		operation_id: params.operation_id,
		conflict_type: params.conflict_type,
		pending_only: params.pending_only,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/operations/conflicts${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch conflicts: ${res.status}`);
	return res.json();
}

export async function resolveConflictClient(
	id: string,
	body: ResolveConflictRequest,
	fetchFn: typeof fetch = fetch
): Promise<ProvisioningConflict> {
	const res = await fetchFn(`/api/operations/conflicts/${id}/resolve`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to resolve conflict: ${res.status}`);
	return res.json();
}
