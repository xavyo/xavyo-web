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

export async function fetchApprovalWorkflows(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ApprovalWorkflowListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/governance/approval-workflows${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch workflows: ${res.status}`);
	return res.json();
}

export async function fetchApprovalWorkflow(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalWorkflow> {
	const res = await fetchFn(`/api/governance/approval-workflows/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch workflow: ${res.status}`);
	return res.json();
}

export async function createApprovalWorkflowClient(
	data: CreateApprovalWorkflowRequest,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalWorkflow> {
	const res = await fetchFn('/api/governance/approval-workflows', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create workflow: ${res.status}`);
	return res.json();
}

export async function updateApprovalWorkflowClient(
	id: string,
	data: UpdateApprovalWorkflowRequest,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalWorkflow> {
	const res = await fetchFn(`/api/governance/approval-workflows/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update workflow: ${res.status}`);
	return res.json();
}

export async function deleteApprovalWorkflowClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/approval-workflows/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to delete workflow: ${res.status}`);
}

export async function setDefaultWorkflowClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalWorkflow> {
	const res = await fetchFn(`/api/governance/approval-workflows/${id}/set-default`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to set default workflow: ${res.status}`);
	return res.json();
}

// --- Approval Groups ---

export async function fetchApprovalGroups(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroupListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/governance/approval-groups${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch groups: ${res.status}`);
	return res.json();
}

export async function fetchApprovalGroup(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroup> {
	const res = await fetchFn(`/api/governance/approval-groups/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch group: ${res.status}`);
	return res.json();
}

export async function createApprovalGroupClient(
	data: CreateApprovalGroupRequest,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroup> {
	const res = await fetchFn('/api/governance/approval-groups', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create group: ${res.status}`);
	return res.json();
}

export async function updateApprovalGroupClient(
	id: string,
	data: UpdateApprovalGroupRequest,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroup> {
	const res = await fetchFn(`/api/governance/approval-groups/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update group: ${res.status}`);
	return res.json();
}

export async function deleteApprovalGroupClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/approval-groups/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to delete group: ${res.status}`);
}

export async function enableApprovalGroupClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroup> {
	const res = await fetchFn(`/api/governance/approval-groups/${id}/enable`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to enable group: ${res.status}`);
	return res.json();
}

export async function disableApprovalGroupClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroup> {
	const res = await fetchFn(`/api/governance/approval-groups/${id}/disable`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to disable group: ${res.status}`);
	return res.json();
}

export async function addGroupMembersClient(
	groupId: string,
	data: ModifyMembersRequest,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroup> {
	const res = await fetchFn(`/api/governance/approval-groups/${groupId}/members`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add members: ${res.status}`);
	return res.json();
}

export async function removeGroupMembersClient(
	groupId: string,
	data: ModifyMembersRequest,
	fetchFn: typeof fetch = fetch
): Promise<ApprovalGroup> {
	const res = await fetchFn(`/api/governance/approval-groups/${groupId}/members`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to remove members: ${res.status}`);
	return res.json();
}

// --- Escalation Policies ---

export async function fetchEscalationPolicies(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<EscalationPolicyListResponse> {
	const qs = buildSearchParams({ limit: params.limit, offset: params.offset });
	const res = await fetchFn(`/api/governance/escalation-policies${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch escalation policies: ${res.status}`);
	return res.json();
}

export async function fetchEscalationPolicy(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<EscalationPolicy> {
	const res = await fetchFn(`/api/governance/escalation-policies/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch escalation policy: ${res.status}`);
	return res.json();
}

export async function createEscalationPolicyClient(
	data: CreateEscalationPolicyRequest,
	fetchFn: typeof fetch = fetch
): Promise<EscalationPolicy> {
	const res = await fetchFn('/api/governance/escalation-policies', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create escalation policy: ${res.status}`);
	return res.json();
}

export async function updateEscalationPolicyClient(
	id: string,
	data: UpdateEscalationPolicyRequest,
	fetchFn: typeof fetch = fetch
): Promise<EscalationPolicy> {
	const res = await fetchFn(`/api/governance/escalation-policies/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update escalation policy: ${res.status}`);
	return res.json();
}

export async function deleteEscalationPolicyClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/escalation-policies/${id}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to delete escalation policy: ${res.status}`);
}

export async function setDefaultEscalationPolicyClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<EscalationPolicy> {
	const res = await fetchFn(`/api/governance/escalation-policies/${id}/set-default`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to set default policy: ${res.status}`);
	return res.json();
}

export async function addEscalationLevelClient(
	policyId: string,
	data: AddEscalationLevelRequest,
	fetchFn: typeof fetch = fetch
): Promise<EscalationLevel> {
	const res = await fetchFn(`/api/governance/escalation-policies/${policyId}/levels`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to add level: ${res.status}`);
	return res.json();
}

export async function removeEscalationLevelClient(
	policyId: string,
	levelId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/escalation-policies/${policyId}/levels/${levelId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove level: ${res.status}`);
}

// --- Escalation History ---

export async function fetchEscalationHistory(
	requestId: string,
	fetchFn: typeof fetch = fetch
): Promise<EscalationHistoryResponse> {
	const res = await fetchFn(`/api/governance/access-requests/${requestId}/escalation-history`);
	if (!res.ok) throw new Error(`Failed to fetch escalation history: ${res.status}`);
	return res.json();
}

export async function cancelEscalationClient(
	requestId: string,
	fetchFn: typeof fetch = fetch
): Promise<{ success: boolean }> {
	const res = await fetchFn(`/api/governance/access-requests/${requestId}/cancel-escalation`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to cancel escalation: ${res.status}`);
	return res.json();
}

export async function resetEscalationClient(
	requestId: string,
	fetchFn: typeof fetch = fetch
): Promise<{ success: boolean }> {
	const res = await fetchFn(`/api/governance/access-requests/${requestId}/reset-escalation`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to reset escalation: ${res.status}`);
	return res.json();
}

// --- SoD Exemptions ---

export async function fetchSodExemptions(
	params: { status?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<SodExemptionListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/sod-exemptions${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch exemptions: ${res.status}`);
	return res.json();
}

export async function fetchSodExemption(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SodExemption> {
	const res = await fetchFn(`/api/governance/sod-exemptions/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch exemption: ${res.status}`);
	return res.json();
}

export async function createSodExemptionClient(
	data: CreateSodExemptionRequest,
	fetchFn: typeof fetch = fetch
): Promise<SodExemption> {
	const res = await fetchFn('/api/governance/sod-exemptions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create exemption: ${res.status}`);
	return res.json();
}

export async function revokeSodExemptionClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SodExemption> {
	const res = await fetchFn(`/api/governance/sod-exemptions/${id}/revoke`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to revoke exemption: ${res.status}`);
	return res.json();
}
