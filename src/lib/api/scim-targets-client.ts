import type {
	ScimTargetResponse,
	ScimTargetListResponse,
	ScimTargetHealthCheckResponse,
	ScimSyncRunResponse,
	ScimSyncRunListResponse,
	ScimProvisioningStateListResponse,
	ScimProvisioningLogListResponse,
	ScimProvisioningLog,
	ScimTargetMappingsResponse,
	ScimReplaceMappingsRequest
} from './types';

function buildSearchParams(params: Record<string, string | number | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

// ─── CRUD ────────────────────────────────────────────────────────────────

export async function fetchScimTargets(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ScimTargetListResponse> {
	const qs = buildSearchParams({ status: params.status, limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/admin/scim-targets${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SCIM targets: ${res.status}`);
	return res.json();
}

export async function getScimTargetClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ScimTargetResponse> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch SCIM target: ${res.status}`);
	return res.json();
}

export async function deleteScimTargetClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to delete SCIM target: ${res.status}`);
}

// ─── Operations ──────────────────────────────────────────────────────────

export async function healthCheckScimTargetClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ScimTargetHealthCheckResponse> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}/health-check`, { method: 'POST' });
	if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
	return res.json();
}

export async function triggerScimSyncClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ScimSyncRunResponse> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}/sync`, { method: 'POST' });
	if (!res.ok) throw new Error(`Sync trigger failed: ${res.status}`);
	return res.json();
}

export async function triggerScimReconciliationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}/reconcile`, { method: 'POST' });
	if (!res.ok) throw new Error(`Reconciliation trigger failed: ${res.status}`);
}

// ─── Sync Runs ───────────────────────────────────────────────────────────

export async function fetchScimSyncRuns(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ScimSyncRunListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/admin/scim-targets/${id}/sync-runs${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch sync runs: ${res.status}`);
	return res.json();
}

// ─── Provisioning State ──────────────────────────────────────────────────

export async function fetchScimProvisioningState(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ScimProvisioningStateListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/admin/scim-targets/${id}/provisioning-state${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch provisioning state: ${res.status}`);
	return res.json();
}

export async function retryScimProvisioningClient(
	id: string,
	stateId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}/provisioning-state/${stateId}/retry`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Provisioning retry failed: ${res.status}`);
}

// ─── Provisioning Log ────────────────────────────────────────────────────

export async function fetchScimProvisioningLog(
	id: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ScimProvisioningLogListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/admin/scim-targets/${id}/log${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch provisioning log: ${res.status}`);
	return res.json();
}

export async function getScimProvisioningLogDetailClient(
	id: string,
	logId: string,
	fetchFn: typeof fetch = fetch
): Promise<ScimProvisioningLog> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}/log/${logId}`);
	if (!res.ok) throw new Error(`Failed to fetch log detail: ${res.status}`);
	return res.json();
}

// ─── Attribute Mappings ──────────────────────────────────────────────────

export async function fetchScimTargetMappings(
	id: string,
	params: { resource_type?: string } = {},
	fetchFn: typeof fetch = fetch
): Promise<ScimTargetMappingsResponse> {
	const qs = buildSearchParams({ resource_type: params.resource_type });
	const res = await fetchFn(`/api/admin/scim-targets/${id}/mappings${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch mappings: ${res.status}`);
	return res.json();
}

export async function replaceScimTargetMappingsClient(
	id: string,
	body: ScimReplaceMappingsRequest,
	fetchFn: typeof fetch = fetch
): Promise<ScimTargetMappingsResponse> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}/mappings`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to replace mappings: ${res.status}`);
	return res.json();
}

export async function resetScimTargetMappingDefaultsClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ScimTargetMappingsResponse> {
	const res = await fetchFn(`/api/admin/scim-targets/${id}/mappings/defaults`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to reset mapping defaults: ${res.status}`);
	return res.json();
}
