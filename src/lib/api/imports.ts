import { env } from '$env/dynamic/private';
import { apiClient, ApiError } from './client';
import type {
	ImportJobListResponse,
	ImportJobDetail,
	ImportErrorListResponse,
	ImportJobCreatedResponse,
	BulkResendResponse,
	InvitationValidationResponse,
	AcceptInvitationResponse
} from './types';

export interface ListImportJobsParams {
	status?: string;
	limit?: number;
	offset?: number;
}

export interface ListImportErrorsParams {
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

export async function uploadImport(
	file: File,
	sendInvitations: boolean,
	token: string,
	tenantId: string,
	fetchFn: typeof globalThis.fetch = globalThis.fetch
): Promise<ImportJobCreatedResponse> {
	const url = `${env.API_BASE_URL}/admin/users/import`;
	const formData = new FormData();
	formData.append('file', file);
	formData.append('send_invitations', String(sendInvitations));

	const response = await fetchFn(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'X-Tenant-Id': tenantId
		},
		body: formData
	});

	if (!response.ok) {
		let errorMessage = 'An error occurred';
		try {
			const text = await response.text();
			try {
				const errorBody = JSON.parse(text);
				errorMessage = errorBody.message || errorBody.detail || errorBody.error || errorMessage;
			} catch {
				if (text) {
					errorMessage = text;
				}
			}
		} catch {
			// Could not read response body
		}
		throw new ApiError(errorMessage, response.status);
	}

	return response.json();
}

export async function listImportJobs(
	params: ListImportJobsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ImportJobListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ImportJobListResponse>(`/admin/users/imports${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getImportJob(
	jobId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ImportJobDetail> {
	return apiClient<ImportJobDetail>(`/admin/users/imports/${jobId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listImportErrors(
	jobId: string,
	params: ListImportErrorsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ImportErrorListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ImportErrorListResponse>(`/admin/users/imports/${jobId}/errors${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function downloadImportErrors(
	jobId: string,
	token: string,
	tenantId: string,
	fetchFn: typeof globalThis.fetch = globalThis.fetch
): Promise<Response> {
	const url = `${env.API_BASE_URL}/admin/users/imports/${jobId}/errors/download`;

	const response = await fetchFn(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			'X-Tenant-Id': tenantId
		}
	});

	if (!response.ok) {
		let errorMessage = 'An error occurred';
		try {
			const text = await response.text();
			try {
				const errorBody = JSON.parse(text);
				errorMessage = errorBody.message || errorBody.detail || errorBody.error || errorMessage;
			} catch {
				if (text) {
					errorMessage = text;
				}
			}
		} catch {
			// Could not read response body
		}
		throw new ApiError(errorMessage, response.status);
	}

	return response;
}

export async function resendInvitations(
	jobId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BulkResendResponse> {
	return apiClient<BulkResendResponse>(`/admin/users/imports/${jobId}/resend-invitations`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function validateInvitation(
	tokenValue: string,
	fetchFn: typeof globalThis.fetch = globalThis.fetch
): Promise<InvitationValidationResponse> {
	const url = `${env.API_BASE_URL}/invite/${tokenValue}`;

	const response = await fetchFn(url, {
		method: 'GET'
	});

	if (!response.ok) {
		let errorMessage = 'An error occurred';
		try {
			const text = await response.text();
			try {
				const errorBody = JSON.parse(text);
				errorMessage = errorBody.message || errorBody.detail || errorBody.error || errorMessage;
			} catch {
				if (text) {
					errorMessage = text;
				}
			}
		} catch {
			// Could not read response body
		}
		throw new ApiError(errorMessage, response.status);
	}

	return response.json();
}

export async function acceptInvitation(
	tokenValue: string,
	password: string,
	fetchFn: typeof globalThis.fetch = globalThis.fetch
): Promise<AcceptInvitationResponse> {
	const url = `${env.API_BASE_URL}/invite/${tokenValue}`;

	const response = await fetchFn(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ password })
	});

	if (!response.ok) {
		let errorMessage = 'An error occurred';
		try {
			const text = await response.text();
			try {
				const errorBody = JSON.parse(text);
				errorMessage = errorBody.message || errorBody.detail || errorBody.error || errorMessage;
			} catch {
				if (text) {
					errorMessage = text;
				}
			}
		} catch {
			// Could not read response body
		}
		throw new ApiError(errorMessage, response.status);
	}

	return response.json();
}
