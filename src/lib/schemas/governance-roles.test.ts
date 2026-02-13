import { describe, it, expect } from 'vitest';
import {
	createRoleSchema,
	updateRoleSchema,
	moveRoleSchema,
	addRoleEntitlementSchema,
	addParameterSchema,
	updateParameterSchema,
	addInheritanceBlockSchema
} from './governance-roles';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('createRoleSchema', () => {
	it('accepts valid input with name and description', () => {
		const result = createRoleSchema.safeParse({
			name: 'Finance Manager',
			description: 'Manages all finance entitlements'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with name only', () => {
		const result = createRoleSchema.safeParse({
			name: 'Viewer'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with nullable parent_id', () => {
		const result = createRoleSchema.safeParse({
			name: 'Child Role',
			parent_id: validUuid
		});
		expect(result.success).toBe(true);
	});

	it('accepts null parent_id for root role', () => {
		const result = createRoleSchema.safeParse({
			name: 'Root Role',
			parent_id: null
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createRoleSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createRoleSchema.safeParse({
			description: 'No name provided'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createRoleSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('accepts name of exactly 255 chars', () => {
		const result = createRoleSchema.safeParse({
			name: 'x'.repeat(255)
		});
		expect(result.success).toBe(true);
	});

	it('rejects description over 2000 chars', () => {
		const result = createRoleSchema.safeParse({
			name: 'Test',
			description: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid parent_id (not UUID)', () => {
		const result = createRoleSchema.safeParse({
			name: 'Test',
			parent_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
	});
});

describe('updateRoleSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = updateRoleSchema.safeParse({
			name: 'Updated Role',
			description: 'Updated description',
			is_abstract: true,
			version: 1
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with name and version only', () => {
		const result = updateRoleSchema.safeParse({
			name: 'Minimal Update',
			version: 3
		});
		expect(result.success).toBe(true);
	});

	it('defaults is_abstract to false when omitted', () => {
		const result = updateRoleSchema.safeParse({
			name: 'Test',
			version: 1
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.is_abstract).toBe(false);
		}
	});

	it('coerces version from string to number', () => {
		const result = updateRoleSchema.safeParse({
			name: 'Test',
			version: '5'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.version).toBe(5);
		}
	});

	it('rejects missing version', () => {
		const result = updateRoleSchema.safeParse({
			name: 'Test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects version 0', () => {
		const result = updateRoleSchema.safeParse({
			name: 'Test',
			version: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative version', () => {
		const result = updateRoleSchema.safeParse({
			name: 'Test',
			version: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = updateRoleSchema.safeParse({
			version: 1
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = updateRoleSchema.safeParse({
			name: '',
			version: 1
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = updateRoleSchema.safeParse({
			name: 'x'.repeat(256),
			version: 1
		});
		expect(result.success).toBe(false);
	});
});

describe('moveRoleSchema', () => {
	it('accepts valid input with parent_id', () => {
		const result = moveRoleSchema.safeParse({
			parent_id: validUuid,
			version: 2
		});
		expect(result.success).toBe(true);
	});

	it('accepts null parent_id for moving to root', () => {
		const result = moveRoleSchema.safeParse({
			parent_id: null,
			version: 1
		});
		expect(result.success).toBe(true);
	});

	it('accepts omitted parent_id', () => {
		const result = moveRoleSchema.safeParse({
			version: 1
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing version', () => {
		const result = moveRoleSchema.safeParse({
			parent_id: validUuid
		});
		expect(result.success).toBe(false);
	});

	it('rejects version 0', () => {
		const result = moveRoleSchema.safeParse({
			parent_id: validUuid,
			version: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid parent_id (not UUID)', () => {
		const result = moveRoleSchema.safeParse({
			parent_id: 'not-a-uuid',
			version: 1
		});
		expect(result.success).toBe(false);
	});
});

describe('addRoleEntitlementSchema', () => {
	it('accepts valid input', () => {
		const result = addRoleEntitlementSchema.safeParse({
			entitlement_id: validUuid,
			role_name: 'Finance Manager'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid entitlement_id (not UUID)', () => {
		const result = addRoleEntitlementSchema.safeParse({
			entitlement_id: 'not-a-uuid',
			role_name: 'Finance Manager'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing entitlement_id', () => {
		const result = addRoleEntitlementSchema.safeParse({
			role_name: 'Finance Manager'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty role_name', () => {
		const result = addRoleEntitlementSchema.safeParse({
			entitlement_id: validUuid,
			role_name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing role_name', () => {
		const result = addRoleEntitlementSchema.safeParse({
			entitlement_id: validUuid
		});
		expect(result.success).toBe(false);
	});
});

describe('addParameterSchema', () => {
	it('accepts valid enum parameter with all fields', () => {
		const result = addParameterSchema.safeParse({
			name: 'region',
			parameter_type: 'enum',
			description: 'Geographic region for access',
			is_required: true,
			default_value: 'us-east',
			constraints_json: '{"values":["us-east","eu-west"]}',
			display_name: 'Region',
			display_order: 1
		});
		expect(result.success).toBe(true);
	});

	it('accepts minimal string parameter', () => {
		const result = addParameterSchema.safeParse({
			name: 'label',
			parameter_type: 'string'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all valid parameter_type values', () => {
		for (const type of ['string', 'integer', 'boolean', 'date', 'enum']) {
			const result = addParameterSchema.safeParse({
				name: 'test',
				parameter_type: type
			});
			expect(result.success).toBe(true);
		}
	});

	it('defaults is_required to false when omitted', () => {
		const result = addParameterSchema.safeParse({
			name: 'test',
			parameter_type: 'string'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.is_required).toBe(false);
		}
	});

	it('defaults display_order to 0 when omitted', () => {
		const result = addParameterSchema.safeParse({
			name: 'test',
			parameter_type: 'string'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.display_order).toBe(0);
		}
	});

	it('rejects invalid parameter_type', () => {
		const result = addParameterSchema.safeParse({
			name: 'test',
			parameter_type: 'float'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = addParameterSchema.safeParse({
			name: '',
			parameter_type: 'string'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = addParameterSchema.safeParse({
			parameter_type: 'string'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing parameter_type', () => {
		const result = addParameterSchema.safeParse({
			name: 'test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = addParameterSchema.safeParse({
			name: 'x'.repeat(256),
			parameter_type: 'string'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 2000 chars', () => {
		const result = addParameterSchema.safeParse({
			name: 'test',
			parameter_type: 'string',
			description: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});

	it('rejects display_name over 255 chars', () => {
		const result = addParameterSchema.safeParse({
			name: 'test',
			parameter_type: 'string',
			display_name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative display_order', () => {
		const result = addParameterSchema.safeParse({
			name: 'test',
			parameter_type: 'string',
			display_order: -1
		});
		expect(result.success).toBe(false);
	});
});

describe('updateParameterSchema', () => {
	it('accepts valid partial update', () => {
		const result = updateParameterSchema.safeParse({
			description: 'Updated description',
			is_required: true
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateParameterSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts update with default_value and constraints_json', () => {
		const result = updateParameterSchema.safeParse({
			default_value: 'new-default',
			constraints_json: '{"max": 100}'
		});
		expect(result.success).toBe(true);
	});

	it('rejects description over 2000 chars', () => {
		const result = updateParameterSchema.safeParse({
			description: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});

	it('rejects display_name over 255 chars', () => {
		const result = updateParameterSchema.safeParse({
			display_name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative display_order', () => {
		const result = updateParameterSchema.safeParse({
			display_order: -1
		});
		expect(result.success).toBe(false);
	});
});

describe('addInheritanceBlockSchema', () => {
	it('accepts valid input', () => {
		const result = addInheritanceBlockSchema.safeParse({
			entitlement_id: validUuid
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid entitlement_id (not UUID)', () => {
		const result = addInheritanceBlockSchema.safeParse({
			entitlement_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing entitlement_id', () => {
		const result = addInheritanceBlockSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
