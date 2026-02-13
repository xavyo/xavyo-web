import { apiClient } from './client';
import type {
	ScriptAnalyticsDashboard,
	ScriptAnalyticsDetail,
	ScriptExecutionLog,
	ScriptExecutionLogListResponse,
	ScriptAuditEvent,
	ScriptAuditEventListResponse
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

// --- Script Analytics Dashboard ---

export async function getScriptAnalyticsDashboard(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptAnalyticsDashboard> {
	return apiClient<ScriptAnalyticsDashboard>('/governance/script-analytics/dashboard', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Per-Script Analytics ---

export async function getScriptAnalytics(
	scriptId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptAnalyticsDetail> {
	return apiClient<ScriptAnalyticsDetail>(`/governance/script-analytics/scripts/${scriptId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Script Execution Logs ---

export interface ListScriptExecutionLogsParams {
	script_id?: string;
	connector_id?: string;
	binding_id?: string;
	status?: string;
	dry_run?: boolean;
	from_date?: string;
	to_date?: string;
	page?: number;
	page_size?: number;
}

export async function listScriptExecutionLogs(
	params: ListScriptExecutionLogsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptExecutionLogListResponse> {
	const qs = buildSearchParams({
		script_id: params.script_id,
		connector_id: params.connector_id,
		binding_id: params.binding_id,
		status: params.status,
		dry_run: params.dry_run,
		from_date: params.from_date,
		to_date: params.to_date,
		page: params.page,
		page_size: params.page_size
	});
	return apiClient<ScriptExecutionLogListResponse>(`/governance/script-execution-logs${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getScriptExecutionLog(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptExecutionLog> {
	return apiClient<ScriptExecutionLog>(`/governance/script-execution-logs/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Script Audit Events ---

export interface ListScriptAuditEventsParams {
	script_id?: string;
	action?: string;
	limit?: number;
	offset?: number;
}

export async function listScriptAuditEvents(
	params: ListScriptAuditEventsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ScriptAuditEventListResponse> {
	const qs = buildSearchParams({
		script_id: params.script_id,
		action: params.action,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ScriptAuditEventListResponse>(`/governance/script-audit-events${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
