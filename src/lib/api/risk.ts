import { apiClient } from './client';
import type {
	RiskScoreListResponse,
	RiskScoreSummary,
	RiskScoreResponse,
	RiskScoreHistoryResponse,
	RiskAlertsSummary,
	RiskAlertListResponse
} from './types';

// --- Param interfaces ---

export interface ListRiskScoresParams {
	risk_level?: string;
	sort_by?: string;
	limit?: number;
	offset?: number;
}

export interface UserRiskHistoryParams {
	start_date?: string;
	end_date?: string;
	limit?: number;
}

export interface ListRiskAlertsParams {
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

// --- Risk Scores ---

export async function listRiskScores(
	params: ListRiskScoresParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskScoreListResponse> {
	const qs = buildSearchParams({
		risk_level: params.risk_level,
		sort_by: params.sort_by,
		limit: params.limit,
		offset: params.offset
	});
	const endpoint = `/governance/risk-scores${qs}`;

	return apiClient<RiskScoreListResponse>(endpoint, {
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
): Promise<RiskScoreSummary> {
	return apiClient<RiskScoreSummary>('/governance/risk-scores/summary', {
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

export async function getUserRiskHistory(
	userId: string,
	params: UserRiskHistoryParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskScoreHistoryResponse> {
	const qs = buildSearchParams({
		start_date: params.start_date,
		end_date: params.end_date,
		limit: params.limit
	});
	const endpoint = `/governance/users/${userId}/risk-score/history${qs}`;

	return apiClient<RiskScoreHistoryResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Risk Alerts ---

export async function getRiskAlertsSummary(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskAlertsSummary> {
	return apiClient<RiskAlertsSummary>('/governance/risk-alerts/summary', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listRiskAlerts(
	params: ListRiskAlertsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RiskAlertListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const endpoint = `/governance/risk-alerts${qs}`;

	return apiClient<RiskAlertListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
