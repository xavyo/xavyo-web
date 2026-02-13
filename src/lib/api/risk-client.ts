import type {
	RiskScoreListResponse,
	RiskScoreSummary,
	RiskAlertsSummary,
	RiskAlertListResponse,
	RiskLevel
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

// --- Risk Scores ---

export async function fetchRiskScores(
	params: {
		risk_level?: RiskLevel;
		min_score?: number;
		max_score?: number;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<RiskScoreListResponse> {
	const qs = buildSearchParams({
		risk_level: params.risk_level,
		min_score: params.min_score,
		max_score: params.max_score,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/risk/scores${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch risk scores: ${res.status}`);
	return res.json();
}

export async function fetchRiskScoreSummary(
	fetchFn: typeof fetch = fetch
): Promise<RiskScoreSummary> {
	const res = await fetchFn('/api/governance/risk/scores/summary');
	if (!res.ok) throw new Error(`Failed to fetch risk score summary: ${res.status}`);
	return res.json();
}

// --- Risk Alerts ---

export async function fetchRiskAlertsSummary(
	fetchFn: typeof fetch = fetch
): Promise<RiskAlertsSummary> {
	const res = await fetchFn('/api/governance/risk/alerts/summary');
	if (!res.ok) throw new Error(`Failed to fetch risk alerts summary: ${res.status}`);
	return res.json();
}

export async function fetchRiskAlerts(
	params: {
		severity?: RiskLevel;
		acknowledged?: boolean;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<RiskAlertListResponse> {
	const qs = buildSearchParams({
		severity: params.severity,
		acknowledged: params.acknowledged,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/risk/alerts${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch risk alerts: ${res.status}`);
	return res.json();
}
