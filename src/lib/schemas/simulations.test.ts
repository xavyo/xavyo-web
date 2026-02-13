import { describe, it, expect } from 'vitest';
import {
	createPolicySimulationSchema,
	createBatchSimulationSchema,
	applyBatchSchema,
	updateNotesSchema,
	createComparisonSchema
} from './simulations';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validUuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('createPolicySimulationSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'SoD Rule Test',
			simulation_type: 'sod_rule',
			policy_id: validUuid,
			policy_config: '{"rule_id": "r1"}'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('SoD Rule Test');
			expect(result.data.simulation_type).toBe('sod_rule');
			expect(result.data.policy_id).toBe(validUuid);
			expect(result.data.policy_config).toBe('{"rule_id": "r1"}');
		}
	});

	it('rejects missing name', () => {
		const result = createPolicySimulationSchema.safeParse({
			simulation_type: 'sod_rule',
			policy_config: '{"rule_id": "r1"}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: '',
			simulation_type: 'sod_rule',
			policy_config: '{"rule_id": "r1"}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 200 chars', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'x'.repeat(201),
			simulation_type: 'sod_rule',
			policy_config: '{"rule_id": "r1"}'
		});
		expect(result.success).toBe(false);
	});

	it('accepts name exactly 200 chars', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'x'.repeat(200),
			simulation_type: 'sod_rule',
			policy_config: '{"rule_id": "r1"}'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid simulation_type', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'Test',
			simulation_type: 'invalid_type',
			policy_config: '{"rule_id": "r1"}'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid simulation_type values', () => {
		for (const simType of ['sod_rule', 'birthright_policy']) {
			const result = createPolicySimulationSchema.safeParse({
				name: 'Test',
				simulation_type: simType,
				policy_config: '{"rule_id": "r1"}'
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts valid input with policy_id null', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'Test No Policy',
			simulation_type: 'birthright_policy',
			policy_id: null,
			policy_config: '{"some": "config"}'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.policy_id).toBeNull();
		}
	});

	it('accepts valid input with policy_id omitted', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'Test No Policy',
			simulation_type: 'sod_rule',
			policy_config: '{"some": "config"}'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.policy_id).toBeUndefined();
		}
	});

	it('rejects invalid policy_id (not a UUID)', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'Test',
			simulation_type: 'sod_rule',
			policy_id: 'not-a-uuid',
			policy_config: '{"rule_id": "r1"}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty policy_config', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'Test',
			simulation_type: 'sod_rule',
			policy_config: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing policy_config', () => {
		const result = createPolicySimulationSchema.safeParse({
			name: 'Test',
			simulation_type: 'sod_rule'
		});
		expect(result.success).toBe(false);
	});
});

describe('createBatchSimulationSchema', () => {
	it('accepts valid input with user_list mode', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'Batch Add Roles',
			batch_type: 'role_add',
			selection_mode: 'user_list',
			user_ids: `${validUuid}\n${validUuid2}`,
			change_role_id: validUuid
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Batch Add Roles');
			expect(result.data.batch_type).toBe('role_add');
			expect(result.data.selection_mode).toBe('user_list');
		}
	});

	it('accepts valid input with filter mode', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'Batch Remove Entitlements',
			batch_type: 'entitlement_remove',
			selection_mode: 'filter',
			filter_department: 'Engineering',
			filter_status: 'active',
			change_entitlement_id: validUuid
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.selection_mode).toBe('filter');
			expect(result.data.filter_department).toBe('Engineering');
		}
	});

	it('rejects missing name', () => {
		const result = createBatchSimulationSchema.safeParse({
			batch_type: 'role_add',
			selection_mode: 'user_list'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: '',
			batch_type: 'role_add',
			selection_mode: 'user_list'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 200 chars', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'x'.repeat(201),
			batch_type: 'role_add',
			selection_mode: 'user_list'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid batch_type', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'Test',
			batch_type: 'invalid_type',
			selection_mode: 'user_list'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid batch_type values', () => {
		for (const batchType of ['role_add', 'role_remove', 'entitlement_add', 'entitlement_remove']) {
			const result = createBatchSimulationSchema.safeParse({
				name: 'Test',
				batch_type: batchType,
				selection_mode: 'user_list'
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid selection_mode', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'Test',
			batch_type: 'role_add',
			selection_mode: 'random'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid selection_mode values', () => {
		for (const mode of ['user_list', 'filter']) {
			const result = createBatchSimulationSchema.safeParse({
				name: 'Test',
				batch_type: 'role_add',
				selection_mode: mode
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts optional fields when omitted', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'Minimal Batch',
			batch_type: 'role_add',
			selection_mode: 'user_list'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.user_ids).toBeUndefined();
			expect(result.data.filter_department).toBeUndefined();
			expect(result.data.change_role_id).toBeUndefined();
			expect(result.data.change_entitlement_id).toBeUndefined();
			expect(result.data.change_justification).toBeUndefined();
		}
	});

	it('rejects invalid change_role_id (not a UUID)', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'Test',
			batch_type: 'role_add',
			selection_mode: 'user_list',
			change_role_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid change_entitlement_id (not a UUID)', () => {
		const result = createBatchSimulationSchema.safeParse({
			name: 'Test',
			batch_type: 'entitlement_add',
			selection_mode: 'user_list',
			change_entitlement_id: 'bad-id'
		});
		expect(result.success).toBe(false);
	});
});

describe('applyBatchSchema', () => {
	it('accepts valid input', () => {
		const result = applyBatchSchema.safeParse({
			justification: 'Approved by manager',
			acknowledge_scope: true
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.justification).toBe('Approved by manager');
			expect(result.data.acknowledge_scope).toBe(true);
		}
	});

	it('rejects missing justification', () => {
		const result = applyBatchSchema.safeParse({
			acknowledge_scope: true
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty justification', () => {
		const result = applyBatchSchema.safeParse({
			justification: '',
			acknowledge_scope: true
		});
		expect(result.success).toBe(false);
	});

	it('rejects justification over 1000 chars', () => {
		const result = applyBatchSchema.safeParse({
			justification: 'x'.repeat(1001),
			acknowledge_scope: true
		});
		expect(result.success).toBe(false);
	});

	it('accepts justification exactly 1000 chars', () => {
		const result = applyBatchSchema.safeParse({
			justification: 'x'.repeat(1000),
			acknowledge_scope: true
		});
		expect(result.success).toBe(true);
	});

	it('rejects acknowledge_scope=false', () => {
		const result = applyBatchSchema.safeParse({
			justification: 'Approved',
			acknowledge_scope: false
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing acknowledge_scope', () => {
		const result = applyBatchSchema.safeParse({
			justification: 'Approved'
		});
		expect(result.success).toBe(false);
	});
});

describe('updateNotesSchema', () => {
	it('accepts valid notes', () => {
		const result = updateNotesSchema.safeParse({
			notes: 'Some important notes about the simulation'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBe('Some important notes about the simulation');
		}
	});

	it('accepts empty string (valid)', () => {
		const result = updateNotesSchema.safeParse({
			notes: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBe('');
		}
	});

	it('accepts notes exactly 5000 chars', () => {
		const result = updateNotesSchema.safeParse({
			notes: 'x'.repeat(5000)
		});
		expect(result.success).toBe(true);
	});

	it('rejects notes over 5000 chars', () => {
		const result = updateNotesSchema.safeParse({
			notes: 'x'.repeat(5001)
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing notes field', () => {
		const result = updateNotesSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('createComparisonSchema', () => {
	it('accepts valid simulation_vs_simulation comparison', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Compare SoD vs Birthright',
			comparison_type: 'simulation_vs_simulation',
			simulation_a_id: validUuid,
			simulation_a_type: 'policy',
			simulation_b_id: validUuid2,
			simulation_b_type: 'batch'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Compare SoD vs Birthright');
			expect(result.data.comparison_type).toBe('simulation_vs_simulation');
			expect(result.data.simulation_a_id).toBe(validUuid);
			expect(result.data.simulation_b_id).toBe(validUuid2);
		}
	});

	it('accepts valid simulation_vs_current comparison (no b fields)', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Compare vs Current',
			comparison_type: 'simulation_vs_current',
			simulation_a_id: validUuid,
			simulation_a_type: 'policy'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.comparison_type).toBe('simulation_vs_current');
			expect(result.data.simulation_b_id).toBeUndefined();
			expect(result.data.simulation_b_type).toBeUndefined();
		}
	});

	it('rejects missing simulation_a_id', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Test',
			comparison_type: 'simulation_vs_current',
			simulation_a_type: 'policy'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid simulation_a_id (not a UUID)', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Test',
			comparison_type: 'simulation_vs_current',
			simulation_a_id: 'not-a-uuid',
			simulation_a_type: 'policy'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createComparisonSchema.safeParse({
			comparison_type: 'simulation_vs_current',
			simulation_a_id: validUuid,
			simulation_a_type: 'policy'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createComparisonSchema.safeParse({
			name: '',
			comparison_type: 'simulation_vs_current',
			simulation_a_id: validUuid,
			simulation_a_type: 'policy'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 200 chars', () => {
		const result = createComparisonSchema.safeParse({
			name: 'x'.repeat(201),
			comparison_type: 'simulation_vs_current',
			simulation_a_id: validUuid,
			simulation_a_type: 'policy'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid comparison_type', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Test',
			comparison_type: 'unknown_type',
			simulation_a_id: validUuid,
			simulation_a_type: 'policy'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid comparison_type values', () => {
		for (const cmpType of ['simulation_vs_simulation', 'simulation_vs_current']) {
			const result = createComparisonSchema.safeParse({
				name: 'Test',
				comparison_type: cmpType,
				simulation_a_id: validUuid,
				simulation_a_type: 'policy'
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid simulation_a_type values', () => {
		for (const simType of ['policy', 'batch']) {
			const result = createComparisonSchema.safeParse({
				name: 'Test',
				comparison_type: 'simulation_vs_current',
				simulation_a_id: validUuid,
				simulation_a_type: simType
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid simulation_a_type', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Test',
			comparison_type: 'simulation_vs_current',
			simulation_a_id: validUuid,
			simulation_a_type: 'unknown'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid simulation_b_type', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Test',
			comparison_type: 'simulation_vs_simulation',
			simulation_a_id: validUuid,
			simulation_a_type: 'policy',
			simulation_b_id: validUuid2,
			simulation_b_type: 'invalid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing simulation_a_type', () => {
		const result = createComparisonSchema.safeParse({
			name: 'Test',
			comparison_type: 'simulation_vs_current',
			simulation_a_id: validUuid
		});
		expect(result.success).toBe(false);
	});
});
