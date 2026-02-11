import { apiClient } from './client';
import type {
	A2aTaskListResponse,
	A2aTaskResponse,
	CreateA2aTaskRequest,
	CreateA2aTaskResponse,
	CancelA2aTaskResponse,
	AgentCard
} from './types';

export interface ListA2aTasksParams {
	state?: string;
	target_agent_id?: string;
	limit?: number;
	offset?: number;
}

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

export async function listA2aTasks(
	params: ListA2aTasksParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<A2aTaskListResponse> {
	const qs = buildSearchParams({
		state: params.state,
		target_agent_id: params.target_agent_id,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<A2aTaskListResponse>(`/a2a/tasks${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createA2aTask(
	body: CreateA2aTaskRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CreateA2aTaskResponse> {
	return apiClient<CreateA2aTaskResponse>('/a2a/tasks', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function getA2aTask(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<A2aTaskResponse> {
	return apiClient<A2aTaskResponse>(`/a2a/tasks/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelA2aTask(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CancelA2aTaskResponse> {
	return apiClient<CancelA2aTaskResponse>(`/a2a/tasks/${id}/cancel`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getAgentCard(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AgentCard> {
	return apiClient<AgentCard>(`/.well-known/agents/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
