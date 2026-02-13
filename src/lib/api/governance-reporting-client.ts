import type {
	ReportTemplateListResponse,
	ReportTemplate,
	GeneratedReportListResponse,
	CleanupReportsResponse,
	ReportScheduleListResponse,
	ReportSchedule
} from './types';

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

// --- Templates ---

export async function fetchTemplates(
	params: {
		template_type?: string;
		compliance_standard?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<ReportTemplateListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/reports/templates${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch templates: ${res.status}`);
	return res.json();
}

export async function cloneTemplateClient(
	id: string,
	body: { name: string; description?: string },
	fetchFn: typeof fetch = fetch
): Promise<ReportTemplate> {
	const res = await fetchFn(`/api/governance/reports/templates/${id}/clone`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to clone template: ${res.status}`);
	return res.json();
}

export async function archiveTemplateClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ReportTemplate> {
	const res = await fetchFn(`/api/governance/reports/templates/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to archive template: ${res.status}`);
	return res.json();
}

// --- Generated Reports ---

export async function fetchReports(
	params: {
		template_id?: string;
		status?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<GeneratedReportListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/reports${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
	return res.json();
}

export async function fetchReportData(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<unknown> {
	const res = await fetchFn(`/api/governance/reports/${id}/data`);
	if (!res.ok) throw new Error(`Failed to fetch report data: ${res.status}`);
	return res.json();
}

export async function generateReportClient(
	body: { template_id: string; name?: string; parameters?: Record<string, unknown>; output_format: string },
	fetchFn: typeof fetch = fetch
): Promise<unknown> {
	const res = await fetchFn('/api/governance/reports', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to generate report: ${res.status}`);
	return res.json();
}

export async function deleteReportClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/reports/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete report: ${res.status}`);
}

export async function cleanupReportsClient(
	fetchFn: typeof fetch = fetch
): Promise<CleanupReportsResponse> {
	const res = await fetchFn('/api/governance/reports/cleanup', {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cleanup reports: ${res.status}`);
	return res.json();
}

// --- Schedules ---

export async function fetchSchedules(
	params: { template_id?: string; status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ReportScheduleListResponse> {
	const qs = buildSearchParams(params);
	const res = await fetchFn(`/api/governance/reports/schedules${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch schedules: ${res.status}`);
	return res.json();
}

export async function pauseScheduleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ReportSchedule> {
	const res = await fetchFn(`/api/governance/reports/schedules/${id}/pause`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to pause schedule: ${res.status}`);
	return res.json();
}

export async function resumeScheduleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ReportSchedule> {
	const res = await fetchFn(`/api/governance/reports/schedules/${id}/resume`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to resume schedule: ${res.status}`);
	return res.json();
}

export async function deleteScheduleClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/reports/schedules/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete schedule: ${res.status}`);
}
