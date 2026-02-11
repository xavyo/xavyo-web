import { apiClient } from './client';
import type {
	ReportTemplate,
	ReportTemplateListResponse,
	CreateReportTemplateRequest,
	UpdateReportTemplateRequest,
	CloneReportTemplateRequest,
	GeneratedReport,
	GeneratedReportListResponse,
	GenerateReportRequest,
	CleanupReportsResponse,
	ReportSchedule,
	ReportScheduleListResponse,
	CreateReportScheduleRequest,
	UpdateReportScheduleRequest
} from './types';

export interface ListTemplatesParams {
	template_type?: string;
	compliance_standard?: string;
	include_system?: boolean;
	limit?: number;
	offset?: number;
}

export interface ListReportsParams {
	template_id?: string;
	status?: string;
	from_date?: string;
	to_date?: string;
	limit?: number;
	offset?: number;
}

export interface ListSchedulesParams {
	template_id?: string;
	status?: string;
	limit?: number;
	offset?: number;
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

// --- Templates ---

export async function listTemplates(
	params: ListTemplatesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportTemplateListResponse> {
	const qs = buildSearchParams({
		template_type: params.template_type,
		compliance_standard: params.compliance_standard,
		include_system: params.include_system,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ReportTemplateListResponse>(`/governance/reports/templates${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportTemplate> {
	return apiClient<ReportTemplate>(`/governance/reports/templates/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createTemplate(
	body: CreateReportTemplateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportTemplate> {
	return apiClient<ReportTemplate>('/governance/reports/templates', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function updateTemplate(
	id: string,
	body: UpdateReportTemplateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportTemplate> {
	return apiClient<ReportTemplate>(`/governance/reports/templates/${id}`, {
		method: 'PUT',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function archiveTemplate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportTemplate> {
	return apiClient<ReportTemplate>(`/governance/reports/templates/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cloneTemplate(
	id: string,
	body: CloneReportTemplateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportTemplate> {
	return apiClient<ReportTemplate>(`/governance/reports/templates/${id}/clone`, {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

// --- Generated Reports ---

export async function listReports(
	params: ListReportsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GeneratedReportListResponse> {
	const qs = buildSearchParams({
		template_id: params.template_id,
		status: params.status,
		from_date: params.from_date,
		to_date: params.to_date,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<GeneratedReportListResponse>(`/governance/reports${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function generateReport(
	body: GenerateReportRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GeneratedReport> {
	return apiClient<GeneratedReport>('/governance/reports/generate', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function getReport(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GeneratedReport> {
	return apiClient<GeneratedReport>(`/governance/reports/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getReportData(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<unknown> {
	return apiClient<unknown>(`/governance/reports/${id}/data`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteReport(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/reports/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cleanupReports(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CleanupReportsResponse> {
	return apiClient<CleanupReportsResponse>('/governance/reports/cleanup', {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Schedules ---

export async function listSchedules(
	params: ListSchedulesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportScheduleListResponse> {
	const qs = buildSearchParams({
		template_id: params.template_id,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ReportScheduleListResponse>(`/governance/reports/schedules${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSchedule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportSchedule> {
	return apiClient<ReportSchedule>(`/governance/reports/schedules/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createSchedule(
	body: CreateReportScheduleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportSchedule> {
	return apiClient<ReportSchedule>('/governance/reports/schedules', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function updateSchedule(
	id: string,
	body: UpdateReportScheduleRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportSchedule> {
	return apiClient<ReportSchedule>(`/governance/reports/schedules/${id}`, {
		method: 'PUT',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function deleteSchedule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient<void>(`/governance/reports/schedules/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function pauseSchedule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportSchedule> {
	return apiClient<ReportSchedule>(`/governance/reports/schedules/${id}/pause`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function resumeSchedule(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ReportSchedule> {
	return apiClient<ReportSchedule>(`/governance/reports/schedules/${id}/resume`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
