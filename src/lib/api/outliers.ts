import { apiClient } from './client';
import type {
	OutlierConfig,
	UpdateOutlierConfigRequest,
	OutlierAnalysis,
	TriggerAnalysisRequest,
	OutlierResult,
	OutlierSummary,
	OutlierDisposition,
	CreateDispositionRequest,
	DispositionSummary,
	OutlierAlert,
	AlertSummary,
	GenerateReportRequest,
	OutlierReport,
	UserOutlierHistory
} from './types';

interface PaginatedResponse<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
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

// Config
export async function getOutlierConfig(
	token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierConfig> {
	return apiClient<OutlierConfig>('/governance/outliers/config', { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function updateOutlierConfig(
	body: UpdateOutlierConfigRequest, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierConfig> {
	return apiClient<OutlierConfig>('/governance/outliers/config', { method: 'PUT', token, tenantId, body, fetch: fetchFn });
}

export async function enableOutlierDetection(
	token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierConfig> {
	return apiClient<OutlierConfig>('/governance/outliers/config/enable', { method: 'POST', token, tenantId, fetch: fetchFn });
}

export async function disableOutlierDetection(
	token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierConfig> {
	return apiClient<OutlierConfig>('/governance/outliers/config/disable', { method: 'POST', token, tenantId, fetch: fetchFn });
}

// Analyses
export interface ListAnalysesParams {
	status?: string;
	triggered_by?: string;
	limit?: number;
	offset?: number;
}

export async function listOutlierAnalyses(
	params: ListAnalysesParams, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<PaginatedResponse<OutlierAnalysis>> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	return apiClient<PaginatedResponse<OutlierAnalysis>>(`/governance/outliers/analyses${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function triggerOutlierAnalysis(
	body: TriggerAnalysisRequest, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierAnalysis> {
	return apiClient<OutlierAnalysis>('/governance/outliers/analyses', { method: 'POST', token, tenantId, body, fetch: fetchFn });
}

export async function getOutlierAnalysis(
	id: string, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierAnalysis> {
	return apiClient<OutlierAnalysis>(`/governance/outliers/analyses/${id}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function cancelOutlierAnalysis(
	id: string, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierAnalysis> {
	return apiClient<OutlierAnalysis>(`/governance/outliers/analyses/${id}/cancel`, { method: 'POST', token, tenantId, fetch: fetchFn });
}

// Results
export interface ListResultsParams {
	analysis_id?: string;
	user_id?: string;
	classification?: string;
	min_score?: number;
	max_score?: number;
	limit?: number;
	offset?: number;
}

export async function listOutlierResults(
	params: ListResultsParams, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<PaginatedResponse<OutlierResult>> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	return apiClient<PaginatedResponse<OutlierResult>>(`/governance/outliers/results${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function getOutlierResult(
	id: string, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierResult> {
	return apiClient<OutlierResult>(`/governance/outliers/results/${id}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

// Summary
export async function getOutlierSummary(
	token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierSummary> {
	return apiClient<OutlierSummary>('/governance/outliers/summary', { method: 'GET', token, tenantId, fetch: fetchFn });
}

// User history
export async function getUserOutlierHistory(
	userId: string, limit: number | undefined, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<UserOutlierHistory> {
	const qs = buildSearchParams({ limit });
	return apiClient<UserOutlierHistory>(`/governance/outliers/users/${userId}${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

// Dispositions
export interface ListDispositionsParams {
	user_id?: string;
	status?: string;
	reviewed_by?: string;
	include_expired?: boolean;
	limit?: number;
	offset?: number;
}

export async function createDisposition(
	resultId: string, body: CreateDispositionRequest, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierDisposition> {
	return apiClient<OutlierDisposition>(`/governance/outliers/results/${resultId}/disposition`, { method: 'POST', token, tenantId, body, fetch: fetchFn });
}

export async function listDispositions(
	params: ListDispositionsParams, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<PaginatedResponse<OutlierDisposition>> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	return apiClient<PaginatedResponse<OutlierDisposition>>(`/governance/outliers/dispositions${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function getDisposition(
	id: string, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierDisposition> {
	return apiClient<OutlierDisposition>(`/governance/outliers/dispositions/${id}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function updateDisposition(
	id: string, body: CreateDispositionRequest, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierDisposition> {
	return apiClient<OutlierDisposition>(`/governance/outliers/dispositions/${id}`, { method: 'PUT', token, tenantId, body, fetch: fetchFn });
}

export async function getDispositionSummary(
	token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<DispositionSummary> {
	return apiClient<DispositionSummary>('/governance/outliers/dispositions/summary', { method: 'GET', token, tenantId, fetch: fetchFn });
}

// Alerts
export interface ListAlertsParams {
	user_id?: string;
	analysis_id?: string;
	alert_type?: string;
	severity?: string;
	is_read?: boolean;
	is_dismissed?: boolean;
	limit?: number;
	offset?: number;
}

export async function listOutlierAlerts(
	params: ListAlertsParams, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<PaginatedResponse<OutlierAlert>> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	return apiClient<PaginatedResponse<OutlierAlert>>(`/governance/outliers/alerts${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function getAlertSummary(
	token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<AlertSummary> {
	return apiClient<AlertSummary>('/governance/outliers/alerts/summary', { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function markAlertRead(
	id: string, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierAlert> {
	return apiClient<OutlierAlert>(`/governance/outliers/alerts/${id}/read`, { method: 'POST', token, tenantId, fetch: fetchFn });
}

export async function dismissAlert(
	id: string, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierAlert> {
	return apiClient<OutlierAlert>(`/governance/outliers/alerts/${id}/dismiss`, { method: 'POST', token, tenantId, fetch: fetchFn });
}

// Reports
export async function generateOutlierReport(
	body: GenerateReportRequest, token: string, tenantId: string, fetchFn?: typeof globalThis.fetch
): Promise<OutlierReport> {
	return apiClient<OutlierReport>('/governance/outliers/reports', { method: 'POST', token, tenantId, body, fetch: fetchFn });
}
