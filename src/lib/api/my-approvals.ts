import { apiClient } from './client';
import type {
	ApprovalItemListResponse,
	ApprovalItem,
	ApproveApprovalRequest,
	RejectApprovalRequest
} from './types';

export interface ListMyApprovalsParams {
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

export async function listMyApprovals(
	params: ListMyApprovalsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalItemListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<ApprovalItemListResponse>(`/governance/my-approvals${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function approveApproval(
	id: string,
	body: ApproveApprovalRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalItem> {
	return apiClient<ApprovalItem>(`/governance/my-approvals/${id}/approve`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function rejectApproval(
	id: string,
	body: RejectApprovalRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalItem> {
	return apiClient<ApprovalItem>(`/governance/my-approvals/${id}/reject`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}
