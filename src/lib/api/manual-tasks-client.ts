import type {
	ManualTask,
	ManualTaskListResponse,
	ManualTaskDashboard,
	ConfirmTaskRequest,
	RejectTaskRequest
} from './types';

function buildSearchParams(
	params: Record<string, string | number | boolean | undefined>
): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

export async function fetchManualTasks(
	params: {
		status?: string;
		application_id?: string;
		user_id?: string;
		sla_breached?: boolean;
		assignee_id?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<ManualTaskListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		application_id: params.application_id,
		user_id: params.user_id,
		sla_breached: params.sla_breached,
		assignee_id: params.assignee_id,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/manual-tasks${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch manual tasks: ${res.status}`);
	return res.json();
}

export async function fetchManualTaskDashboard(
	fetchFn: typeof fetch = fetch
): Promise<ManualTaskDashboard> {
	const res = await fetchFn('/api/governance/manual-tasks/dashboard');
	if (!res.ok) throw new Error(`Failed to fetch manual task dashboard: ${res.status}`);
	return res.json();
}

export async function claimTaskClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ManualTask> {
	const res = await fetchFn(`/api/governance/manual-tasks/${id}/claim`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to claim task: ${res.status}`);
	return res.json();
}

export async function startTaskClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ManualTask> {
	const res = await fetchFn(`/api/governance/manual-tasks/${id}/start`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to start task: ${res.status}`);
	return res.json();
}

export async function confirmTaskClient(
	id: string,
	body: ConfirmTaskRequest,
	fetchFn: typeof fetch = fetch
): Promise<ManualTask> {
	const res = await fetchFn(`/api/governance/manual-tasks/${id}/confirm`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to confirm task: ${res.status}`);
	return res.json();
}

export async function rejectTaskClient(
	id: string,
	body: RejectTaskRequest,
	fetchFn: typeof fetch = fetch
): Promise<ManualTask> {
	const res = await fetchFn(`/api/governance/manual-tasks/${id}/reject`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to reject task: ${res.status}`);
	return res.json();
}

export async function cancelTaskClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ManualTask> {
	const res = await fetchFn(`/api/governance/manual-tasks/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel task: ${res.status}`);
	return res.json();
}
