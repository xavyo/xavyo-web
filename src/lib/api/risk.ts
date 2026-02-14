import { apiClient } from './client';
import type {
	RiskAlertResponse,
	RiskAlertListResponse,
	RiskAlertSummaryResponse,
	RiskScoreResponse,
	RiskScoreListResponse,
	RiskScoreSummaryResponse,
	RiskScoreHistoryResponse,
	RiskFactorResponse,
	RiskFactorListResponse,
	CreateRiskFactorRequest,
	UpdateRiskFactorRequest,
	RiskEventResponse,
	RiskEventListResponse,
	RiskThresholdResponse,
	RiskThresholdListResponse,
	CreateRiskThresholdRequest,
	UpdateRiskThresholdRequest
} from './types';

// --- Param interfaces ---

export interface ListRiskAlertsParams {
	user_id?: string;
	severity?: string;
	acknowledged?: boolean;
	sort_by?: string;
	limit?: number;
	offset?: number;
}

export interface ListRiskScoresParams {
	risk_level?: string;
	min_score?: number;
	max_score?: number;
	sort_by?: string;
	limit?: number;
	offset?: number;
}

export interface ListRiskScoreHistoryParams {
	start_date?: string;
	end_date?: string;
	limit?: number;
}

/** @deprecated Use ListRiskScoreHistoryParams instead */
export type UserRiskHistoryParams = ListRiskScoreHistoryParams;

export interface ListRiskFactorsParams {
	category?: string;
	is_enabled?: boolean;
	factor_type?: string;
	limit?: number;
	offset?: number;
}

export interface ListRiskEventsParams {
	event_type?: string;
	factor_id?: string;
	include_expired?: boolean;
	limit?: number;
	offset?: number;
}

export interface ListRiskThresholdsParams {
	severity?: string;
	action?: string;
	is_enabled?: boolean;
	limit?: number;
	offset?: number;
}

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

// --- Risk Alerts ---

export async function listRiskAlerts(
	params: ListRiskAlertsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskAlertListResponse> {
	const qs = buildSearchParams({
		user_id: params.user_id,
		severity: params.severity,
		acknowledged: params.acknowledged,
		sort_by: params.sort_by,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<RiskAlertListResponse>(`/governance/risk-alerts${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRiskAlert(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskAlertResponse> {
	return apiClient<RiskAlertResponse>(`/governance/risk-alerts/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function acknowledgeRiskAlert(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskAlertResponse> {
	return apiClient<RiskAlertResponse>(`/governance/risk-alerts/${id}/acknowledge`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteRiskAlert(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/risk-alerts/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRiskAlertSummary(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskAlertSummaryResponse> {
	return apiClient<RiskAlertSummaryResponse>('/governance/risk-alerts/summary', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

/** @deprecated Use getRiskAlertSummary instead */
export const getRiskAlertsSummary = getRiskAlertSummary;

// --- Risk Scores ---

export async function listRiskScores(
	params: ListRiskScoresParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskScoreListResponse> {
	const qs = buildSearchParams({
		risk_level: params.risk_level,
		min_score: params.min_score,
		max_score: params.max_score,
		sort_by: params.sort_by,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<RiskScoreListResponse>(`/governance/risk-scores${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getUserRiskScore(
	userId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskScoreResponse> {
	return apiClient<RiskScoreResponse>(`/governance/users/${userId}/risk-score`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRiskScoreSummary(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskScoreSummaryResponse> {
	return apiClient<RiskScoreSummaryResponse>('/governance/risk-scores/summary', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getUserRiskScoreHistory(
	userId: string,
	params: ListRiskScoreHistoryParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskScoreHistoryResponse> {
	const qs = buildSearchParams({
		start_date: params.start_date,
		end_date: params.end_date,
		limit: params.limit
	});
	return apiClient<RiskScoreHistoryResponse>(`/governance/users/${userId}/risk-score/history${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

/** @deprecated Use getUserRiskScoreHistory instead */
export const getUserRiskHistory = getUserRiskScoreHistory;

// --- Risk Factors ---

export async function listRiskFactors(
	params: ListRiskFactorsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskFactorListResponse> {
	const qs = buildSearchParams({
		category: params.category,
		is_enabled: params.is_enabled,
		factor_type: params.factor_type,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<RiskFactorListResponse>(`/governance/risk-factors${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRiskFactor(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskFactorResponse> {
	return apiClient<RiskFactorResponse>(`/governance/risk-factors/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createRiskFactor(
	data: CreateRiskFactorRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskFactorResponse> {
	return apiClient<RiskFactorResponse>('/governance/risk-factors', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateRiskFactor(
	id: string,
	data: UpdateRiskFactorRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskFactorResponse> {
	return apiClient<RiskFactorResponse>(`/governance/risk-factors/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteRiskFactor(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/risk-factors/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function enableRiskFactor(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskFactorResponse> {
	return apiClient<RiskFactorResponse>(`/governance/risk-factors/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableRiskFactor(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskFactorResponse> {
	return apiClient<RiskFactorResponse>(`/governance/risk-factors/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Risk Events ---

export async function listUserRiskEvents(
	userId: string,
	params: ListRiskEventsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskEventListResponse> {
	const qs = buildSearchParams({
		event_type: params.event_type,
		factor_id: params.factor_id,
		include_expired: params.include_expired,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<RiskEventListResponse>(`/governance/users/${userId}/risk-events${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRiskEvent(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskEventResponse> {
	return apiClient<RiskEventResponse>(`/governance/risk-events/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Risk Thresholds ---

export async function listRiskThresholds(
	params: ListRiskThresholdsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskThresholdListResponse> {
	const qs = buildSearchParams({
		severity: params.severity,
		action: params.action,
		is_enabled: params.is_enabled,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<RiskThresholdListResponse>(`/governance/risk-thresholds${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getRiskThreshold(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskThresholdResponse> {
	return apiClient<RiskThresholdResponse>(`/governance/risk-thresholds/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createRiskThreshold(
	data: CreateRiskThresholdRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskThresholdResponse> {
	return apiClient<RiskThresholdResponse>('/governance/risk-thresholds', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateRiskThreshold(
	id: string,
	data: UpdateRiskThresholdRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskThresholdResponse> {
	return apiClient<RiskThresholdResponse>(`/governance/risk-thresholds/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteRiskThreshold(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/risk-thresholds/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function enableRiskThreshold(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskThresholdResponse> {
	return apiClient<RiskThresholdResponse>(`/governance/risk-thresholds/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableRiskThreshold(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskThresholdResponse> {
	return apiClient<RiskThresholdResponse>(`/governance/risk-thresholds/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
