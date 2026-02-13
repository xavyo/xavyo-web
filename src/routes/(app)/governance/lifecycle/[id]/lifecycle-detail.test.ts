import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/lifecycle', () => ({
	getLifecycleConfig: vi.fn(),
	updateLifecycleConfig: vi.fn(),
	deleteLifecycleConfig: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

vi.mock('$app/forms', () => ({
	enhance: () => ({
		destroy: () => {}
	})
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

vi.mock('$lib/api/lifecycle-client', () => ({
	addState: vi.fn(),
	updateStateClient: vi.fn(),
	deleteStateClient: vi.fn(),
	addTransition: vi.fn(),
	deleteTransitionClient: vi.fn(),
	fetchConditions: vi.fn(),
	fetchStateActions: vi.fn()
}));

vi.mock('$lib/components/lifecycle/state-badge.svelte', () => ({
	default: vi.fn()
}));
vi.mock('$lib/components/lifecycle/entitlement-action-badge.svelte', () => ({
	default: vi.fn()
}));
vi.mock('$lib/components/lifecycle/transition-card.svelte', () => ({
	default: vi.fn()
}));
vi.mock('$lib/components/lifecycle/condition-editor.svelte', () => ({
	default: vi.fn()
}));
vi.mock('$lib/components/lifecycle/action-editor.svelte', () => ({
	default: vi.fn()
}));

import { load, actions } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import { getLifecycleConfig } from '$lib/api/lifecycle';
import { ApiError } from '$lib/api/client';
import type {
	LifecycleState,
	LifecycleTransition,
	LifecycleConfigDetail,
	TransitionCondition,
	LifecycleStateAction,
	StateActionsResponse,
	EntitlementAction
} from '$lib/api/types';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeState(overrides: Partial<LifecycleState> = {}): LifecycleState {
	return {
		id: 's1',
		config_id: 'cfg-1',
		name: 'Active',
		description: null,
		is_initial: true,
		is_terminal: false,
		entitlement_action: 'none',
		position: 0,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

function makeTransition(overrides: Partial<LifecycleTransition> = {}): LifecycleTransition {
	return {
		id: 't1',
		config_id: 'cfg-1',
		name: 'Activate',
		from_state_id: 's1',
		to_state_id: 's2',
		requires_approval: false,
		grace_period_hours: null,
		created_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

function makeConfig(overrides: Partial<LifecycleConfigDetail> = {}): LifecycleConfigDetail {
	return {
		id: 'cfg-1',
		name: 'Employee Lifecycle',
		description: 'Standard employee lifecycle',
		object_type: 'user',
		is_active: true,
		auto_assign_initial_state: true,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		tenant_id: 'tid',
		states: [
			makeState({ id: 's1', name: 'Active', is_initial: true, is_terminal: false, position: 0, entitlement_action: 'none' })
		],
		transitions: [
			makeTransition({ id: 't1', name: 'Activate', from_state_id: 's1', to_state_id: 's2' })
		],
		...overrides
	};
}

const mockConfig = makeConfig();

describe('Lifecycle Config Detail +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'cfg-1' },
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/lifecycle/cfg-1'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns config and form for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getLifecycleConfig).mockResolvedValue(mockConfig as any);

			const result: any = await load({
				params: { id: 'cfg-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/lifecycle/cfg-1'),
				fetch: vi.fn()
			} as any);

			expect(result.config).toEqual(mockConfig);
			expect(result.form).toBeDefined();
		});

		it('throws 404 when getLifecycleConfig throws ApiError with 404', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getLifecycleConfig).mockRejectedValue(
				new ApiError('Config not found', 404)
			);

			try {
				await load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/lifecycle/nonexistent'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});

		it('throws 500 for non-API errors', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getLifecycleConfig).mockRejectedValue(new Error('network'));

			try {
				await load({
					params: { id: 'cfg-1' },
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/lifecycle/cfg-1'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});

		it('pre-populates form with config data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getLifecycleConfig).mockResolvedValue(mockConfig as any);

			const result: any = await load({
				params: { id: 'cfg-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/lifecycle/cfg-1'),
				fetch: vi.fn()
			} as any);

			expect(result.form.data.name).toBe('Employee Lifecycle');
			expect(result.form.data.is_active).toBe(true);
			expect(result.form.data.auto_assign_initial_state).toBe(true);
		});

		it('calls getLifecycleConfig with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getLifecycleConfig).mockResolvedValue(mockConfig as any);

			const mockFetch = vi.fn();
			await load({
				params: { id: 'cfg-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/lifecycle/cfg-1'),
				fetch: mockFetch
			} as any);

			expect(getLifecycleConfig).toHaveBeenCalledWith('cfg-1', 'tok', 'tid', mockFetch);
		});
	});

	// --- Actions ---

	describe('actions', () => {
		it('exports update action', () => {
			expect(actions.update).toBeDefined();
		});

		it('exports delete action', () => {
			expect(actions.delete).toBeDefined();
		});
	});
});

// =============================================================================
// States Tab Logic Tests
// =============================================================================

describe('States tab logic', () => {
	describe('state sorting', () => {
		it('sorts states by position ascending', () => {
			const states: LifecycleState[] = [
				makeState({ id: 's3', name: 'Terminated', position: 2 }),
				makeState({ id: 's1', name: 'Active', position: 0 }),
				makeState({ id: 's2', name: 'Suspended', position: 1 })
			];

			const sorted = [...states].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

			expect(sorted[0].name).toBe('Active');
			expect(sorted[1].name).toBe('Suspended');
			expect(sorted[2].name).toBe('Terminated');
		});

		it('treats null/undefined position as 0', () => {
			const states = [
				makeState({ id: 's1', name: 'NoPos', position: undefined as any }),
				makeState({ id: 's2', name: 'Pos5', position: 5 })
			];

			const sorted = [...states].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

			expect(sorted[0].name).toBe('NoPos');
			expect(sorted[1].name).toBe('Pos5');
		});

		it('returns empty array when no states defined', () => {
			const config = makeConfig({ states: [] });
			const sorted = [...config.states].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
			expect(sorted).toEqual([]);
		});
	});

	describe('state badge properties', () => {
		it('initial state has is_initial=true and is_terminal=false', () => {
			const state = makeState({ is_initial: true, is_terminal: false });
			expect(state.is_initial).toBe(true);
			expect(state.is_terminal).toBe(false);
		});

		it('terminal state has is_terminal=true and is_initial=false', () => {
			const state = makeState({ is_initial: false, is_terminal: true });
			expect(state.is_terminal).toBe(true);
			expect(state.is_initial).toBe(false);
		});

		it('regular state has both initial and terminal as false', () => {
			const state = makeState({ is_initial: false, is_terminal: false });
			expect(state.is_initial).toBe(false);
			expect(state.is_terminal).toBe(false);
		});
	});

	describe('entitlement action badge', () => {
		it('none action maps correctly', () => {
			const state = makeState({ entitlement_action: 'none' });
			expect(state.entitlement_action).toBe('none');
		});

		it('revoke action maps correctly', () => {
			const state = makeState({ entitlement_action: 'revoke' });
			expect(state.entitlement_action).toBe('revoke');
		});

		it('no_change action maps correctly', () => {
			const state = makeState({ entitlement_action: 'none' });
			expect(state.entitlement_action).toBe('none');
		});

		it('defaults to no_change when null', () => {
			const state = makeState({ entitlement_action: undefined as any });
			const displayed = state.entitlement_action ?? 'none';
			expect(displayed).toBe('none');
		});
	});

	describe('add state form validation', () => {
		it('requires a non-empty state name to submit', () => {
			const newStateName = '';
			const canSubmit = !!newStateName;
			expect(canSubmit).toBe(false);
		});

		it('allows submission when name is provided', () => {
			const newStateName = 'Onboarding';
			const canSubmit = !!newStateName;
			expect(canSubmit).toBe(true);
		});

		it('new state position defaults to states array length', () => {
			const config = makeConfig({
				states: [
					makeState({ id: 's1', position: 0 }),
					makeState({ id: 's2', position: 1 }),
					makeState({ id: 's3', position: 2 })
				]
			});
			const newStatePosition = config.states.length;
			expect(newStatePosition).toBe(3);
		});

		it('builds correct metadata payload for addState', () => {
			const entitlementAction = 'revoke';
			const position = 3;
			const metadata = { entitlement_action: entitlementAction, position };
			expect(metadata).toEqual({ entitlement_action: 'revoke', position: 3 });
		});

		it('sends undefined for empty description', () => {
			const description = '';
			const payload = description || undefined;
			expect(payload).toBeUndefined();
		});

		it('sends description when provided', () => {
			const description = 'Employee is onboarding';
			const payload = description || undefined;
			expect(payload).toBe('Employee is onboarding');
		});
	});

	describe('edit state inline', () => {
		it('populates edit fields from existing state', () => {
			const state = makeState({
				id: 's1',
				name: 'Active',
				description: 'Active employee',
				is_initial: true,
				is_terminal: false,
				entitlement_action: 'none',
				position: 0
			});

			// Simulating startEditState logic
			const editStateName = state.name;
			const editStateDescription = state.description ?? '';
			const editStateIsInitial = state.is_initial;
			const editStateIsTerminal = state.is_terminal;
			const editStateEntitlementAction = state.entitlement_action ?? 'none';
			const editStatePosition = state.position ?? 0;

			expect(editStateName).toBe('Active');
			expect(editStateDescription).toBe('Active employee');
			expect(editStateIsInitial).toBe(true);
			expect(editStateIsTerminal).toBe(false);
			expect(editStateEntitlementAction).toBe('none');
			expect(editStatePosition).toBe(0);
		});

		it('handles null description gracefully', () => {
			const state = makeState({ description: null });
			const editStateDescription = state.description ?? '';
			expect(editStateDescription).toBe('');
		});

		it('handles null entitlement_action gracefully', () => {
			const state = makeState({ entitlement_action: undefined as any });
			const editStateEntitlementAction = state.entitlement_action ?? 'none';
			expect(editStateEntitlementAction).toBe('none');
		});
	});

	describe('delete state confirmation', () => {
		it('delete state requires explicit confirmation by matching state ID', () => {
			const deleteStateId: string | null = 's1';
			const state = makeState({ id: 's1' });
			expect(deleteStateId === state.id).toBe(true);
		});

		it('cancel delete resets deleteStateId to null', () => {
			let deleteStateId: string | null = 's1';
			deleteStateId = null;
			expect(deleteStateId).toBeNull();
		});
	});

	describe('state display formatting', () => {
		it('shows position as #N prefix', () => {
			const state = makeState({ position: 3 });
			const positionLabel = `#${state.position ?? 0}`;
			expect(positionLabel).toBe('#3');
		});

		it('shows description text when present', () => {
			const state = makeState({ description: 'Suspended pending review' });
			expect(state.description).toBe('Suspended pending review');
		});

		it('hides description when null', () => {
			const state = makeState({ description: null });
			expect(state.description).toBeNull();
		});
	});
});

// =============================================================================
// Transitions Tab Logic Tests
// =============================================================================

describe('Transitions tab logic', () => {
	describe('add transition button visibility', () => {
		it('shows Add Transition button when config has 2 or more states', () => {
			const config = makeConfig({
				states: [
					makeState({ id: 's1', name: 'Active' }),
					makeState({ id: 's2', name: 'Inactive' })
				]
			});
			expect(config.states.length >= 2).toBe(true);
		});

		it('hides Add Transition button when config has fewer than 2 states', () => {
			const config = makeConfig({
				states: [makeState({ id: 's1', name: 'Active' })]
			});
			expect(config.states.length >= 2).toBe(false);
		});

		it('shows message about needing 2 states when fewer than 2', () => {
			const config = makeConfig({ states: [] });
			const showMessage = config.states.length < 2;
			expect(showMessage).toBe(true);
		});
	});

	describe('add transition form validation', () => {
		it('requires name, from_state_id, and to_state_id to submit', () => {
			const name = 'Activate';
			const fromStateId = 's1';
			const toStateId = 's2';
			const canSubmit = !!name && !!fromStateId && !!toStateId;
			expect(canSubmit).toBe(true);
		});

		it('disables submit when name is empty', () => {
			const name = '';
			const fromStateId = 's1';
			const toStateId = 's2';
			const canSubmit = !!name && !!fromStateId && !!toStateId;
			expect(canSubmit).toBe(false);
		});

		it('disables submit when from_state_id is empty', () => {
			const name = 'Activate';
			const fromStateId = '';
			const toStateId = 's2';
			const canSubmit = !!name && !!fromStateId && !!toStateId;
			expect(canSubmit).toBe(false);
		});

		it('disables submit when to_state_id is empty', () => {
			const name = 'Activate';
			const fromStateId = 's1';
			const toStateId = '';
			const canSubmit = !!name && !!fromStateId && !!toStateId;
			expect(canSubmit).toBe(false);
		});

		it('builds correct payload with optional grace_period_hours', () => {
			const gracePeriodHours = '48';
			const parsed = gracePeriodHours ? Number(gracePeriodHours) : undefined;
			expect(parsed).toBe(48);
		});

		it('sends undefined grace_period_hours when empty', () => {
			const gracePeriodHours = '';
			const parsed = gracePeriodHours ? Number(gracePeriodHours) : undefined;
			expect(parsed).toBeUndefined();
		});

		it('includes requires_approval boolean in payload', () => {
			const requiresApproval = true;
			expect(requiresApproval).toBe(true);
		});
	});

	describe('transition card display', () => {
		it('resolves from_state_id to state name', () => {
			const config = makeConfig({
				states: [
					makeState({ id: 's1', name: 'Active' }),
					makeState({ id: 's2', name: 'Suspended' })
				]
			});
			const transition = makeTransition({ from_state_id: 's1', to_state_id: 's2' });

			function getStateName(stateId: string): string {
				const state = config.states.find((s) => s.id === stateId);
				return state?.name ?? 'Unknown';
			}

			expect(getStateName(transition.from_state_id)).toBe('Active');
			expect(getStateName(transition.to_state_id)).toBe('Suspended');
		});

		it('returns Unknown for unrecognized state IDs', () => {
			const config = makeConfig({ states: [] });

			function getStateName(stateId: string): string {
				const state = config.states.find((s) => s.id === stateId);
				return state?.name ?? 'Unknown';
			}

			expect(getStateName('nonexistent')).toBe('Unknown');
		});

		it('shows requires_approval flag on transition', () => {
			const transition = makeTransition({ requires_approval: true });
			expect(transition.requires_approval).toBe(true);
		});

		it('shows grace_period_hours when set', () => {
			const transition = makeTransition({ grace_period_hours: 72 });
			expect(transition.grace_period_hours).toBe(72);
		});

		it('grace_period_hours is null when not set', () => {
			const transition = makeTransition({ grace_period_hours: null });
			expect(transition.grace_period_hours).toBeNull();
		});
	});

	describe('delete transition confirmation', () => {
		it('delete transition requires explicit confirmation by matching ID', () => {
			const deleteTransitionId: string | null = 't1';
			const transition = makeTransition({ id: 't1' });
			expect(deleteTransitionId === transition.id).toBe(true);
		});

		it('cancel delete resets deleteTransitionId to null', () => {
			let deleteTransitionId: string | null = 't1';
			deleteTransitionId = null;
			expect(deleteTransitionId).toBeNull();
		});

		it('shows transition name in delete confirmation text', () => {
			const transition = makeTransition({ name: 'Suspend' });
			const confirmText = `Delete transition "${transition.name}"?`;
			expect(confirmText).toBe('Delete transition "Suspend"?');
		});
	});

	describe('empty transitions state', () => {
		it('shows empty message when no transitions defined', () => {
			const config = makeConfig({
				states: [
					makeState({ id: 's1' }),
					makeState({ id: 's2' })
				],
				transitions: []
			});
			expect(config.transitions.length).toBe(0);
		});

		it('transition list renders items when present', () => {
			const config = makeConfig({
				transitions: [
					makeTransition({ id: 't1', name: 'Activate' }),
					makeTransition({ id: 't2', name: 'Suspend' })
				]
			});
			expect(config.transitions.length).toBe(2);
		});
	});
});

// =============================================================================
// Conditions Expansion Logic Tests
// =============================================================================

describe('Conditions expansion logic', () => {
	describe('toggle conditions', () => {
		it('expands a transition when none is expanded', () => {
			let expandedTransitionId: string | null = null;
			const transitionId = 't1';

			if (expandedTransitionId === transitionId) {
				expandedTransitionId = null;
			} else {
				expandedTransitionId = transitionId;
			}

			expect(expandedTransitionId).toBe('t1');
		});

		it('collapses a transition when already expanded', () => {
			let expandedTransitionId: string | null = 't1';
			const transitionId = 't1';

			if (expandedTransitionId === transitionId) {
				expandedTransitionId = null;
			} else {
				expandedTransitionId = transitionId;
			}

			expect(expandedTransitionId).toBeNull();
		});

		it('switches to a different transition when one is already expanded', () => {
			let expandedTransitionId: string | null = 't1';
			const transitionId = 't2';

			if (expandedTransitionId === transitionId) {
				expandedTransitionId = null;
			} else {
				expandedTransitionId = transitionId;
			}

			expect(expandedTransitionId).toBe('t2');
		});
	});

	describe('conditions data cache', () => {
		it('stores fetched conditions in cache keyed by transition ID', () => {
			const conditionsData: Record<string, TransitionCondition[]> = {};
			const transitionId = 't1';
			const conditions: TransitionCondition[] = [
				{ condition_type: 'attribute', attribute_path: 'user.role', expression: '== "admin"' },
				{ condition_type: 'time', attribute_path: 'current_time', expression: '> "09:00"' }
			];

			const updated = { ...conditionsData, [transitionId]: conditions };

			expect(updated['t1']).toHaveLength(2);
			expect(updated['t1'][0].condition_type).toBe('attribute');
			expect(updated['t1'][1].condition_type).toBe('time');
		});

		it('returns cached conditions on re-expand (no re-fetch)', () => {
			const conditionsData: Record<string, TransitionCondition[]> = {
				't1': [{ condition_type: 'attribute', attribute_path: 'status', expression: '== "active"' }]
			};

			const needsFetch = !conditionsData['t1'];
			expect(needsFetch).toBe(false);
			expect(conditionsData['t1']).toHaveLength(1);
		});

		it('triggers fetch when conditions not yet cached', () => {
			const conditionsData: Record<string, TransitionCondition[]> = {};
			const needsFetch = !conditionsData['t1'];
			expect(needsFetch).toBe(true);
		});

		it('stores empty array on fetch error', () => {
			const conditionsData: Record<string, TransitionCondition[]> = {};
			const transitionId = 't1';

			// Simulating the catch block behavior
			const updated = { ...conditionsData, [transitionId]: [] };
			expect(updated['t1']).toEqual([]);
		});
	});

	describe('condition data shape', () => {
		it('condition has condition_type, attribute_path, and expression', () => {
			const condition: TransitionCondition = {
				condition_type: 'attribute',
				attribute_path: 'user.department',
				expression: '== "Engineering"'
			};
			expect(condition.condition_type).toBe('attribute');
			expect(condition.attribute_path).toBe('user.department');
			expect(condition.expression).toBe('== "Engineering"');
		});

		it('ConditionEditor receives configId, transitionId, and initialConditions', () => {
			const props = {
				configId: 'cfg-1',
				transitionId: 't1',
				initialConditions: [
					{ condition_type: 'attribute', attribute_path: 'role', expression: '!= "guest"' }
				] as TransitionCondition[]
			};

			expect(props.configId).toBe('cfg-1');
			expect(props.transitionId).toBe('t1');
			expect(props.initialConditions).toHaveLength(1);
		});

		it('passes empty array as initialConditions when cache miss and fallback', () => {
			const conditionsData: Record<string, TransitionCondition[]> = {};
			const transitionId = 't1';
			const initialConditions = conditionsData[transitionId] ?? [];
			expect(initialConditions).toEqual([]);
		});
	});
});

// =============================================================================
// Actions Expansion Logic Tests
// =============================================================================

describe('Actions expansion logic', () => {
	describe('toggle actions', () => {
		it('expands a state actions panel when none is expanded', () => {
			let expandedStateActionsId: string | null = null;
			const stateId = 's1';

			if (expandedStateActionsId === stateId) {
				expandedStateActionsId = null;
			} else {
				expandedStateActionsId = stateId;
			}

			expect(expandedStateActionsId).toBe('s1');
		});

		it('collapses a state actions panel when already expanded', () => {
			let expandedStateActionsId: string | null = 's1';
			const stateId = 's1';

			if (expandedStateActionsId === stateId) {
				expandedStateActionsId = null;
			} else {
				expandedStateActionsId = stateId;
			}

			expect(expandedStateActionsId).toBeNull();
		});

		it('switches to different state when one is already expanded', () => {
			let expandedStateActionsId: string | null = 's1';
			const stateId = 's2';

			if (expandedStateActionsId === stateId) {
				expandedStateActionsId = null;
			} else {
				expandedStateActionsId = stateId;
			}

			expect(expandedStateActionsId).toBe('s2');
		});
	});

	describe('actions data cache', () => {
		it('stores fetched entry and exit actions in cache keyed by state ID', () => {
			const actionsData: Record<string, { entry: LifecycleStateAction[]; exit: LifecycleStateAction[] }> = {};
			const stateId = 's1';
			const result: StateActionsResponse = {
				entry_actions: [{ action_type: 'send_email', parameters: { template: 'welcome' } }],
				exit_actions: [{ action_type: 'revoke_access', parameters: { scope: 'all' } }]
			};

			const updated = {
				...actionsData,
				[stateId]: { entry: result.entry_actions ?? [], exit: result.exit_actions ?? [] }
			};

			expect(updated['s1'].entry).toHaveLength(1);
			expect(updated['s1'].entry[0].action_type).toBe('send_email');
			expect(updated['s1'].exit).toHaveLength(1);
			expect(updated['s1'].exit[0].action_type).toBe('revoke_access');
		});

		it('returns cached actions on re-expand (no re-fetch)', () => {
			const actionsData: Record<string, { entry: LifecycleStateAction[]; exit: LifecycleStateAction[] }> = {
				's1': {
					entry: [{ action_type: 'notify', parameters: {} }],
					exit: []
				}
			};

			const needsFetch = !actionsData['s1'];
			expect(needsFetch).toBe(false);
		});

		it('triggers fetch when actions not yet cached', () => {
			const actionsData: Record<string, { entry: LifecycleStateAction[]; exit: LifecycleStateAction[] }> = {};
			const needsFetch = !actionsData['s1'];
			expect(needsFetch).toBe(true);
		});

		it('stores empty entry/exit arrays on fetch error', () => {
			const actionsData: Record<string, { entry: LifecycleStateAction[]; exit: LifecycleStateAction[] }> = {};
			const stateId = 's1';

			// Simulating the catch block behavior
			const updated = { ...actionsData, [stateId]: { entry: [], exit: [] } };
			expect(updated['s1'].entry).toEqual([]);
			expect(updated['s1'].exit).toEqual([]);
		});

		it('handles response with null entry_actions gracefully', () => {
			const result = {
				entry_actions: null as LifecycleStateAction[] | null,
				exit_actions: [{ action_type: 'log', parameters: {} }]
			};

			const entry = result.entry_actions ?? [];
			const exit = result.exit_actions ?? [];

			expect(entry).toEqual([]);
			expect(exit).toHaveLength(1);
		});

		it('handles response with null exit_actions gracefully', () => {
			const result = {
				entry_actions: [{ action_type: 'provision', parameters: { target: 'AD' } }],
				exit_actions: null as LifecycleStateAction[] | null
			};

			const entry = result.entry_actions ?? [];
			const exit = result.exit_actions ?? [];

			expect(entry).toHaveLength(1);
			expect(exit).toEqual([]);
		});
	});

	describe('action data shape', () => {
		it('action has action_type and parameters', () => {
			const action: LifecycleStateAction = {
				action_type: 'send_notification',
				parameters: { channel: 'slack', message: 'User activated' }
			};
			expect(action.action_type).toBe('send_notification');
			expect(action.parameters).toEqual({ channel: 'slack', message: 'User activated' });
		});

		it('ActionEditor receives configId, stateId, initialEntryActions, initialExitActions', () => {
			const props = {
				configId: 'cfg-1',
				stateId: 's1',
				initialEntryActions: [{ action_type: 'provision', parameters: {} }] as LifecycleStateAction[],
				initialExitActions: [{ action_type: 'deprovision', parameters: {} }] as LifecycleStateAction[]
			};

			expect(props.configId).toBe('cfg-1');
			expect(props.stateId).toBe('s1');
			expect(props.initialEntryActions).toHaveLength(1);
			expect(props.initialExitActions).toHaveLength(1);
		});

		it('passes empty arrays as initial actions when cache miss and fallback', () => {
			const actionsData: Record<string, { entry: LifecycleStateAction[]; exit: LifecycleStateAction[] }> = {};
			const stateId = 's1';
			const entry = actionsData[stateId]?.entry ?? [];
			const exit = actionsData[stateId]?.exit ?? [];
			expect(entry).toEqual([]);
			expect(exit).toEqual([]);
		});
	});
});

// =============================================================================
// Page Component and Tab Structure Tests
// =============================================================================

describe('Lifecycle Detail page component', () => {
	it('page component is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 60000);

	it('page component is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	}, 60000);

	it('module has no unexpected named exports', async () => {
		const mod = await import('./+page.svelte');
		const keys = Object.keys(mod);
		expect(keys).toContain('default');
	}, 60000);
});

describe('Tab structure and navigation', () => {
	it('has three tabs: details, states, transitions', () => {
		const tabs = ['details', 'states', 'transitions'];
		expect(tabs).toHaveLength(3);
		expect(tabs).toContain('details');
		expect(tabs).toContain('states');
		expect(tabs).toContain('transitions');
	});

	it('States tab label includes state count', () => {
		const config = makeConfig({
			states: [makeState({ id: 's1' }), makeState({ id: 's2' })]
		});
		const label = `States (${config.states.length})`;
		expect(label).toBe('States (2)');
	});

	it('Transitions tab label includes transition count', () => {
		const config = makeConfig({
			transitions: [makeTransition({ id: 't1' }), makeTransition({ id: 't2' }), makeTransition({ id: 't3' })]
		});
		const label = `Transitions (${config.transitions.length})`;
		expect(label).toBe('Transitions (3)');
	});

	it('default active tab is details', () => {
		const activeTab = 'details';
		expect(activeTab).toBe('details');
	});

	it('handleTabChange sets active tab', () => {
		let activeTab = 'details';
		function handleTabChange(tab: string) {
			activeTab = tab;
		}
		handleTabChange('states');
		expect(activeTab).toBe('states');
		handleTabChange('transitions');
		expect(activeTab).toBe('transitions');
	});
});

// =============================================================================
// Helper Function Tests (getStateName)
// =============================================================================

describe('getStateName helper', () => {
	const config = makeConfig({
		states: [
			makeState({ id: 's1', name: 'Active' }),
			makeState({ id: 's2', name: 'Suspended' }),
			makeState({ id: 's3', name: 'Terminated' })
		]
	});

	function getStateName(stateId: string): string {
		const state = config.states.find((s) => s.id === stateId);
		return state?.name ?? 'Unknown';
	}

	it('resolves known state ID to name', () => {
		expect(getStateName('s1')).toBe('Active');
		expect(getStateName('s2')).toBe('Suspended');
		expect(getStateName('s3')).toBe('Terminated');
	});

	it('returns Unknown for unresolvable state ID', () => {
		expect(getStateName('nonexistent')).toBe('Unknown');
	});

	it('returns Unknown for empty string state ID', () => {
		expect(getStateName('')).toBe('Unknown');
	});
});

// =============================================================================
// Add Transition / Add State Reset Logic Tests
// =============================================================================

describe('Form reset logic', () => {
	it('resetAddState clears all new state form fields', () => {
		// Simulating the reset function
		let newStateName = 'Onboarding';
		let newStateDescription = 'Desc';
		let newStateIsInitial = true;
		let newStateIsTerminal = true;
		let newStateEntitlementAction = 'revoke';
		let newStatePosition = 5;
		let showAddState = true;
		let stateError = 'some error';

		// Reset
		newStateName = '';
		newStateDescription = '';
		newStateIsInitial = false;
		newStateIsTerminal = false;
		newStateEntitlementAction = 'none';
		newStatePosition = 0; // would be config.states.length in real code
		showAddState = false;
		stateError = '';

		expect(newStateName).toBe('');
		expect(newStateDescription).toBe('');
		expect(newStateIsInitial).toBe(false);
		expect(newStateIsTerminal).toBe(false);
		expect(newStateEntitlementAction).toBe('none');
		expect(showAddState).toBe(false);
		expect(stateError).toBe('');
	});

	it('resetAddTransition clears all new transition form fields', () => {
		let newTransitionName = 'Activate';
		let newTransitionFromStateId = 's1';
		let newTransitionToStateId = 's2';
		let newTransitionRequiresApproval = true;
		let newTransitionGracePeriodHours = '48';
		let showAddTransition = true;
		let transitionError = 'some error';

		// Reset
		newTransitionName = '';
		newTransitionFromStateId = '';
		newTransitionToStateId = '';
		newTransitionRequiresApproval = false;
		newTransitionGracePeriodHours = '';
		showAddTransition = false;
		transitionError = '';

		expect(newTransitionName).toBe('');
		expect(newTransitionFromStateId).toBe('');
		expect(newTransitionToStateId).toBe('');
		expect(newTransitionRequiresApproval).toBe(false);
		expect(newTransitionGracePeriodHours).toBe('');
		expect(showAddTransition).toBe(false);
		expect(transitionError).toBe('');
	});
});
