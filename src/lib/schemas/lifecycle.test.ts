import { describe, it, expect } from 'vitest';
import {
	createLifecycleConfigSchema,
	updateLifecycleConfigSchema,
	createStateSchema,
	updateStateSchema,
	createTransitionSchema,
	updateConditionsSchema,
	evaluateConditionsSchema,
	updateActionsSchema
} from './lifecycle';

describe('createLifecycleConfigSchema', () => {
	it('accepts valid config', () => {
		const result = createLifecycleConfigSchema.safeParse({
			name: 'Employee Lifecycle',
			object_type: 'user'
		});
		expect(result.success).toBe(true);
	});

	it('accepts config with all fields', () => {
		const result = createLifecycleConfigSchema.safeParse({
			name: 'Role Lifecycle',
			object_type: 'role',
			description: 'Manages role states',
			auto_assign_initial_state: false
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createLifecycleConfigSchema.safeParse({
			name: '',
			object_type: 'user'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 100 chars', () => {
		const result = createLifecycleConfigSchema.safeParse({
			name: 'x'.repeat(101),
			object_type: 'user'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid object_type', () => {
		const result = createLifecycleConfigSchema.safeParse({
			name: 'Test',
			object_type: 'Invalid'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid object types', () => {
		for (const type of ['user', 'role', 'entitlement']) {
			const result = createLifecycleConfigSchema.safeParse({
				name: 'Test',
				object_type: type
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects missing name', () => {
		const result = createLifecycleConfigSchema.safeParse({
			object_type: 'user'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing object_type', () => {
		const result = createLifecycleConfigSchema.safeParse({
			name: 'Test'
		});
		expect(result.success).toBe(false);
	});
});

describe('updateLifecycleConfigSchema', () => {
	it('accepts partial update', () => {
		const result = updateLifecycleConfigSchema.safeParse({ name: 'New Name' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = updateLifecycleConfigSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts is_active update', () => {
		const result = updateLifecycleConfigSchema.safeParse({ is_active: false });
		expect(result.success).toBe(true);
	});

	it('accepts null description', () => {
		const result = updateLifecycleConfigSchema.safeParse({ description: null });
		expect(result.success).toBe(true);
	});
});

describe('createStateSchema', () => {
	it('accepts valid state', () => {
		const result = createStateSchema.safeParse({
			name: 'Onboarding',
			is_initial: true,
			is_terminal: false,
			entitlement_action: 'none',
			position: 1
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createStateSchema.safeParse({
			name: '',
			is_initial: false,
			is_terminal: false,
			entitlement_action: 'pause',
			position: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid entitlement_action', () => {
		const result = createStateSchema.safeParse({
			name: 'Test',
			is_initial: false,
			is_terminal: false,
			entitlement_action: 'invalid',
			position: 0
		});
		expect(result.success).toBe(false);
	});

	it('accepts all entitlement actions', () => {
		for (const action of ['none', 'pause', 'revoke']) {
			const result = createStateSchema.safeParse({
				name: 'Test',
				is_initial: false,
				is_terminal: false,
				entitlement_action: action,
				position: 0
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects negative position', () => {
		const result = createStateSchema.safeParse({
			name: 'Test',
			is_initial: false,
			is_terminal: false,
			entitlement_action: 'none',
			position: -1
		});
		expect(result.success).toBe(false);
	});
});

describe('updateStateSchema', () => {
	it('accepts partial update', () => {
		const result = updateStateSchema.safeParse({ name: 'New Name' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = updateStateSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts null description', () => {
		const result = updateStateSchema.safeParse({ description: null });
		expect(result.success).toBe(true);
	});
});

describe('createTransitionSchema', () => {
	it('accepts valid transition', () => {
		const result = createTransitionSchema.safeParse({
			name: 'Activate',
			from_state_id: '550e8400-e29b-41d4-a716-446655440001',
			to_state_id: '550e8400-e29b-41d4-a716-446655440002'
		});
		expect(result.success).toBe(true);
	});

	it('accepts transition with approval and grace period', () => {
		const result = createTransitionSchema.safeParse({
			name: 'Suspend',
			from_state_id: '550e8400-e29b-41d4-a716-446655440001',
			to_state_id: '550e8400-e29b-41d4-a716-446655440002',
			requires_approval: true,
			grace_period_hours: 24
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createTransitionSchema.safeParse({
			name: '',
			from_state_id: '550e8400-e29b-41d4-a716-446655440001',
			to_state_id: '550e8400-e29b-41d4-a716-446655440002'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid UUID for from_state_id', () => {
		const result = createTransitionSchema.safeParse({
			name: 'Test',
			from_state_id: 'not-a-uuid',
			to_state_id: '550e8400-e29b-41d4-a716-446655440002'
		});
		expect(result.success).toBe(false);
	});

	it('rejects zero grace_period_hours', () => {
		const result = createTransitionSchema.safeParse({
			name: 'Test',
			from_state_id: '550e8400-e29b-41d4-a716-446655440001',
			to_state_id: '550e8400-e29b-41d4-a716-446655440002',
			grace_period_hours: 0
		});
		expect(result.success).toBe(false);
	});
});

describe('updateConditionsSchema', () => {
	it('accepts valid conditions', () => {
		const result = updateConditionsSchema.safeParse({
			conditions: [{
				condition_type: 'attribute_check',
				attribute_path: 'user.department',
				expression: "equals 'Engineering'"
			}]
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty conditions array', () => {
		const result = updateConditionsSchema.safeParse({ conditions: [] });
		expect(result.success).toBe(true);
	});

	it('rejects condition with empty type', () => {
		const result = updateConditionsSchema.safeParse({
			conditions: [{
				condition_type: '',
				attribute_path: 'user.dept',
				expression: 'eq test'
			}]
		});
		expect(result.success).toBe(false);
	});

	it('rejects condition with empty attribute_path', () => {
		const result = updateConditionsSchema.safeParse({
			conditions: [{
				condition_type: 'check',
				attribute_path: '',
				expression: 'eq test'
			}]
		});
		expect(result.success).toBe(false);
	});

	it('rejects condition with empty expression', () => {
		const result = updateConditionsSchema.safeParse({
			conditions: [{
				condition_type: 'check',
				attribute_path: 'user.dept',
				expression: ''
			}]
		});
		expect(result.success).toBe(false);
	});
});

describe('evaluateConditionsSchema', () => {
	it('accepts valid context object', () => {
		const result = evaluateConditionsSchema.safeParse({
			context: { user: { department: 'Engineering' } }
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty context', () => {
		const result = evaluateConditionsSchema.safeParse({ context: {} });
		expect(result.success).toBe(true);
	});

	it('rejects missing context', () => {
		const result = evaluateConditionsSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('updateActionsSchema', () => {
	it('accepts valid entry actions', () => {
		const result = updateActionsSchema.safeParse({
			entry_actions: [{
				action_type: 'send_notification',
				parameters: { template: 'welcome', to: 'user.email' }
			}]
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid exit actions', () => {
		const result = updateActionsSchema.safeParse({
			exit_actions: [{
				action_type: 'trigger_provisioning',
				parameters: { action: 'deprovision' }
			}]
		});
		expect(result.success).toBe(true);
	});

	it('accepts both entry and exit actions', () => {
		const result = updateActionsSchema.safeParse({
			entry_actions: [{ action_type: 'notify', parameters: {} }],
			exit_actions: [{ action_type: 'cleanup', parameters: {} }]
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = updateActionsSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('rejects action with empty type', () => {
		const result = updateActionsSchema.safeParse({
			entry_actions: [{ action_type: '', parameters: {} }]
		});
		expect(result.success).toBe(false);
	});
});
