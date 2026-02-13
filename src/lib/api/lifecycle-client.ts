import type {
	LifecycleConfig,
	LifecycleConfigDetail,
	LifecycleState,
	LifecycleTransition,
	TransitionCondition,
	LifecycleStateAction,
	UserLifecycleStatus,
	LifecycleConfigListResponse,
	EvaluateConditionsResponse,
	StateActionsResponse
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

// --- Configs ---

export async function fetchLifecycleConfigs(
	params: { object_type?: string; is_active?: boolean; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<LifecycleConfigListResponse> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	const res = await fetchFn(`/api/governance/lifecycle/configs${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch lifecycle configs: ${res.status}`);
	return res.json();
}

export async function createLifecycleConfigClient(
	body: {
		name: string;
		description?: string;
		object_type: string;
		is_active?: boolean;
	},
	fetchFn: typeof fetch = fetch
): Promise<LifecycleConfig> {
	const res = await fetchFn('/api/governance/lifecycle/configs', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to create lifecycle config: ${res.status}`);
	return res.json();
}

export async function fetchLifecycleConfig(
	configId: string,
	fetchFn: typeof fetch = fetch
): Promise<LifecycleConfigDetail> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}`);
	if (!res.ok) throw new Error(`Failed to fetch lifecycle config: ${res.status}`);
	return res.json();
}

export async function updateLifecycleConfigClient(
	configId: string,
	body: {
		name?: string;
		description?: string;
		object_type?: string;
		is_active?: boolean;
	},
	fetchFn: typeof fetch = fetch
): Promise<LifecycleConfig> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update lifecycle config: ${res.status}`);
	return res.json();
}

export async function deleteLifecycleConfigClient(
	configId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete lifecycle config: ${res.status}`);
}

// --- States ---

export async function addState(
	configId: string,
	body: {
		name: string;
		description?: string;
		is_initial?: boolean;
		is_terminal?: boolean;
		entitlement_action?: string;
		position?: number;
		metadata?: Record<string, unknown>;
	},
	fetchFn: typeof fetch = fetch
): Promise<LifecycleState> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/states`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to add state: ${res.status}`);
	return res.json();
}

export async function updateStateClient(
	configId: string,
	stateId: string,
	body: {
		name?: string;
		description?: string;
		is_initial?: boolean;
		is_terminal?: boolean;
		entitlement_action?: string;
		position?: number;
		metadata?: Record<string, unknown>;
	},
	fetchFn: typeof fetch = fetch
): Promise<LifecycleState> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/states/${stateId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update state: ${res.status}`);
	return res.json();
}

export async function deleteStateClient(
	configId: string,
	stateId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/states/${stateId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete state: ${res.status}`);
}

// --- Transitions ---

export async function addTransition(
	configId: string,
	body: {
		name: string;
		description?: string;
		from_state_id: string;
		to_state_id: string;
		requires_approval?: boolean;
		grace_period_hours?: number;
		metadata?: Record<string, unknown>;
	},
	fetchFn: typeof fetch = fetch
): Promise<LifecycleTransition> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/transitions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to add transition: ${res.status}`);
	return res.json();
}

export async function deleteTransitionClient(
	configId: string,
	transitionId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/transitions/${transitionId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete transition: ${res.status}`);
}

// --- Transition Conditions ---

export async function fetchConditions(
	configId: string,
	transitionId: string,
	fetchFn: typeof fetch = fetch
): Promise<TransitionCondition[]> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/transitions/${transitionId}/conditions`);
	if (!res.ok) throw new Error(`Failed to fetch conditions: ${res.status}`);
	const data = await res.json();
	return data.conditions ?? data;
}

export async function saveConditions(
	configId: string,
	transitionId: string,
	body: { conditions: TransitionCondition[] },
	fetchFn: typeof fetch = fetch
): Promise<TransitionCondition[]> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/transitions/${transitionId}/conditions`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to save conditions: ${res.status}`);
	const data = await res.json();
	return data.conditions ?? data;
}

export async function evaluateConditions(
	configId: string,
	transitionId: string,
	context: Record<string, unknown>,
	fetchFn: typeof fetch = fetch
): Promise<EvaluateConditionsResponse> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/transitions/${transitionId}/conditions/evaluate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(context)
	});
	if (!res.ok) throw new Error(`Failed to evaluate conditions: ${res.status}`);
	return res.json();
}

// --- State Actions ---

export async function fetchStateActions(
	configId: string,
	stateId: string,
	fetchFn: typeof fetch = fetch
): Promise<StateActionsResponse> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/states/${stateId}/actions`);
	if (!res.ok) throw new Error(`Failed to fetch state actions: ${res.status}`);
	return res.json();
}

export async function saveStateActions(
	configId: string,
	stateId: string,
	body: { entry_actions?: LifecycleStateAction[]; exit_actions?: LifecycleStateAction[] },
	fetchFn: typeof fetch = fetch
): Promise<StateActionsResponse> {
	const res = await fetchFn(`/api/governance/lifecycle/configs/${configId}/states/${stateId}/actions`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to save state actions: ${res.status}`);
	return res.json();
}

// --- User Lifecycle Status ---

export async function fetchUserLifecycleStatus(
	userId: string,
	fetchFn: typeof fetch = fetch
): Promise<UserLifecycleStatus> {
	const res = await fetchFn(`/api/governance/lifecycle/user-status/${userId}`);
	if (!res.ok) throw new Error(`Failed to fetch user lifecycle status: ${res.status}`);
	return res.json();
}
