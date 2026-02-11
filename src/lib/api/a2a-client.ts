import type {
	A2aTaskListResponse,
	A2aTaskResponse,
	CreateA2aTaskRequest,
	CreateA2aTaskResponse,
	CancelA2aTaskResponse,
	AgentCard
} from './types';

// --- Helper ---

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

export async function fetchA2aTasks(
	params: {
		state?: string;
		target_agent_id?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<A2aTaskListResponse> {
	const qs = buildSearchParams({
		state: params.state,
		target_agent_id: params.target_agent_id,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/nhi/a2a/tasks${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch A2A tasks: ${res.status}`);
	return res.json();
}

export async function createA2aTaskClient(
	body: CreateA2aTaskRequest,
	fetchFn: typeof fetch = fetch
): Promise<CreateA2aTaskResponse> {
	const res = await fetchFn('/api/nhi/a2a/tasks', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create A2A task: ${res.status}`);
	return res.json();
}

export async function fetchA2aTask(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<A2aTaskResponse> {
	const res = await fetchFn(`/api/nhi/a2a/tasks/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch A2A task: ${res.status}`);
	return res.json();
}

export async function cancelA2aTaskClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<CancelA2aTaskResponse> {
	const res = await fetchFn(`/api/nhi/a2a/tasks/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel A2A task: ${res.status}`);
	return res.json();
}

export async function fetchAgentCard(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<AgentCard> {
	const res = await fetchFn(`/api/nhi/a2a/agent-card/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch agent card: ${res.status}`);
	return res.json();
}
