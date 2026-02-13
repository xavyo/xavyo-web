import { apiClient } from './client';
import type {
	SlaPolicy,
	SlaPolicyListResponse,
	CreateSlaPolicyRequest,
	UpdateSlaPolicyRequest,
	TicketingConfig,
	TicketingConfigListResponse,
	CreateTicketingConfigRequest,
	UpdateTicketingConfigRequest,
	BulkAction,
	BulkActionListResponse,
	BulkActionPreview,
	CreateBulkActionRequest,
	ExpressionValidationResult,
	FailedOperationListResponse,
	BulkStateOperation,
	ScheduledTransition,
	ScheduledTransitionListResponse,
	CreateBulkStateOperationRequest
} from './types';

// --- SLA Policies ---

export async function listSlaPolicies(
	params: {
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SlaPolicyListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<SlaPolicyListResponse>(
		`/governance/sla-policies${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createSlaPolicy(
	body: CreateSlaPolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SlaPolicy> {
	return apiClient<SlaPolicy>(
		'/governance/sla-policies',
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function getSlaPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SlaPolicy> {
	return apiClient<SlaPolicy>(
		`/governance/sla-policies/${id}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function updateSlaPolicy(
	id: string,
	body: UpdateSlaPolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<SlaPolicy> {
	return apiClient<SlaPolicy>(
		`/governance/sla-policies/${id}`,
		{ method: 'PUT', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteSlaPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/sla-policies/${id}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

// --- Ticketing Configurations ---

export async function listTicketingConfigs(
	params: {
		ticketing_type?: string;
		is_active?: boolean;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TicketingConfigListResponse> {
	const searchParams = new URLSearchParams();
	if (params.ticketing_type) searchParams.set('ticketing_type', params.ticketing_type);
	if (params.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<TicketingConfigListResponse>(
		`/governance/ticketing-configurations${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createTicketingConfig(
	body: CreateTicketingConfigRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TicketingConfig> {
	return apiClient<TicketingConfig>(
		'/governance/ticketing-configurations',
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function getTicketingConfig(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TicketingConfig> {
	return apiClient<TicketingConfig>(
		`/governance/ticketing-configurations/${id}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function updateTicketingConfig(
	id: string,
	body: UpdateTicketingConfigRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<TicketingConfig> {
	return apiClient<TicketingConfig>(
		`/governance/ticketing-configurations/${id}`,
		{ method: 'PUT', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteTicketingConfig(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/ticketing-configurations/${id}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

export async function testTicketingConfig(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Record<string, unknown>> {
	return apiClient<Record<string, unknown>>(
		`/governance/ticketing-configurations/${id}/test`,
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

// --- Bulk Actions (admin) ---

export async function listBulkActions(
	params: {
		status?: string;
		action_type?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkActionListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.action_type) searchParams.set('action_type', params.action_type);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<BulkActionListResponse>(
		`/governance/admin/bulk-actions${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createBulkAction(
	body: CreateBulkActionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkAction> {
	return apiClient<BulkAction>(
		'/governance/admin/bulk-actions',
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function getBulkAction(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkAction> {
	return apiClient<BulkAction>(
		`/governance/admin/bulk-actions/${id}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function updateBulkAction(
	id: string,
	body: Record<string, unknown>,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkAction> {
	return apiClient<BulkAction>(
		`/governance/admin/bulk-actions/${id}`,
		{ method: 'PUT', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteBulkAction(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/admin/bulk-actions/${id}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

export async function previewBulkAction(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkActionPreview> {
	return apiClient<BulkActionPreview>(
		`/governance/admin/bulk-actions/${id}/preview`,
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

export async function executeBulkAction(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkAction> {
	return apiClient<BulkAction>(
		`/governance/admin/bulk-actions/${id}/execute`,
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

export async function cancelBulkAction(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkAction> {
	return apiClient<BulkAction>(
		`/governance/admin/bulk-actions/${id}/cancel`,
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

export async function validateBulkActionExpression(
	body: { expression: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ExpressionValidationResult> {
	return apiClient<ExpressionValidationResult>(
		'/governance/admin/bulk-actions/validate-expression',
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

// --- Scheduled Transitions (lifecycle) ---

export async function listScheduledTransitions(
	params: {
		status?: string;
		scheduled_before?: string;
		scheduled_after?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScheduledTransitionListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.scheduled_before) searchParams.set('scheduled_before', params.scheduled_before);
	if (params.scheduled_after) searchParams.set('scheduled_after', params.scheduled_after);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<ScheduledTransitionListResponse>(
		`/governance/lifecycle/scheduled${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getScheduledTransition(
	scheduleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScheduledTransition> {
	return apiClient<ScheduledTransition>(
		`/governance/lifecycle/scheduled/${scheduleId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function cancelScheduledTransition(
	scheduleId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScheduledTransition> {
	return apiClient<ScheduledTransition>(
		`/governance/lifecycle/scheduled/${scheduleId}/cancel`,
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

// --- Bulk State Operations (lifecycle) ---

export async function createBulkStateOperation(
	body: CreateBulkStateOperationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkStateOperation> {
	return apiClient<BulkStateOperation>(
		'/governance/lifecycle/bulk-operations',
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function listBulkStateOperations(
	params: {
		status?: string;
		transition_id?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<{ items: BulkStateOperation[]; total: number }> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.transition_id) searchParams.set('transition_id', params.transition_id);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<{ items: BulkStateOperation[]; total: number }>(
		`/governance/lifecycle/bulk-operations${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getBulkStateOperation(
	operationId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkStateOperation> {
	return apiClient<BulkStateOperation>(
		`/governance/lifecycle/bulk-operations/${operationId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function cancelBulkStateOperation(
	operationId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<BulkStateOperation> {
	return apiClient<BulkStateOperation>(
		`/governance/lifecycle/bulk-operations/${operationId}/cancel`,
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

export async function processPendingBulkStateOperations(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Record<string, unknown>> {
	return apiClient<Record<string, unknown>>(
		'/governance/lifecycle/bulk-operations/process',
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

// --- Failed Operations (lifecycle dead-letter) ---

export async function listFailedOperations(
	params: {
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<FailedOperationListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<FailedOperationListResponse>(
		`/governance/lifecycle/failed-operations/dead-letter${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getFailedOperationCount(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<{ count: number }> {
	return apiClient<{ count: number }>(
		'/governance/lifecycle/failed-operations/dead-letter/count',
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function processFailedOperationRetries(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Record<string, unknown>> {
	return apiClient<Record<string, unknown>>(
		'/governance/lifecycle/failed-operations/process-retries',
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}

export async function processAllFailedOperationRetries(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Record<string, unknown>> {
	return apiClient<Record<string, unknown>>(
		'/governance/lifecycle/failed-operations/process-all-retries',
		{ method: 'POST', token, tenantId, fetch: fetchFn }
	);
}
