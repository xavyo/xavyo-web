import { apiClient } from './client';
import type {
	LifecycleConfig,
	LifecycleConfigDetail,
	LifecycleState,
	LifecycleTransition,
	TransitionCondition,
	UserLifecycleStatus,
	CreateLifecycleConfigRequest,
	UpdateLifecycleConfigRequest,
	CreateLifecycleStateRequest,
	UpdateLifecycleStateRequest,
	CreateLifecycleTransitionRequest,
	UpdateTransitionConditionsRequest,
	EvaluateConditionsRequest,
	EvaluateConditionsResponse,
	UpdateStateActionsRequest,
	StateActionsResponse,
	LifecycleConfigListResponse
} from './types';

// --- Lifecycle Configs ---

export async function listLifecycleConfigs(
	params: {
		object_type?: string;
		is_active?: boolean;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<LifecycleConfigListResponse> {
	const searchParams = new URLSearchParams();
	if (params.object_type) searchParams.set('object_type', params.object_type);
	if (params.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	return apiClient<LifecycleConfigListResponse>(
		`/governance/lifecycle/configs${qs ? `?${qs}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createLifecycleConfig(
	body: CreateLifecycleConfigRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<LifecycleConfig> {
	return apiClient<LifecycleConfig>(
		'/governance/lifecycle/configs',
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function getLifecycleConfig(
	configId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<LifecycleConfigDetail> {
	return apiClient<LifecycleConfigDetail>(
		`/governance/lifecycle/configs/${configId}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function updateLifecycleConfig(
	configId: string,
	body: UpdateLifecycleConfigRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<LifecycleConfig> {
	return apiClient<LifecycleConfig>(
		`/governance/lifecycle/configs/${configId}`,
		{ method: 'PATCH', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteLifecycleConfig(
	configId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/lifecycle/configs/${configId}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

// --- States ---

export async function createState(
	configId: string,
	body: CreateLifecycleStateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<LifecycleState> {
	return apiClient<LifecycleState>(
		`/governance/lifecycle/configs/${configId}/states`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function updateState(
	configId: string,
	stateId: string,
	body: UpdateLifecycleStateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<LifecycleState> {
	return apiClient<LifecycleState>(
		`/governance/lifecycle/configs/${configId}/states/${stateId}`,
		{ method: 'PATCH', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteState(
	configId: string,
	stateId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/lifecycle/configs/${configId}/states/${stateId}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

// --- Transitions ---

export async function createTransition(
	configId: string,
	body: CreateLifecycleTransitionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<LifecycleTransition> {
	return apiClient<LifecycleTransition>(
		`/governance/lifecycle/configs/${configId}/transitions`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

export async function deleteTransition(
	configId: string,
	transitionId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(
		`/governance/lifecycle/configs/${configId}/transitions/${transitionId}`,
		{ method: 'DELETE', token, tenantId, fetch: fetchFn }
	);
}

// --- Transition Conditions ---

export async function getTransitionConditions(
	configId: string,
	transitionId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<{ conditions: TransitionCondition[] }> {
	return apiClient<{ conditions: TransitionCondition[] }>(
		`/governance/lifecycle/configs/${configId}/transitions/${transitionId}/conditions`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function updateTransitionConditions(
	configId: string,
	transitionId: string,
	body: UpdateTransitionConditionsRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<{ conditions: TransitionCondition[] }> {
	return apiClient<{ conditions: TransitionCondition[] }>(
		`/governance/lifecycle/configs/${configId}/transitions/${transitionId}/conditions`,
		{ method: 'PUT', body, token, tenantId, fetch: fetchFn }
	);
}

export async function evaluateTransitionConditions(
	configId: string,
	transitionId: string,
	body: EvaluateConditionsRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<EvaluateConditionsResponse> {
	return apiClient<EvaluateConditionsResponse>(
		`/governance/lifecycle/configs/${configId}/transitions/${transitionId}/conditions/evaluate`,
		{ method: 'POST', body, token, tenantId, fetch: fetchFn }
	);
}

// --- State Actions ---

export async function getStateActions(
	configId: string,
	stateId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<StateActionsResponse> {
	return apiClient<StateActionsResponse>(
		`/governance/lifecycle/configs/${configId}/states/${stateId}/actions`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function updateStateActions(
	configId: string,
	stateId: string,
	body: UpdateStateActionsRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<StateActionsResponse> {
	return apiClient<StateActionsResponse>(
		`/governance/lifecycle/configs/${configId}/states/${stateId}/actions`,
		{ method: 'PUT', body, token, tenantId, fetch: fetchFn }
	);
}

// --- User Lifecycle Status ---

export async function getUserLifecycleStatus(
	userId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<UserLifecycleStatus> {
	return apiClient<UserLifecycleStatus>(
		`/governance/users/${userId}/lifecycle/status`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}
