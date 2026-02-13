import { describe, it, expect } from 'vitest';
import {
	createPolicySchema,
	updatePolicySchema,
	createMappingSchema,
	authCheckSchema,
	createConditionSchema
} from './authorization';

describe('createPolicySchema', () => {
	it('accepts valid input', () => {
		const result = createPolicySchema.safeParse({
			name: 'Allow Read Documents',
			effect: 'allow',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createPolicySchema.safeParse({
			name: 'Deny Delete Users',
			description: 'Prevents deletion of user accounts by non-admins',
			effect: 'deny',
			priority: 50,
			resource_type: 'user',
			action: 'delete'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(50);
			expect(result.data.description).toBe('Prevents deletion of user accounts by non-admins');
		}
	});

	it('defaults priority to 100 when omitted', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test Policy',
			effect: 'allow',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(100);
		}
	});

	it('defaults description to empty string when omitted', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test Policy',
			effect: 'allow',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('');
		}
	});

	it('rejects missing name', () => {
		const result = createPolicySchema.safeParse({
			effect: 'allow',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createPolicySchema.safeParse({
			name: '',
			effect: 'allow',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createPolicySchema.safeParse({
			name: 'x'.repeat(256),
			effect: 'allow',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid effect', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'maybe',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid effect values', () => {
		for (const effect of ['allow', 'deny']) {
			const result = createPolicySchema.safeParse({
				name: 'Test',
				effect,
				resource_type: 'document',
				action: 'read'
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects missing resource_type', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty resource_type', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			resource_type: '',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing action', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty action', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			resource_type: 'document',
			action: ''
		});
		expect(result.success).toBe(false);
	});

	it('coerces priority from string to number', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			priority: '42',
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(42);
		}
	});

	it('rejects priority below 0', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			priority: -1,
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects priority above 10000', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			priority: 10001,
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars', () => {
		const result = createPolicySchema.safeParse({
			name: 'Test',
			effect: 'allow',
			description: 'x'.repeat(1001),
			resource_type: 'document',
			action: 'read'
		});
		expect(result.success).toBe(false);
	});
});

describe('updatePolicySchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updatePolicySchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update', () => {
		const result = updatePolicySchema.safeParse({
			name: 'Updated Policy Name',
			effect: 'deny'
		});
		expect(result.success).toBe(true);
	});

	it('accepts updating only priority', () => {
		const result = updatePolicySchema.safeParse({
			priority: 500
		});
		expect(result.success).toBe(true);
	});

	it('rejects name over 255 chars', () => {
		const result = updatePolicySchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid effect', () => {
		const result = updatePolicySchema.safeParse({
			effect: 'maybe'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars', () => {
		const result = updatePolicySchema.safeParse({
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});

describe('createMappingSchema', () => {
	const validUuid = '550e8400-e29b-41d4-a716-446655440000';

	it('accepts valid input', () => {
		const result = createMappingSchema.safeParse({
			entitlement_id: validUuid,
			action: 'read',
			resource_type: 'document'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid entitlement_id (not UUID)', () => {
		const result = createMappingSchema.safeParse({
			entitlement_id: 'not-a-uuid',
			action: 'read',
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing entitlement_id', () => {
		const result = createMappingSchema.safeParse({
			action: 'read',
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing action', () => {
		const result = createMappingSchema.safeParse({
			entitlement_id: validUuid,
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty action', () => {
		const result = createMappingSchema.safeParse({
			entitlement_id: validUuid,
			action: '',
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing resource_type', () => {
		const result = createMappingSchema.safeParse({
			entitlement_id: validUuid,
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty resource_type', () => {
		const result = createMappingSchema.safeParse({
			entitlement_id: validUuid,
			action: 'read',
			resource_type: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('authCheckSchema', () => {
	const validUuid = '550e8400-e29b-41d4-a716-446655440000';

	it('accepts valid input with required fields', () => {
		const result = authCheckSchema.safeParse({
			user_id: validUuid,
			action: 'read',
			resource_type: 'document'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with optional resource_id', () => {
		const result = authCheckSchema.safeParse({
			user_id: validUuid,
			action: 'read',
			resource_type: 'document',
			resource_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
		});
		expect(result.success).toBe(true);
	});

	it('defaults resource_id to empty string when omitted', () => {
		const result = authCheckSchema.safeParse({
			user_id: validUuid,
			action: 'read',
			resource_type: 'document'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.resource_id).toBe('');
		}
	});

	it('rejects invalid user_id (not UUID)', () => {
		const result = authCheckSchema.safeParse({
			user_id: 'not-a-uuid',
			action: 'read',
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing user_id', () => {
		const result = authCheckSchema.safeParse({
			action: 'read',
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing action', () => {
		const result = authCheckSchema.safeParse({
			user_id: validUuid,
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty action', () => {
		const result = authCheckSchema.safeParse({
			user_id: validUuid,
			action: '',
			resource_type: 'document'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing resource_type', () => {
		const result = authCheckSchema.safeParse({
			user_id: validUuid,
			action: 'read'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty resource_type', () => {
		const result = authCheckSchema.safeParse({
			user_id: validUuid,
			action: 'read',
			resource_type: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('createConditionSchema', () => {
	it('accepts valid input with required fields', () => {
		const result = createConditionSchema.safeParse({
			condition_type: 'time_window',
			value: '09:00-17:00'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all fields', () => {
		const result = createConditionSchema.safeParse({
			condition_type: 'user_attribute',
			attribute_path: 'department',
			operator: 'equals',
			value: 'Engineering'
		});
		expect(result.success).toBe(true);
	});

	it('defaults attribute_path to empty string when omitted', () => {
		const result = createConditionSchema.safeParse({
			condition_type: 'entitlement_check',
			value: 'has_base_access'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.attribute_path).toBe('');
		}
	});

	it('accepts all valid condition_type values', () => {
		for (const conditionType of ['time_window', 'user_attribute', 'entitlement_check']) {
			const result = createConditionSchema.safeParse({
				condition_type: conditionType,
				value: 'test'
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid condition_type', () => {
		const result = createConditionSchema.safeParse({
			condition_type: 'ip_range',
			value: '192.168.0.0/24'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing condition_type', () => {
		const result = createConditionSchema.safeParse({
			value: 'test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing value', () => {
		const result = createConditionSchema.safeParse({
			condition_type: 'time_window'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty value', () => {
		const result = createConditionSchema.safeParse({
			condition_type: 'time_window',
			value: ''
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid operator values', () => {
		for (const operator of ['equals', 'not_equals', 'contains', 'in_list']) {
			const result = createConditionSchema.safeParse({
				condition_type: 'user_attribute',
				operator,
				value: 'test'
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid operator', () => {
		const result = createConditionSchema.safeParse({
			condition_type: 'user_attribute',
			operator: 'greater_than',
			value: 'test'
		});
		expect(result.success).toBe(false);
	});
});
