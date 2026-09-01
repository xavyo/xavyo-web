import { apiClient } from './client';
import type {
	ManualTask,
	ManualTaskListResponse,
	ManualTaskAuditListResponse,
	ManualTaskDashboard,
	ConfirmTaskRequest,
	RejectTaskRequest
} from './types';

export async function listManualTasks(
	params: {
		status?: string;
		application_id?: string;
		user_id?: string;
		sla_breached?: boolean;
		assignee_id?: string;
		operation?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTaskListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.application_id) searchParams.set('application_id', params.application_id);
	if (params.user_id) searchParams.set('user_id', params.user_id);
	if (params.sla_breached !== undefined) searchParams.set('sla_breached', String(params.sla_breached));
	if (params.assignee_id) searchParams.set('assignee_id', params.assignee_id);
	if (params.operation) searchParams.set('operation', params.operation);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/governance/manual-tasks${qs ? `?${qs}` : ''}`;

	return apiClient<ManualTaskListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getManualTask(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTask> {
	return apiClient<ManualTask>(`/governance/manual-tasks/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getManualTaskDashboard(
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTaskDashboard> {
	return apiClient<ManualTaskDashboard>('/governance/manual-tasks/dashboard', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function claimTask(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTask> {
	return apiClient<ManualTask>(`/governance/manual-tasks/${id}/claim`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function startTask(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTask> {
	return apiClient<ManualTask>(`/governance/manual-tasks/${id}/start`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function confirmTask(
	id: string,
	body: ConfirmTaskRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTask> {
	return apiClient<ManualTask>(`/governance/manual-tasks/${id}/confirm`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function rejectTask(
	id: string,
	body: RejectTaskRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTask> {
	return apiClient<ManualTask>(`/governance/manual-tasks/${id}/reject`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelTask(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTask> {
	return apiClient<ManualTask>(`/governance/manual-tasks/${id}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listManualTaskAudit(
	params: {
		task_id?: string;
		event_type?: string;
		actor_id?: string;
		from_date?: string;
		to_date?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ManualTaskAuditListResponse> {
	const searchParams = new URLSearchParams();
	if (params.task_id) searchParams.set('task_id', params.task_id);
	if (params.event_type) searchParams.set('event_type', params.event_type);
	if (params.actor_id) searchParams.set('actor_id', params.actor_id);
	if (params.from_date) searchParams.set('from_date', params.from_date);
	if (params.to_date) searchParams.set('to_date', params.to_date);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<ManualTaskAuditListResponse>(
		`/governance/manual-tasks/audit${qs ? `?${qs}` : ''}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}
