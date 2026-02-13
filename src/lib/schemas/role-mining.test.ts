import { describe, it, expect } from 'vitest';
import {
	createMiningJobSchema,
	promoteCandidateSchema,
	dismissCandidateSchema,
	reviewPrivilegeSchema,
	dismissConsolidationSchema,
	createSimulationSchema
} from './role-mining';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440001';
const VALID_UUID_2 = '550e8400-e29b-41d4-a716-446655440002';

describe('createMiningJobSchema', () => {
	it('accepts valid input with name only', () => {
		const result = createMiningJobSchema.safeParse({ name: 'Q1 Mining Job' });
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all fields', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Full Mining Job',
			min_users: 5,
			min_entitlements: 3,
			confidence_threshold: 0.8,
			include_excessive_privilege: true,
			include_consolidation: false,
			consolidation_threshold: 50,
			deviation_threshold: 25,
			peer_group_attribute: 'department'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Full Mining Job');
			expect(result.data.min_users).toBe(5);
			expect(result.data.confidence_threshold).toBe(0.8);
		}
	});

	it('rejects empty name', () => {
		const result = createMiningJobSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			const nameIssue = result.error.issues.find((i) => i.path.includes('name'));
			expect(nameIssue).toBeDefined();
			expect(nameIssue!.message).toBe('Name is required');
		}
	});

	it('rejects missing name', () => {
		const result = createMiningJobSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects name over 200 chars', () => {
		const result = createMiningJobSchema.safeParse({ name: 'x'.repeat(201) });
		expect(result.success).toBe(false);
	});

	it('accepts name at exactly 200 chars', () => {
		const result = createMiningJobSchema.safeParse({ name: 'x'.repeat(200) });
		expect(result.success).toBe(true);
	});

	it('rejects confidence_threshold greater than 1', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			confidence_threshold: 1.5
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative confidence_threshold', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			confidence_threshold: -0.1
		});
		expect(result.success).toBe(false);
	});

	it('accepts confidence_threshold at boundaries (0 and 1)', () => {
		const resultZero = createMiningJobSchema.safeParse({ name: 'Test', confidence_threshold: 0 });
		expect(resultZero.success).toBe(true);

		const resultOne = createMiningJobSchema.safeParse({ name: 'Test', confidence_threshold: 1 });
		expect(resultOne.success).toBe(true);
	});

	it('rejects negative min_users', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			min_users: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects zero min_users', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			min_users: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects min_users over 100', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			min_users: 101
		});
		expect(result.success).toBe(false);
	});

	it('accepts min_users at boundaries (1 and 100)', () => {
		const resultMin = createMiningJobSchema.safeParse({ name: 'Test', min_users: 1 });
		expect(resultMin.success).toBe(true);

		const resultMax = createMiningJobSchema.safeParse({ name: 'Test', min_users: 100 });
		expect(resultMax.success).toBe(true);
	});

	it('rejects non-integer min_users', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			min_users: 3.5
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative min_entitlements', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			min_entitlements: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects min_entitlements over 50', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			min_entitlements: 51
		});
		expect(result.success).toBe(false);
	});

	it('rejects consolidation_threshold over 100', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			consolidation_threshold: 101
		});
		expect(result.success).toBe(false);
	});

	it('rejects deviation_threshold over 100', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			deviation_threshold: 101
		});
		expect(result.success).toBe(false);
	});

	it('coerces string numbers for numeric fields', () => {
		const result = createMiningJobSchema.safeParse({
			name: 'Test',
			min_users: '5',
			confidence_threshold: '0.75'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.min_users).toBe(5);
			expect(result.data.confidence_threshold).toBe(0.75);
		}
	});
});

describe('promoteCandidateSchema', () => {
	it('accepts empty object', () => {
		const result = promoteCandidateSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with role_name only', () => {
		const result = promoteCandidateSchema.safeParse({
			role_name: 'Finance Approver'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.role_name).toBe('Finance Approver');
		}
	});

	it('accepts valid input with both role_name and description', () => {
		const result = promoteCandidateSchema.safeParse({
			role_name: 'Finance Approver',
			description: 'Handles finance approval workflows'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.role_name).toBe('Finance Approver');
			expect(result.data.description).toBe('Handles finance approval workflows');
		}
	});

	it('accepts valid input with description only', () => {
		const result = promoteCandidateSchema.safeParse({
			description: 'A discovered role pattern'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty role_name', () => {
		const result = promoteCandidateSchema.safeParse({
			role_name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects role_name over 200 chars', () => {
		const result = promoteCandidateSchema.safeParse({
			role_name: 'x'.repeat(201)
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars', () => {
		const result = promoteCandidateSchema.safeParse({
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});

	it('accepts description at exactly 1000 chars', () => {
		const result = promoteCandidateSchema.safeParse({
			description: 'x'.repeat(1000)
		});
		expect(result.success).toBe(true);
	});
});

describe('dismissCandidateSchema', () => {
	it('accepts empty object', () => {
		const result = dismissCandidateSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with reason', () => {
		const result = dismissCandidateSchema.safeParse({
			reason: 'Too few users matched this pattern'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('Too few users matched this pattern');
		}
	});

	it('rejects reason over 1000 chars', () => {
		const result = dismissCandidateSchema.safeParse({
			reason: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});

	it('accepts reason at exactly 1000 chars', () => {
		const result = dismissCandidateSchema.safeParse({
			reason: 'x'.repeat(1000)
		});
		expect(result.success).toBe(true);
	});
});

describe('reviewPrivilegeSchema', () => {
	it('accepts valid accept action', () => {
		const result = reviewPrivilegeSchema.safeParse({ action: 'accept' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.action).toBe('accept');
		}
	});

	it('accepts valid remediate action with notes', () => {
		const result = reviewPrivilegeSchema.safeParse({
			action: 'remediate',
			notes: 'Excessive access detected, reducing scope'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.action).toBe('remediate');
			expect(result.data.notes).toBe('Excessive access detected, reducing scope');
		}
	});

	it('accepts accept action with notes', () => {
		const result = reviewPrivilegeSchema.safeParse({
			action: 'accept',
			notes: 'Verified with manager'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing action', () => {
		const result = reviewPrivilegeSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects invalid action value', () => {
		const result = reviewPrivilegeSchema.safeParse({ action: 'deny' });
		expect(result.success).toBe(false);
	});

	it('rejects another invalid action value', () => {
		const result = reviewPrivilegeSchema.safeParse({ action: 'approve' });
		expect(result.success).toBe(false);
	});

	it('rejects notes over 1000 chars', () => {
		const result = reviewPrivilegeSchema.safeParse({
			action: 'remediate',
			notes: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});

	it('accepts notes at exactly 1000 chars', () => {
		const result = reviewPrivilegeSchema.safeParse({
			action: 'accept',
			notes: 'x'.repeat(1000)
		});
		expect(result.success).toBe(true);
	});
});

describe('dismissConsolidationSchema', () => {
	it('accepts empty object', () => {
		const result = dismissConsolidationSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with reason', () => {
		const result = dismissConsolidationSchema.safeParse({
			reason: 'Roles serve different purposes despite overlap'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('Roles serve different purposes despite overlap');
		}
	});

	it('rejects reason over 1000 chars', () => {
		const result = dismissConsolidationSchema.safeParse({
			reason: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});

	it('accepts reason at exactly 1000 chars', () => {
		const result = dismissConsolidationSchema.safeParse({
			reason: 'x'.repeat(1000)
		});
		expect(result.success).toBe(true);
	});
});

describe('createSimulationSchema', () => {
	it('accepts valid add_entitlement scenario with entitlement_id', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Add Finance Entitlement',
			scenario_type: 'add_entitlement',
			changes: {
				entitlement_id: VALID_UUID
			}
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Add Finance Entitlement');
			expect(result.data.scenario_type).toBe('add_entitlement');
			expect(result.data.changes.entitlement_id).toBe(VALID_UUID);
		}
	});

	it('accepts valid add_role scenario with role_name', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Add Analyst Role',
			scenario_type: 'add_role',
			changes: {
				role_name: 'Analyst',
				role_description: 'Read-only analyst role'
			}
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.scenario_type).toBe('add_role');
			expect(result.data.changes.role_name).toBe('Analyst');
		}
	});

	it('accepts valid remove_entitlement scenario', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Remove Legacy Entitlement',
			scenario_type: 'remove_entitlement',
			changes: {
				entitlement_id: VALID_UUID
			}
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid remove_role scenario', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Remove Temp Role',
			scenario_type: 'remove_role',
			changes: {
				role_id: VALID_UUID
			}
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid modify_role scenario', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Modify Role Entitlements',
			scenario_type: 'modify_role',
			target_role_id: VALID_UUID,
			changes: {
				entitlement_ids: [VALID_UUID, VALID_UUID_2],
				user_ids: [VALID_UUID]
			}
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target_role_id).toBe(VALID_UUID);
			expect(result.data.changes.entitlement_ids).toHaveLength(2);
		}
	});

	it('rejects empty name', () => {
		const result = createSimulationSchema.safeParse({
			name: '',
			scenario_type: 'add_entitlement',
			changes: {}
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const nameIssue = result.error.issues.find((i) => i.path.includes('name'));
			expect(nameIssue).toBeDefined();
			expect(nameIssue!.message).toBe('Name is required');
		}
	});

	it('rejects missing name', () => {
		const result = createSimulationSchema.safeParse({
			scenario_type: 'add_entitlement',
			changes: {}
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 200 chars', () => {
		const result = createSimulationSchema.safeParse({
			name: 'x'.repeat(201),
			scenario_type: 'add_entitlement',
			changes: {}
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid scenario_type', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'invalid_type',
			changes: {}
		});
		expect(result.success).toBe(false);
	});

	it('rejects another invalid scenario_type', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'delete_role',
			changes: {}
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid scenario_type values', () => {
		for (const scenario_type of [
			'add_entitlement',
			'remove_entitlement',
			'add_role',
			'remove_role',
			'modify_role'
		]) {
			const result = createSimulationSchema.safeParse({
				name: 'Test',
				scenario_type,
				changes: {}
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid uuid in changes.entitlement_id', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'add_entitlement',
			changes: {
				entitlement_id: 'not-a-uuid'
			}
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid uuid in changes.role_id', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'remove_role',
			changes: {
				role_id: 'not-a-uuid'
			}
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid uuid in changes.entitlement_ids array', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'modify_role',
			changes: {
				entitlement_ids: [VALID_UUID, 'not-a-uuid']
			}
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid uuid in changes.user_ids array', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'modify_role',
			changes: {
				user_ids: ['not-a-uuid']
			}
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid uuid in target_role_id', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'modify_role',
			target_role_id: 'not-a-uuid',
			changes: {}
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing changes object', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'add_entitlement'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing scenario_type', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			changes: {}
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty changes object', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'add_role',
			changes: {}
		});
		expect(result.success).toBe(true);
	});

	it('accepts changes with change_type string', () => {
		const result = createSimulationSchema.safeParse({
			name: 'Test',
			scenario_type: 'modify_role',
			changes: {
				change_type: 'add_entitlements'
			}
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.changes.change_type).toBe('add_entitlements');
		}
	});
});
