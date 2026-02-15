import { apiClient } from './client';
import type {
	ScimTargetResponse,
	ScimTargetListResponse,
	CreateScimTargetRequest,
	UpdateScimTargetRequest,
	ScimTargetHealthCheckResponse,
	ScimSyncRunResponse,
	ScimSyncRun,
	ScimSyncRunListResponse,
	ScimProvisioningStateListResponse,
	ScimProvisioningLog,
	ScimProvisioningLogListResponse,
	ScimTargetMappingsResponse,
	ScimReplaceMappingsRequest
} from './types';

// ─── CRUD ────────────────────────────────────────────────────────────────

export async function listScimTargets(
	params: { status?: string; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/admin/scim-targets${qs ? `?${qs}` : ''}`;

	return apiClient<ScimTargetListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createScimTarget(
	body: CreateScimTargetRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetResponse> {
	return apiClient<ScimTargetResponse>('/admin/scim-targets', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getScimTarget(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetResponse> {
	return apiClient<ScimTargetResponse>(`/admin/scim-targets/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateScimTarget(
	id: string,
	body: UpdateScimTargetRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetResponse> {
	return apiClient<ScimTargetResponse>(`/admin/scim-targets/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteScimTarget(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`/admin/scim-targets/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// ─── Operations ──────────────────────────────────────────────────────────

export async function healthCheckScimTarget(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetHealthCheckResponse> {
	return apiClient<ScimTargetHealthCheckResponse>(`/admin/scim-targets/${id}/health-check`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function triggerScimSync(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimSyncRunResponse> {
	return apiClient<ScimSyncRunResponse>(`/admin/scim-targets/${id}/sync`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function triggerScimReconciliation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`/admin/scim-targets/${id}/reconcile`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// ─── Sync Runs ───────────────────────────────────────────────────────────

export async function listScimSyncRuns(
	id: string,
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimSyncRunListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();

	return apiClient<ScimSyncRunListResponse>(
		`/admin/scim-targets/${id}/sync-runs${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getScimSyncRun(
	id: string,
	runId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimSyncRun> {
	return apiClient<ScimSyncRun>(`/admin/scim-targets/${id}/sync-runs/${runId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// ─── Provisioning State ──────────────────────────────────────────────────

export async function listScimProvisioningState(
	id: string,
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimProvisioningStateListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();

	return apiClient<ScimProvisioningStateListResponse>(
		`/admin/scim-targets/${id}/provisioning-state${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function retryScimProvisioning(
	id: string,
	stateId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`/admin/scim-targets/${id}/provisioning-state/${stateId}/retry`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// ─── Provisioning Log ────────────────────────────────────────────────────

export async function listScimProvisioningLog(
	id: string,
	params: { limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimProvisioningLogListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();

	return apiClient<ScimProvisioningLogListResponse>(
		`/admin/scim-targets/${id}/log${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function getScimProvisioningLogDetail(
	id: string,
	logId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimProvisioningLog> {
	return apiClient<ScimProvisioningLog>(`/admin/scim-targets/${id}/log/${logId}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// ─── Attribute Mappings ──────────────────────────────────────────────────

export async function listScimTargetMappings(
	id: string,
	params: { resource_type?: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetMappingsResponse> {
	const searchParams = new URLSearchParams();
	if (params.resource_type) searchParams.set('resource_type', params.resource_type);
	const qs = searchParams.toString();

	return apiClient<ScimTargetMappingsResponse>(
		`/admin/scim-targets/${id}/mappings${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function replaceScimTargetMappings(
	id: string,
	body: ScimReplaceMappingsRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetMappingsResponse> {
	return apiClient<ScimTargetMappingsResponse>(`/admin/scim-targets/${id}/mappings`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function resetScimTargetMappingDefaults(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ScimTargetMappingsResponse> {
	return apiClient<ScimTargetMappingsResponse>(`/admin/scim-targets/${id}/mappings/defaults`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
