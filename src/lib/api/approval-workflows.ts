import { apiClient } from './client';
import type {
	ApprovalWorkflowListResponse,
	ApprovalWorkflow,
	CreateApprovalWorkflowRequest,
	UpdateApprovalWorkflowRequest,
	ApprovalGroupListResponse,
	ApprovalGroup,
	CreateApprovalGroupRequest,
	UpdateApprovalGroupRequest,
	ModifyMembersRequest,
	EscalationPolicyListResponse,
	EscalationPolicy,
	CreateEscalationPolicyRequest,
	UpdateEscalationPolicyRequest,
	AddEscalationLevelRequest,
	EscalationLevel,
	EscalationHistoryResponse,
	SodExemptionListResponse,
	SodExemption,
	CreateSodExemptionRequest
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

// --- Approval Workflows ---

export interface ListWorkflowsParams {
	limit?: number;
	offset?: number;
}

export async function listApprovalWorkflows(
	params: ListWorkflowsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalWorkflowListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<ApprovalWorkflowListResponse>(`/governance/approval-workflows${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createApprovalWorkflow(
	data: CreateApprovalWorkflowRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalWorkflow> {
	return apiClient<ApprovalWorkflow>('/governance/approval-workflows', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getApprovalWorkflow(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalWorkflow> {
	return apiClient<ApprovalWorkflow>(`/governance/approval-workflows/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateApprovalWorkflow(
	id: string,
	data: UpdateApprovalWorkflowRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalWorkflow> {
	return apiClient<ApprovalWorkflow>(`/governance/approval-workflows/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteApprovalWorkflow(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/approval-workflows/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function setDefaultWorkflow(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalWorkflow> {
	return apiClient<ApprovalWorkflow>(`/governance/approval-workflows/${id}/set-default`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Approval Groups ---

export interface ListGroupsParams {
	limit?: number;
	offset?: number;
}

export async function listApprovalGroups(
	params: ListGroupsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroupListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<ApprovalGroupListResponse>(`/governance/approval-groups${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createApprovalGroup(
	data: CreateApprovalGroupRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroup> {
	return apiClient<ApprovalGroup>('/governance/approval-groups', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getApprovalGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroup> {
	return apiClient<ApprovalGroup>(`/governance/approval-groups/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateApprovalGroup(
	id: string,
	data: UpdateApprovalGroupRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroup> {
	return apiClient<ApprovalGroup>(`/governance/approval-groups/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteApprovalGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/approval-groups/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function enableApprovalGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroup> {
	return apiClient<ApprovalGroup>(`/governance/approval-groups/${id}/enable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableApprovalGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroup> {
	return apiClient<ApprovalGroup>(`/governance/approval-groups/${id}/disable`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function addGroupMembers(
	groupId: string,
	data: ModifyMembersRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroup> {
	return apiClient<ApprovalGroup>(`/governance/approval-groups/${groupId}/members`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeGroupMembers(
	groupId: string,
	data: ModifyMembersRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ApprovalGroup> {
	return apiClient<ApprovalGroup>(`/governance/approval-groups/${groupId}/members`, {
		method: 'DELETE',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Escalation Policies ---

export interface ListEscalationPoliciesParams {
	limit?: number;
	offset?: number;
}

export async function listEscalationPolicies(
	params: ListEscalationPoliciesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EscalationPolicyListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	return apiClient<EscalationPolicyListResponse>(`/governance/escalation-policies${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createEscalationPolicy(
	data: CreateEscalationPolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EscalationPolicy> {
	return apiClient<EscalationPolicy>('/governance/escalation-policies', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getEscalationPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EscalationPolicy> {
	return apiClient<EscalationPolicy>(`/governance/escalation-policies/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateEscalationPolicy(
	id: string,
	data: UpdateEscalationPolicyRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EscalationPolicy> {
	return apiClient<EscalationPolicy>(`/governance/escalation-policies/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteEscalationPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/escalation-policies/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function setDefaultEscalationPolicy(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EscalationPolicy> {
	return apiClient<EscalationPolicy>(`/governance/escalation-policies/${id}/set-default`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function addEscalationLevel(
	policyId: string,
	data: AddEscalationLevelRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EscalationLevel> {
	return apiClient<EscalationLevel>(`/governance/escalation-policies/${policyId}/levels`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeEscalationLevel(
	policyId: string,
	levelId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/governance/escalation-policies/${policyId}/levels/${levelId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- Escalation History (Access Requests) ---

export async function getEscalationHistory(
	requestId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EscalationHistoryResponse> {
	return apiClient<EscalationHistoryResponse>(
		`/governance/access-requests/${requestId}/escalation-history`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function cancelEscalation(
	requestId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ success: boolean }> {
	return apiClient<{ success: boolean }>(
		`/governance/access-requests/${requestId}/cancel-escalation`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function resetEscalation(
	requestId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ success: boolean }> {
	return apiClient<{ success: boolean }>(
		`/governance/access-requests/${requestId}/reset-escalation`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- SoD Exemptions ---

export interface ListSodExemptionsParams {
	status?: string;
	limit?: number;
	offset?: number;
}

export async function listSodExemptions(
	params: ListSodExemptionsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodExemptionListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<SodExemptionListResponse>(`/governance/sod-exemptions${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createSodExemption(
	data: CreateSodExemptionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodExemption> {
	return apiClient<SodExemption>('/governance/sod-exemptions', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSodExemption(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodExemption> {
	return apiClient<SodExemption>(`/governance/sod-exemptions/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeSodExemption(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SodExemption> {
	return apiClient<SodExemption>(`/governance/sod-exemptions/${id}/revoke`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
