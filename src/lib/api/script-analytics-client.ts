import type {
	ScriptAnalyticsDashboard,
	ScriptAnalyticsDetail,
	ScriptExecutionLog,
	ScriptExecutionLogListResponse,
	ScriptAuditEventListResponse
} from './types';

function buildSearchParams(params: Record<string, string | number | boolean | undefined>): string {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined) sp.set(k, String(v));
	}
	const qs = sp.toString();
	return qs ? `?${qs}` : '';
}

async function clientFetch<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Request failed' }));
		throw new Error(body.error || `Request failed: ${res.status}`);
	}
	return res.json();
}

export async function fetchAnalyticsDashboard(): Promise<ScriptAnalyticsDashboard> {
	return clientFetch('/api/provisioning-scripts/analytics/dashboard');
}

export async function fetchScriptAnalytics(scriptId: string): Promise<ScriptAnalyticsDetail> {
	return clientFetch(`/api/provisioning-scripts/analytics/scripts/${scriptId}`);
}

export async function fetchExecutionLogs(
	params: {
		script_id?: string;
		connector_id?: string;
		binding_id?: string;
		status?: string;
		dry_run?: boolean;
		from_date?: string;
		to_date?: string;
		page?: number;
		page_size?: number;
	} = {}
): Promise<ScriptExecutionLogListResponse> {
	return clientFetch(`/api/provisioning-scripts/execution-logs${buildSearchParams(params)}`);
}

export async function fetchExecutionLog(id: string): Promise<ScriptExecutionLog> {
	return clientFetch(`/api/provisioning-scripts/execution-logs/${id}`);
}

export async function fetchAuditEvents(
	params: { script_id?: string; action?: string; limit?: number; offset?: number } = {}
): Promise<ScriptAuditEventListResponse> {
	return clientFetch(`/api/provisioning-scripts/audit-events${buildSearchParams(params)}`);
}
