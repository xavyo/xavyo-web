import type {
	BirthrightPolicyListResponse,
	BirthrightPolicy,
	CreateBirthrightPolicyRequest,
	UpdateBirthrightPolicyRequest,
	SimulatePolicyRequest,
	SimulatePolicyResponse,
	SimulateAllPoliciesResponse,
	ImpactAnalysisResponse,
	LifecycleEventListResponse,
	LifecycleEvent,
	CreateLifecycleEventRequest,
	ProcessEventResult
} from './types';

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

// --- Birthright Policies ---

export async function fetchBirthrightPolicies(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<BirthrightPolicyListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/birthright-policies${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch birthright policies: ${res.status}`);
	return res.json();
}

export async function fetchBirthrightPolicy(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BirthrightPolicy> {
	const res = await fetchFn(`/api/governance/birthright-policies/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch birthright policy: ${res.status}`);
	return res.json();
}

export async function createBirthrightPolicyClient(
	data: CreateBirthrightPolicyRequest,
	fetchFn: typeof fetch = fetch
): Promise<BirthrightPolicy> {
	const res = await fetchFn('/api/governance/birthright-policies', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create birthright policy: ${res.status}`);
	return res.json();
}

export async function updateBirthrightPolicyClient(
	id: string,
	data: UpdateBirthrightPolicyRequest,
	fetchFn: typeof fetch = fetch
): Promise<BirthrightPolicy> {
	const res = await fetchFn(`/api/governance/birthright-policies/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update birthright policy: ${res.status}`);
	return res.json();
}

export async function archiveBirthrightPolicyClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/birthright-policies/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to archive birthright policy: ${res.status}`);
}

export async function enableBirthrightPolicyClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BirthrightPolicy> {
	const res = await fetchFn(`/api/governance/birthright-policies/${id}/enable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to enable birthright policy: ${res.status}`);
	return res.json();
}

export async function disableBirthrightPolicyClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<BirthrightPolicy> {
	const res = await fetchFn(`/api/governance/birthright-policies/${id}/disable`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to disable birthright policy: ${res.status}`);
	return res.json();
}

export async function simulatePolicyClient(
	id: string,
	data: SimulatePolicyRequest,
	fetchFn: typeof fetch = fetch
): Promise<SimulatePolicyResponse> {
	const res = await fetchFn(`/api/governance/birthright-policies/${id}/simulate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to simulate policy: ${res.status}`);
	return res.json();
}

export async function simulateAllPoliciesClient(
	data: SimulatePolicyRequest,
	fetchFn: typeof fetch = fetch
): Promise<SimulateAllPoliciesResponse> {
	const res = await fetchFn('/api/governance/birthright-policies/simulate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to simulate all policies: ${res.status}`);
	return res.json();
}

export async function analyzeImpactClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ImpactAnalysisResponse> {
	const res = await fetchFn(`/api/governance/birthright-policies/${id}/impact`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({})
	});
	if (!res.ok) throw new Error(`Failed to analyze impact: ${res.status}`);
	return res.json();
}

// --- Lifecycle Events ---

export async function fetchLifecycleEvents(
	params: {
		user_id?: string;
		event_type?: string;
		from?: string;
		to?: string;
		processed?: boolean;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<LifecycleEventListResponse> {
	const qs = buildSearchParams({
		user_id: params.user_id,
		event_type: params.event_type,
		from: params.from,
		to: params.to,
		processed: params.processed,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/lifecycle-events${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch lifecycle events: ${res.status}`);
	return res.json();
}

export async function fetchLifecycleEvent(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ProcessEventResult> {
	const res = await fetchFn(`/api/governance/lifecycle-events/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch lifecycle event: ${res.status}`);
	return res.json();
}

export async function createLifecycleEventClient(
	data: CreateLifecycleEventRequest,
	fetchFn: typeof fetch = fetch
): Promise<LifecycleEvent> {
	const res = await fetchFn('/api/governance/lifecycle-events', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create lifecycle event: ${res.status}`);
	return res.json();
}

export async function processLifecycleEventClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ProcessEventResult> {
	const res = await fetchFn(`/api/governance/lifecycle-events/${id}/process`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to process lifecycle event: ${res.status}`);
	return res.json();
}

export async function triggerLifecycleEventClient(
	data: CreateLifecycleEventRequest,
	fetchFn: typeof fetch = fetch
): Promise<ProcessEventResult> {
	const res = await fetchFn('/api/governance/lifecycle-events/trigger', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to trigger lifecycle event: ${res.status}`);
	return res.json();
}
