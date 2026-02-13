import { apiClient } from './client';
import type { LoginAttempt, CursorPaginatedResponse, LoginAttemptStats } from './types';

// --- Param interfaces ---

export interface LoginHistoryParams {
	cursor?: string;
	limit?: number;
	start_date?: string;
	end_date?: string;
	success?: boolean;
}

export interface AdminLoginAttemptsParams {
	cursor?: string;
	limit?: number;
	user_id?: string;
	email?: string;
	start_date?: string;
	end_date?: string;
	success?: boolean;
	auth_method?: string;
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

// --- Server-side functions (call xavyo-idp backend directly) ---

export async function fetchLoginHistory(
	params: LoginHistoryParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CursorPaginatedResponse<LoginAttempt>> {
	const qs = buildSearchParams({
		cursor: params.cursor,
		limit: params.limit,
		start_date: params.start_date,
		end_date: params.end_date,
		success: params.success
	});
	return apiClient<CursorPaginatedResponse<LoginAttempt>>(`/audit/login-history${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function fetchAdminLoginAttempts(
	params: AdminLoginAttemptsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CursorPaginatedResponse<LoginAttempt>> {
	const qs = buildSearchParams({
		cursor: params.cursor,
		limit: params.limit,
		user_id: params.user_id,
		email: params.email,
		start_date: params.start_date,
		end_date: params.end_date,
		success: params.success,
		auth_method: params.auth_method
	});
	return apiClient<CursorPaginatedResponse<LoginAttempt>>(`/admin/audit/login-attempts${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function fetchAdminLoginStats(
	startDate: string,
	endDate: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LoginAttemptStats> {
	const qs = buildSearchParams({
		start_date: startDate,
		end_date: endDate
	});
	return apiClient<LoginAttemptStats>(`/admin/audit/login-attempts/stats${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
