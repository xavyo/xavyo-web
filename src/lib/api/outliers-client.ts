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
	OutlierGenerateReportRequest,
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
export async function fetchOutlierConfig(fetchFn: typeof fetch = fetch): Promise<OutlierConfig> {
	const res = await fetchFn('/api/governance/outliers/config');
	if (!res.ok) throw new Error(`Failed to fetch outlier config: ${res.status}`);
	return res.json();
}

export async function updateOutlierConfigClient(body: UpdateOutlierConfigRequest, fetchFn: typeof fetch = fetch): Promise<OutlierConfig> {
	const res = await fetchFn('/api/governance/outliers/config', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update outlier config: ${res.status}`);
	return res.json();
}

export async function enableOutlierDetectionClient(fetchFn: typeof fetch = fetch): Promise<OutlierConfig> {
	const res = await fetchFn('/api/governance/outliers/config/enable', { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to enable outlier detection: ${res.status}`);
	return res.json();
}

export async function disableOutlierDetectionClient(fetchFn: typeof fetch = fetch): Promise<OutlierConfig> {
	const res = await fetchFn('/api/governance/outliers/config/disable', { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to disable outlier detection: ${res.status}`);
	return res.json();
}

// Analyses
export async function fetchOutlierAnalyses(
	params: { status?: string; triggered_by?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedResponse<OutlierAnalysis>> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/outliers/analyses${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch outlier analyses: ${res.status}`);
	return res.json();
}

export async function triggerOutlierAnalysisClient(body: TriggerAnalysisRequest, fetchFn: typeof fetch = fetch): Promise<OutlierAnalysis> {
	const res = await fetchFn('/api/governance/outliers/analyses', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to trigger analysis: ${res.status}`);
	return res.json();
}

export async function fetchOutlierAnalysis(id: string, fetchFn: typeof fetch = fetch): Promise<OutlierAnalysis> {
	const res = await fetchFn(`/api/governance/outliers/analyses/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch analysis: ${res.status}`);
	return res.json();
}

export async function cancelOutlierAnalysisClient(id: string, fetchFn: typeof fetch = fetch): Promise<OutlierAnalysis> {
	const res = await fetchFn(`/api/governance/outliers/analyses/${id}/cancel`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to cancel analysis: ${res.status}`);
	return res.json();
}

// Results
export async function fetchOutlierResults(
	params: { analysis_id?: string; user_id?: string; classification?: string; min_score?: number; max_score?: number; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedResponse<OutlierResult>> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/outliers/results${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch outlier results: ${res.status}`);
	return res.json();
}

export async function fetchOutlierResult(id: string, fetchFn: typeof fetch = fetch): Promise<OutlierResult> {
	const res = await fetchFn(`/api/governance/outliers/results/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch outlier result: ${res.status}`);
	return res.json();
}

// Summary
export async function fetchOutlierSummary(fetchFn: typeof fetch = fetch): Promise<OutlierSummary> {
	const res = await fetchFn('/api/governance/outliers/summary');
	if (!res.ok) throw new Error(`Failed to fetch outlier summary: ${res.status}`);
	return res.json();
}

// User history
export async function fetchUserOutlierHistory(userId: string, limit?: number, fetchFn: typeof fetch = fetch): Promise<UserOutlierHistory> {
	const qs = buildSearchParams({ limit });
	const res = await fetchFn(`/api/governance/outliers/users/${userId}${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch user outlier history: ${res.status}`);
	return res.json();
}

// Dispositions
export async function createDispositionClient(resultId: string, body: CreateDispositionRequest, fetchFn: typeof fetch = fetch): Promise<OutlierDisposition> {
	const res = await fetchFn(`/api/governance/outliers/results/${resultId}/disposition`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create disposition: ${res.status}`);
	return res.json();
}

export async function fetchDispositions(
	params: { user_id?: string; status?: string; reviewed_by?: string; include_expired?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedResponse<OutlierDisposition>> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/outliers/dispositions${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch dispositions: ${res.status}`);
	return res.json();
}

export async function fetchDisposition(id: string, fetchFn: typeof fetch = fetch): Promise<OutlierDisposition> {
	const res = await fetchFn(`/api/governance/outliers/dispositions/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch disposition: ${res.status}`);
	return res.json();
}

export async function updateDispositionClient(id: string, body: CreateDispositionRequest, fetchFn: typeof fetch = fetch): Promise<OutlierDisposition> {
	const res = await fetchFn(`/api/governance/outliers/dispositions/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update disposition: ${res.status}`);
	return res.json();
}

export async function fetchDispositionSummary(fetchFn: typeof fetch = fetch): Promise<DispositionSummary> {
	const res = await fetchFn('/api/governance/outliers/dispositions/summary');
	if (!res.ok) throw new Error(`Failed to fetch disposition summary: ${res.status}`);
	return res.json();
}

// Alerts
export async function fetchOutlierAlerts(
	params: { user_id?: string; analysis_id?: string; alert_type?: string; severity?: string; is_read?: boolean; is_dismissed?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<PaginatedResponse<OutlierAlert>> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/outliers/alerts${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch outlier alerts: ${res.status}`);
	return res.json();
}

export async function fetchAlertSummary(fetchFn: typeof fetch = fetch): Promise<AlertSummary> {
	const res = await fetchFn('/api/governance/outliers/alerts/summary');
	if (!res.ok) throw new Error(`Failed to fetch alert summary: ${res.status}`);
	return res.json();
}

export async function markAlertReadClient(id: string, fetchFn: typeof fetch = fetch): Promise<OutlierAlert> {
	const res = await fetchFn(`/api/governance/outliers/alerts/${id}/read`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to mark alert as read: ${res.status}`);
	return res.json();
}

export async function dismissAlertClient(id: string, fetchFn: typeof fetch = fetch): Promise<OutlierAlert> {
	const res = await fetchFn(`/api/governance/outliers/alerts/${id}/dismiss`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to dismiss alert: ${res.status}`);
	return res.json();
}

// Reports
export async function generateOutlierReportClient(body: OutlierGenerateReportRequest, fetchFn: typeof fetch = fetch): Promise<OutlierReport> {
	const res = await fetchFn('/api/governance/outliers/reports', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to generate report: ${res.status}`);
	return res.json();
}
