import { apiClient } from './client';
import type {
	OperationListResponse,
	TriggerOperationRequest,
	ProvisioningOperation,
	QueueStatistics,
	DlqResponse,
	ResolveOperationRequest,
	OperationLogsResponse,
	ExecutionAttemptsResponse,
	ConflictListResponse,
	ProvisioningConflict,
	ResolveConflictRequest
} from './types';

export async function listOperations(
	params: {
		connector_id?: string;
		user_id?: string;
		status?: string;
		operation_type?: string;
		from_date?: string;
		to_date?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<OperationListResponse> {
	const searchParams = new URLSearchParams();
	if (params.connector_id) searchParams.set('connector_id', params.connector_id);
	if (params.user_id) searchParams.set('user_id', params.user_id);
	if (params.status) searchParams.set('status', params.status);
	if (params.operation_type) searchParams.set('operation_type', params.operation_type);
	if (params.from_date) searchParams.set('from_date', params.from_date);
	if (params.to_date) searchParams.set('to_date', params.to_date);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/operations${qs ? `?${qs}` : ''}`;

	return apiClient<OperationListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function triggerOperation(
	body: TriggerOperationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ProvisioningOperation> {
	return apiClient<ProvisioningOperation>('/operations', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getOperation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ProvisioningOperation> {
	return apiClient<ProvisioningOperation>(`/operations/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getOperationStats(
	connectorId: string | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<QueueStatistics> {
	const searchParams = new URLSearchParams();
	if (connectorId) searchParams.set('connector_id', connectorId);
	const qs = searchParams.toString();
	const endpoint = `/operations/stats${qs ? `?${qs}` : ''}`;

	return apiClient<QueueStatistics>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getOperationsDlq(
	params: {
		connector_id?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<DlqResponse> {
	const searchParams = new URLSearchParams();
	if (params.connector_id) searchParams.set('connector_id', params.connector_id);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/operations/dlq${qs ? `?${qs}` : ''}`;

	return apiClient<DlqResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function retryOperation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ProvisioningOperation> {
	return apiClient<ProvisioningOperation>(`/operations/${id}/retry`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelOperation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ProvisioningOperation> {
	return apiClient<ProvisioningOperation>(`/operations/${id}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function resolveOperation(
	id: string,
	body: ResolveOperationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ProvisioningOperation> {
	return apiClient<ProvisioningOperation>(`/operations/${id}/resolve`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getOperationLogs(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<OperationLogsResponse> {
	return apiClient<OperationLogsResponse>(`/operations/${id}/logs`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getOperationAttempts(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ExecutionAttemptsResponse> {
	return apiClient<ExecutionAttemptsResponse>(`/operations/${id}/attempts`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listConflicts(
	params: {
		operation_id?: string;
		conflict_type?: string;
		pending_only?: boolean;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ConflictListResponse> {
	const searchParams = new URLSearchParams();
	if (params.operation_id) searchParams.set('operation_id', params.operation_id);
	if (params.conflict_type) searchParams.set('conflict_type', params.conflict_type);
	if (params.pending_only !== undefined) searchParams.set('pending_only', String(params.pending_only));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/operations/conflicts${qs ? `?${qs}` : ''}`;

	return apiClient<ConflictListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getConflict(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ProvisioningConflict> {
	return apiClient<ProvisioningConflict>(`/operations/conflicts/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function resolveConflict(
	id: string,
	body: ResolveConflictRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ProvisioningConflict> {
	return apiClient<ProvisioningConflict>(`/operations/conflicts/${id}/resolve`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}
