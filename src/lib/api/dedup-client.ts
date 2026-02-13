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

export async function fetchDuplicates(
	params: ListDuplicatesQuery = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: DuplicateCandidateResponse[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		status: params.status,
		min_confidence: params.min_confidence,
		max_confidence: params.max_confidence,
		identity_id: params.identity_id,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/duplicates${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch duplicates: ${res.status}`);
	return res.json();
}

export async function fetchDuplicateDetail(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<DuplicateDetailResponse> {
	const res = await fetchFn(`/api/governance/duplicates/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch duplicate detail: ${res.status}`);
	return res.json();
}

export async function dismissDuplicateClient(
	id: string,
	reason: string,
	fetchFn: typeof fetch = fetch
): Promise<DuplicateCandidateResponse> {
	const res = await fetchFn(`/api/governance/duplicates/${id}/dismiss`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ reason })
	});
	if (!res.ok) throw new Error(`Failed to dismiss duplicate: ${res.status}`);
	return res.json();
}

export async function runDetection(
	minConfidence?: number,
	fetchFn: typeof fetch = fetch
): Promise<DetectionScanResponse> {
	const res = await fetchFn('/api/governance/duplicates', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ min_confidence: minConfidence })
	});
	if (!res.ok) throw new Error(`Failed to run detection: ${res.status}`);
	return res.json();
}

// Merge Operations

export async function fetchMergePreview(
	body: MergePreviewRequest,
	fetchFn: typeof fetch = fetch
): Promise<MergePreviewResponse> {
	const res = await fetchFn('/api/governance/merges/preview', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to preview merge: ${res.status}`);
	return res.json();
}

export async function executeMergeClient(
	body: MergeExecuteRequest,
	fetchFn: typeof fetch = fetch
): Promise<MergeOperationResponse> {
	const res = await fetchFn('/api/governance/merges/execute', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to execute merge: ${res.status}`);
	return res.json();
}

// Batch Merge

export async function fetchBatchPreview(
	body: BatchMergePreviewRequest,
	fetchFn: typeof fetch = fetch
): Promise<BatchMergePreviewResponse> {
	const res = await fetchFn('/api/governance/merges/batch/preview', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to preview batch merge: ${res.status}`);
	return res.json();
}

export async function executeBatchMergeClient(
	body: BatchMergeRequest,
	fetchFn: typeof fetch = fetch
): Promise<BatchMergeResponse> {
	const res = await fetchFn('/api/governance/merges/batch', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to execute batch merge: ${res.status}`);
	return res.json();
}

// Merge Audit

export async function fetchMergeAudits(
	params: ListMergeAuditsQuery = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: MergeAuditSummaryResponse[]; total: number; limit: number; offset: number }> {
	const qs = buildSearchParams({
		identity_id: params.identity_id,
		operator_id: params.operator_id,
		from_date: params.from_date,
		to_date: params.to_date,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/merges/audit${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch merge audits: ${res.status}`);
	return res.json();
}

export async function fetchMergeAuditDetail(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<MergeAuditDetailResponse> {
	const res = await fetchFn(`/api/governance/merges/audit/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch merge audit detail: ${res.status}`);
	return res.json();
}
