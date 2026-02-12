import { apiClient } from './client';
import type {
	BirthrightPolicy,
	BirthrightPolicyListResponse,
	CreateBirthrightPolicyRequest,
	UpdateBirthrightPolicyRequest,
	SimulatePolicyRequest,
	SimulatePolicyResponse,
	SimulateAllPoliciesResponse,
	ImpactAnalysisResponse,
	LifecycleEvent,
	LifecycleEventListResponse,
	CreateLifecycleEventRequest,
	ProcessEventResult,
	LifecycleEventDetail
} from './types';

// --- Param interfaces ---

export interface ListBirthrightPoliciesParams {
	status?: string;
	limit?: number;
	offset?: number;
}

export interface ListLifecycleEventsParams {
	user_id?: string;
	event_type?: string;
	from?: string;
	to?: string;
	processed?: boolean;
	limit?: number;
	offset?: number;
}

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

export async function listBirthrightPolicies(
	params: ListBirthrightPoliciesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BirthrightPolicyListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<BirthrightPolicyListResponse>(`/governance/birthright-policies${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getBirthrightPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BirthrightPolicy> {
	return apiClient<BirthrightPolicy>(`/governance/birthright-policies/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createBirthrightPolicy(
	data: CreateBirthrightPolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BirthrightPolicy> {
	return apiClient<BirthrightPolicy>('/governance/birthright-policies', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateBirthrightPolicy(
	id: string,
	data: UpdateBirthrightPolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BirthrightPolicy> {
	return apiClient<BirthrightPolicy>(`/governance/birthright-policies/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function archiveBirthrightPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	return apiClient<void>(`/governance/birthright-policies/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function enableBirthrightPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BirthrightPolicy> {
	return apiClient<BirthrightPolicy>(`/governance/birthright-policies/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableBirthrightPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BirthrightPolicy> {
	return apiClient<BirthrightPolicy>(`/governance/birthright-policies/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function simulatePolicy(
	id: string,
	data: SimulatePolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SimulatePolicyResponse> {
	return apiClient<SimulatePolicyResponse>(`/governance/birthright-policies/${id}/simulate`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function simulateAllPolicies(
	data: SimulatePolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SimulateAllPoliciesResponse> {
	return apiClient<SimulateAllPoliciesResponse>('/governance/birthright-policies/simulate', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function analyzeImpact(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ImpactAnalysisResponse> {
	return apiClient<ImpactAnalysisResponse>(`/governance/birthright-policies/${id}/impact`, {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Lifecycle Events ---

export async function listLifecycleEvents(
	params: ListLifecycleEventsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
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
	return apiClient<LifecycleEventListResponse>(`/governance/lifecycle-events${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getLifecycleEvent(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LifecycleEventDetail> {
	return apiClient<LifecycleEventDetail>(`/governance/lifecycle-events/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createLifecycleEvent(
	data: CreateLifecycleEventRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<LifecycleEvent> {
	return apiClient<LifecycleEvent>('/governance/lifecycle-events', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function processLifecycleEvent(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProcessEventResult> {
	return apiClient<ProcessEventResult>(`/governance/lifecycle-events/${id}/process`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function triggerLifecycleEvent(
	data: CreateLifecycleEventRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProcessEventResult> {
	return apiClient<ProcessEventResult>('/governance/lifecycle-events/trigger', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}
