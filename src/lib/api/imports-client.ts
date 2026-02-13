import type {
	ImportJobListResponse,
	ImportJobDetail,
	ImportErrorListResponse,
	BulkResendResponse
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

export async function fetchImportJobs(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ImportJobListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/imports${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch import jobs: ${res.status}`);
	return res.json();
}

export async function fetchImportJob(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ImportJobDetail> {
	const res = await fetchFn(`/api/admin/imports/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch import job: ${res.status}`);
	return res.json();
}

export async function fetchImportErrors(
	jobId: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ImportErrorListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/imports/${jobId}/errors${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch import errors: ${res.status}`);
	return res.json();
}

export function downloadErrorCsv(jobId: string): void {
	window.open(`/api/admin/imports/${jobId}/errors/download`, '_blank');
}

export async function resendInvitationsClient(
	jobId: string,
	fetchFn: typeof fetch = fetch
): Promise<BulkResendResponse> {
	const res = await fetchFn(`/api/admin/imports/${jobId}/resend-invitations`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to resend invitations: ${res.status}`);
	return res.json();
}
