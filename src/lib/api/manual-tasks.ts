import { apiClient } from './client';
import type {
	ManualTask,
	ManualTaskListResponse,
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
