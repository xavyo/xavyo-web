import { apiClient } from './client';
import type {
	DuplicateCandidateResponse,
	DuplicateDetailResponse,
	ListDuplicatesQuery,
	DetectionScanResponse,
	MergePreviewRequest,
	MergePreviewResponse,
	MergeExecuteRequest,
	MergeOperationResponse,
	BatchMergeRequest,
	BatchMergeResponse,
	BatchMergePreviewRequest,
	BatchMergePreviewResponse,
	ListMergeAuditsQuery,
	MergeAuditSummaryResponse,
	MergeAuditDetailResponse
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

// Duplicate Candidates

export async function listDuplicates(
	params: ListDuplicatesQuery,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: DuplicateCandidateResponse[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		status: params.status,
		min_confidence: params.min_confidence,
		max_confidence: params.max_confidence,
		identity_id: params.identity_id,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient(`/governance/duplicates${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getDuplicate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<DuplicateDetailResponse> {
	return apiClient(`/governance/duplicates/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function dismissDuplicate(
	id: string,
	reason: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<DuplicateCandidateResponse> {
	return apiClient(`/governance/duplicates/${id}/dismiss`, {
		method: 'POST',
		body: { reason },
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function detectDuplicates(
	minConfidence: number | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<DetectionScanResponse> {
	return apiClient('/governance/duplicates/detect', {
		method: 'POST',
		body: { min_confidence: minConfidence ?? 70.0 },
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Merge Operations

export async function listMergeOperations(
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: MergeOperationResponse[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient(`/governance/merges${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function previewMerge(
	body: MergePreviewRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MergePreviewResponse> {
	return apiClient('/governance/merges/preview', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function executeMerge(
	body: MergeExecuteRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MergeOperationResponse> {
	return apiClient('/governance/merges/execute', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getMergeOperation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MergeOperationResponse> {
	return apiClient(`/governance/merges/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Batch Merge

export async function executeBatchMerge(
	body: BatchMergeRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchMergeResponse> {
	return apiClient('/governance/merges/batch', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function previewBatchMerge(
	body: BatchMergePreviewRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BatchMergePreviewResponse> {
	return apiClient('/governance/merges/batch/preview', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// Merge Audit

export async function listMergeAudits(
	params: ListMergeAuditsQuery,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ items: MergeAuditSummaryResponse[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		identity_id: params.identity_id,
		operator_id: params.operator_id,
		from_date: params.from_date,
		to_date: params.to_date,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient(`/governance/merges/audit${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getMergeAudit(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MergeAuditDetailResponse> {
	return apiClient(`/governance/merges/audit/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
