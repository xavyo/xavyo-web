import type {
	SlaPolicy,
	TicketingConfig,
	BulkAction,
	BulkActionPreview,
	ExpressionValidationResult,
	FailedOperation,
	BulkStateOperation,
	ScheduledTransition
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

// --- SLA Policies ---

export async function fetchSlaPolicies(
	params: { status?: string; category?: string; page?: number; page_size?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: SlaPolicy[]; total: number }> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/sla-policies${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch SLA policies: ${res.statusText}`);
	return res.json();
}

export async function fetchSlaPolicy(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SlaPolicy> {
	const res = await fetchFn(`/api/governance/sla-policies/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch SLA policy: ${res.statusText}`);
	return res.json();
}

export async function deleteSlaPolicy(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/sla-policies/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete SLA policy: ${res.statusText}`);
}

// --- Ticketing Configuration ---

export async function fetchTicketingConfigs(
	params: { page?: number; page_size?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: TicketingConfig[]; total: number }> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/ticketing-configuration${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch ticketing configurations: ${res.statusText}`);
	return res.json();
}

export async function fetchTicketingConfig(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<TicketingConfig> {
	const res = await fetchFn(`/api/governance/ticketing-configuration/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch ticketing configuration: ${res.statusText}`);
	return res.json();
}

export async function deleteTicketingConfig(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/ticketing-configuration/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete ticketing configuration: ${res.statusText}`);
}

// --- Bulk Actions ---

export async function fetchBulkActions(
	params: { status?: string; action_type?: string; page?: number; page_size?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: BulkAction[]; total: number }> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/bulk-actions${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch bulk actions: ${res.statusText}`);
	return res.json();
}

export async function fetchBulkAction(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BulkAction> {
	const res = await fetchFn(`/api/governance/bulk-actions/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch bulk action: ${res.statusText}`);
	return res.json();
}

export async function previewBulkAction(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BulkActionPreview> {
	const res = await fetchFn(`/api/governance/bulk-actions/${id}/preview`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to preview bulk action: ${res.statusText}`);
	return res.json();
}

export async function executeBulkAction(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BulkAction> {
	const res = await fetchFn(`/api/governance/bulk-actions/${id}/execute`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to execute bulk action: ${res.statusText}`);
	return res.json();
}

export async function cancelBulkAction(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BulkAction> {
	const res = await fetchFn(`/api/governance/bulk-actions/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel bulk action: ${res.statusText}`);
	return res.json();
}

export async function validateExpression(
	expression: string,
	fetchFn: typeof fetch = fetch
): Promise<ExpressionValidationResult> {
	const res = await fetchFn('/api/governance/bulk-actions/validate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ expression })
	});
	if (!res.ok) throw new Error(`Failed to validate expression: ${res.statusText}`);
	return res.json();
}

// --- Failed Operations ---

export async function fetchFailedOperations(
	params: { page?: number; page_size?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: FailedOperation[]; total: number }> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/failed-operations${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch failed operations: ${res.statusText}`);
	return res.json();
}

export async function fetchFailedOperationCount(
	fetchFn: typeof fetch = fetch
): Promise<{ count: number }> {
	const res = await fetchFn('/api/governance/failed-operations/count');
	if (!res.ok) throw new Error(`Failed to fetch failed operation count: ${res.statusText}`);
	return res.json();
}

export async function processFailedOperationRetries(
	fetchFn: typeof fetch = fetch
): Promise<Record<string, unknown>> {
	const res = await fetchFn('/api/governance/failed-operations/process-retries', {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to process retries: ${res.statusText}`);
	return res.json();
}

// --- Bulk State Operations ---

export async function fetchBulkStateOperations(
	params: { status?: string; page?: number; page_size?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: BulkStateOperation[]; total: number }> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/bulk-state-operations${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch bulk state operations: ${res.statusText}`);
	return res.json();
}

export async function createBulkStateOperation(
	body: { object_type: string; target_state: string; filter_expression: string },
	fetchFn: typeof fetch = fetch
): Promise<BulkStateOperation> {
	const res = await fetchFn('/api/governance/bulk-state-operations', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create bulk state operation: ${res.statusText}`);
	return res.json();
}

export async function fetchBulkStateOperation(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BulkStateOperation> {
	const res = await fetchFn(`/api/governance/bulk-state-operations/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch bulk state operation: ${res.statusText}`);
	return res.json();
}

export async function cancelBulkStateOperation(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BulkStateOperation> {
	const res = await fetchFn(`/api/governance/bulk-state-operations/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel bulk state operation: ${res.statusText}`);
	return res.json();
}

export async function processBulkStateOperations(
	fetchFn: typeof fetch = fetch
): Promise<Record<string, unknown>> {
	const res = await fetchFn('/api/governance/bulk-state-operations/process', {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to process bulk state operations: ${res.statusText}`);
	return res.json();
}

// --- Scheduled Transitions ---

export async function fetchScheduledTransitions(
	params: { status?: string; object_type?: string; page?: number; page_size?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<{ items: ScheduledTransition[]; total: number }> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/scheduled-transitions${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch scheduled transitions: ${res.statusText}`);
	return res.json();
}

export async function fetchScheduledTransition(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ScheduledTransition> {
	const res = await fetchFn(`/api/governance/scheduled-transitions/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch scheduled transition: ${res.statusText}`);
	return res.json();
}

export async function cancelScheduledTransition(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ScheduledTransition> {
	const res = await fetchFn(`/api/governance/scheduled-transitions/${id}/cancel`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel scheduled transition: ${res.statusText}`);
	return res.json();
}
