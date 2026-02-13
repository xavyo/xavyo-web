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

// --- Client-side functions (call BFF proxy endpoints) ---

export async function getLoginHistory(
	params: LoginHistoryParams,
	fetchFn: typeof fetch = fetch
): Promise<CursorPaginatedResponse<LoginAttempt>> {
	const qs = buildSearchParams({
		cursor: params.cursor,
		limit: params.limit,
		start_date: params.start_date,
		end_date: params.end_date,
		success: params.success
	});
	const url = `/api/audit/login-history${qs}`;
	const res = await fetchFn(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch login history: ${res.status}`);
	}
	return res.json();
}

export async function getAdminLoginAttempts(
	params: AdminLoginAttemptsParams,
	fetchFn: typeof fetch = fetch
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
	const url = `/api/audit/admin/login-attempts${qs}`;
	const res = await fetchFn(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch admin login attempts: ${res.status}`);
	}
	return res.json();
}

export async function getAdminLoginStats(
	startDate: string,
	endDate: string,
	fetchFn: typeof fetch = fetch
): Promise<LoginAttemptStats> {
	const qs = buildSearchParams({
		start_date: startDate,
		end_date: endDate
	});
	const url = `/api/audit/admin/stats${qs}`;
	const res = await fetchFn(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch admin login stats: ${res.status}`);
	}
	return res.json();
}
