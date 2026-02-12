import type {
	ApprovalItemListResponse,
	ApprovalItem
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

export async function fetchMyApprovals(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ApprovalItemListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/my-approvals${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch my approvals: ${res.status}`);
	return res.json();
}

export async function approveApprovalClient(
	id: string,
	comment?: string,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalItem> {
	const res = await fetchFn(`/api/governance/my-approvals/${id}/approve`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ comment })
	});
	if (!res.ok) throw new Error(`Failed to approve approval: ${res.status}`);
	return res.json();
}

export async function rejectApprovalClient(
	id: string,
	comment: string,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalItem> {
	const res = await fetchFn(`/api/governance/my-approvals/${id}/reject`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ comment })
	});
	if (!res.ok) throw new Error(`Failed to reject approval: ${res.status}`);
	return res.json();
}
