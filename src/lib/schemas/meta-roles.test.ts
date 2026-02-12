import { describe, it, expect } from 'vitest';
import {
	createMetaRoleSchema,
	updateMetaRoleSchema,
	addCriterionSchema,
	addEntitlementSchema,
	addConstraintSchema,
	resolveConflictSchema,
	simulateSchema,
	cascadeSchema
} from './meta-roles';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('createMetaRoleSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = createMetaRoleSchema.safeParse({
			name: 'High Risk Policy',
			description: 'Auto-apply governance to high-risk entitlements',
			priority: 10,
			criteria_logic: 'and'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with name and priority only', () => {
		const result = createMetaRoleSchema.safeParse({
			name: 'Simple Policy',
			priority: 100
		});
		expect(result.success).toBe(true);
	});

	it('defaults criteria_logic to and', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 50 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.criteria_logic).toBe('and');
		}
	});

	it('accepts or criteria_logic', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 50, criteria_logic: 'or' });
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createMetaRoleSchema.safeParse({ name: '', priority: 10 });
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createMetaRoleSchema.safeParse({ priority: 10 });
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'x'.repeat(256), priority: 10 });
		expect(result.success).toBe(false);
	});

	it('accepts name of exactly 255 chars', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'x'.repeat(255), priority: 10 });
		expect(result.success).toBe(true);
	});

	it('rejects description over 2000 chars', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 10, description: 'x'.repeat(2001) });
		expect(result.success).toBe(false);
	});

	it('rejects priority 0', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects priority over 1000', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 1001 });
		expect(result.success).toBe(false);
	});

	it('accepts priority 1', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 1 });
		expect(result.success).toBe(true);
	});

	it('accepts priority 1000', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 1000 });
		expect(result.success).toBe(true);
	});

	it('coerces string priority to number', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: '50' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(50);
		}
	});

	it('rejects missing priority', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid criteria_logic', () => {
		const result = createMetaRoleSchema.safeParse({ name: 'Test', priority: 10, criteria_logic: 'xor' });
		expect(result.success).toBe(false);
	});
});

describe('updateMetaRoleSchema', () => {
	it('accepts valid partial update', () => {
		const result = updateMetaRoleSchema.safeParse({ name: 'Updated Name' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateMetaRoleSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts all fields', () => {
		const result = updateMetaRoleSchema.safeParse({
			name: 'Updated',
			description: 'New desc',
			priority: 20,
			criteria_logic: 'or'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = updateMetaRoleSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = updateMetaRoleSchema.safeParse({ name: 'x'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('rejects priority 0', () => {
		const result = updateMetaRoleSchema.safeParse({ priority: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects priority over 1000', () => {
		const result = updateMetaRoleSchema.safeParse({ priority: 1001 });
		expect(result.success).toBe(false);
	});
});

describe('addCriterionSchema', () => {
	it('accepts valid criterion', () => {
		const result = addCriterionSchema.safeParse({
			field: 'risk_level',
			operator: 'eq',
			value: 'high'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all valid fields', () => {
		for (const field of ['risk_level', 'application_id', 'owner_id', 'status', 'name', 'is_delegable', 'metadata']) {
			const result = addCriterionSchema.safeParse({ field, operator: 'eq', value: 'test' });
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid operators', () => {
		for (const operator of ['eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'contains', 'starts_with']) {
			const result = addCriterionSchema.safeParse({ field: 'name', operator, value: 'test' });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid field', () => {
		const result = addCriterionSchema.safeParse({ field: 'unknown_field', operator: 'eq', value: 'test' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid operator', () => {
		const result = addCriterionSchema.safeParse({ field: 'name', operator: 'like', value: 'test' });
		expect(result.success).toBe(false);
	});

	it('rejects missing field', () => {
		const result = addCriterionSchema.safeParse({ operator: 'eq', value: 'test' });
		expect(result.success).toBe(false);
	});

	it('rejects missing operator', () => {
		const result = addCriterionSchema.safeParse({ field: 'name', value: 'test' });
		expect(result.success).toBe(false);
	});

	it('rejects empty value', () => {
		const result = addCriterionSchema.safeParse({ field: 'name', operator: 'eq', value: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing value', () => {
		const result = addCriterionSchema.safeParse({ field: 'name', operator: 'eq' });
		expect(result.success).toBe(false);
	});
});

describe('addEntitlementSchema', () => {
	it('accepts valid input with permission_type', () => {
		const result = addEntitlementSchema.safeParse({
			entitlement_id: validUuid,
			permission_type: 'grant'
		});
		expect(result.success).toBe(true);
	});

	it('defaults permission_type to grant', () => {
		const result = addEntitlementSchema.safeParse({ entitlement_id: validUuid });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.permission_type).toBe('grant');
		}
	});

	it('accepts deny permission_type', () => {
		const result = addEntitlementSchema.safeParse({ entitlement_id: validUuid, permission_type: 'deny' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid entitlement_id', () => {
		const result = addEntitlementSchema.safeParse({ entitlement_id: 'not-a-uuid' });
		expect(result.success).toBe(false);
	});

	it('rejects missing entitlement_id', () => {
		const result = addEntitlementSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects invalid permission_type', () => {
		const result = addEntitlementSchema.safeParse({ entitlement_id: validUuid, permission_type: 'read' });
		expect(result.success).toBe(false);
	});
});

describe('addConstraintSchema', () => {
	it('accepts valid constraint', () => {
		const result = addConstraintSchema.safeParse({
			constraint_type: 'require_mfa',
			constraint_value: '{"enabled":true}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all valid constraint types', () => {
		for (const ct of ['max_session_duration', 'require_mfa', 'ip_whitelist', 'approval_required']) {
			const result = addConstraintSchema.safeParse({ constraint_type: ct, constraint_value: '{}' });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid constraint_type', () => {
		const result = addConstraintSchema.safeParse({ constraint_type: 'unknown', constraint_value: '{}' });
		expect(result.success).toBe(false);
	});

	it('rejects empty constraint_value', () => {
		const result = addConstraintSchema.safeParse({ constraint_type: 'require_mfa', constraint_value: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing constraint_type', () => {
		const result = addConstraintSchema.safeParse({ constraint_value: '{}' });
		expect(result.success).toBe(false);
	});

	it('rejects missing constraint_value', () => {
		const result = addConstraintSchema.safeParse({ constraint_type: 'require_mfa' });
		expect(result.success).toBe(false);
	});
});

describe('resolveConflictSchema', () => {
	it('accepts resolved_priority', () => {
		const result = resolveConflictSchema.safeParse({ resolution_status: 'resolved_priority' });
		expect(result.success).toBe(true);
	});

	it('accepts resolved_manual with choice', () => {
		const result = resolveConflictSchema.safeParse({
			resolution_status: 'resolved_manual',
			resolution_choice: '{"winning_meta_role_id":"uuid"}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts ignored with comment', () => {
		const result = resolveConflictSchema.safeParse({
			resolution_status: 'ignored',
			comment: 'Low impact conflict'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid resolution_status', () => {
		const result = resolveConflictSchema.safeParse({ resolution_status: 'unresolved' });
		expect(result.success).toBe(false);
	});

	it('rejects missing resolution_status', () => {
		const result = resolveConflictSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects comment over 2000 chars', () => {
		const result = resolveConflictSchema.safeParse({ resolution_status: 'ignored', comment: 'x'.repeat(2001) });
		expect(result.success).toBe(false);
	});
});

describe('simulateSchema', () => {
	it('accepts valid simulation', () => {
		const result = simulateSchema.safeParse({ simulation_type: 'criteria_change' });
		expect(result.success).toBe(true);
	});

	it('accepts all simulation types', () => {
		for (const st of ['create', 'update', 'delete', 'criteria_change', 'enable', 'disable']) {
			const result = simulateSchema.safeParse({ simulation_type: st });
			expect(result.success).toBe(true);
		}
	});

	it('defaults limit to 100', () => {
		const result = simulateSchema.safeParse({ simulation_type: 'create' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.limit).toBe(100);
		}
	});

	it('rejects invalid simulation_type', () => {
		const result = simulateSchema.safeParse({ simulation_type: 'test' });
		expect(result.success).toBe(false);
	});

	it('rejects missing simulation_type', () => {
		const result = simulateSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects limit over 1000', () => {
		const result = simulateSchema.safeParse({ simulation_type: 'create', limit: 1001 });
		expect(result.success).toBe(false);
	});
});

describe('cascadeSchema', () => {
	it('accepts empty object (defaults dry_run to false)', () => {
		const result = cascadeSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.dry_run).toBe(false);
		}
	});

	it('accepts dry_run true', () => {
		const result = cascadeSchema.safeParse({ dry_run: true });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.dry_run).toBe(true);
		}
	});

	it('accepts dry_run false', () => {
		const result = cascadeSchema.safeParse({ dry_run: false });
		expect(result.success).toBe(true);
	});
});
