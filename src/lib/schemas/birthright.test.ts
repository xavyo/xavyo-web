import { describe, it, expect } from 'vitest';
import {
	createBirthrightPolicySchema,
	updateBirthrightPolicySchema,
	simulatePolicySchema
} from './birthright';

describe('createBirthrightPolicySchema', () => {
	const validUUID = '550e8400-e29b-41d4-a716-446655440000';
	const validInput = {
		name: 'New Hire Policy',
		description: 'Assigns base entitlements to new hires',
		priority: 10,
		conditions: [
			{ attribute: 'department', operator: 'equals' as const, value: 'Engineering' }
		],
		entitlement_ids: [validUUID],
		evaluation_mode: 'all_match' as const,
		grace_period_days: 30
	};

	it('accepts valid input', () => {
		const result = createBirthrightPolicySchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts minimal input without optional fields', () => {
		const result = createBirthrightPolicySchema.safeParse({
			name: 'Policy',
			priority: 0,
			conditions: [{ attribute: 'role', operator: 'equals', value: 'dev' }],
			entitlement_ids: [validUUID]
		});
		expect(result.success).toBe(true);
	});

	it('defaults evaluation_mode to all_match', () => {
		const result = createBirthrightPolicySchema.safeParse({
			name: 'Policy',
			priority: 0,
			conditions: [{ attribute: 'role', operator: 'equals', value: 'dev' }],
			entitlement_ids: [validUUID]
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.evaluation_mode).toBe('all_match');
		}
	});

	it('rejects empty name', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 characters', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, name: 'A'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('rejects empty conditions array', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, conditions: [] });
		expect(result.success).toBe(false);
	});

	it('rejects missing conditions', () => {
		const { conditions, ...rest } = validInput;
		const result = createBirthrightPolicySchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects condition with empty attribute', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [{ attribute: '', operator: 'equals', value: 'x' }]
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid operator', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [{ attribute: 'dept', operator: 'greater_than', value: 10 }]
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid operators', () => {
		const operators = ['equals', 'not_equals', 'in', 'not_in', 'contains', 'starts_with'] as const;
		for (const op of operators) {
			const result = createBirthrightPolicySchema.safeParse({
				...validInput,
				conditions: [{ attribute: 'dept', operator: op, value: 'val' }]
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects condition with null value', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [{ attribute: 'dept', operator: 'equals', value: null }]
		});
		expect(result.success).toBe(false);
	});

	it('rejects condition with undefined value', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [{ attribute: 'dept', operator: 'equals', value: undefined }]
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty entitlement_ids array', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, entitlement_ids: [] });
		expect(result.success).toBe(false);
	});

	it('rejects missing entitlement_ids', () => {
		const { entitlement_ids, ...rest } = validInput;
		const result = createBirthrightPolicySchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid UUID in entitlement_ids', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			entitlement_ids: ['not-a-uuid']
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative priority', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, priority: -1 });
		expect(result.success).toBe(false);
	});

	it('coerces priority from string', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, priority: '5' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(5);
		}
	});

	it('rejects grace_period_days over 365', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, grace_period_days: 366 });
		expect(result.success).toBe(false);
	});

	it('accepts grace_period_days at exactly 365', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, grace_period_days: 365 });
		expect(result.success).toBe(true);
	});

	it('rejects negative grace_period_days', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, grace_period_days: -1 });
		expect(result.success).toBe(false);
	});

	it('coerces grace_period_days from string', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, grace_period_days: '14' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.grace_period_days).toBe(14);
		}
	});

	it('rejects description over 2000 characters', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, description: 'A'.repeat(2001) });
		expect(result.success).toBe(false);
	});

	it('accepts first_match evaluation mode', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, evaluation_mode: 'first_match' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid evaluation_mode', () => {
		const result = createBirthrightPolicySchema.safeParse({ ...validInput, evaluation_mode: 'any_match' });
		expect(result.success).toBe(false);
	});

	it('accepts multiple conditions', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [
				{ attribute: 'department', operator: 'equals', value: 'Engineering' },
				{ attribute: 'location', operator: 'in', value: ['US', 'UK'] },
				{ attribute: 'title', operator: 'contains', value: 'Engineer' }
			]
		});
		expect(result.success).toBe(true);
	});

	it('accepts multiple entitlement_ids', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			entitlement_ids: [
				'550e8400-e29b-41d4-a716-446655440000',
				'660e8400-e29b-41d4-a716-446655440001',
				'770e8400-e29b-41d4-a716-446655440002'
			]
		});
		expect(result.success).toBe(true);
	});
});

describe('updateBirthrightPolicySchema', () => {
	const validUUID = '550e8400-e29b-41d4-a716-446655440000';

	it('accepts empty object (all optional)', () => {
		expect(updateBirthrightPolicySchema.safeParse({}).success).toBe(true);
	});

	it('accepts partial update with name', () => {
		expect(updateBirthrightPolicySchema.safeParse({ name: 'Updated' }).success).toBe(true);
	});

	it('rejects empty name', () => {
		expect(updateBirthrightPolicySchema.safeParse({ name: '' }).success).toBe(false);
	});

	it('rejects name over 255 characters', () => {
		expect(updateBirthrightPolicySchema.safeParse({ name: 'A'.repeat(256) }).success).toBe(false);
	});

	it('accepts nullable description', () => {
		expect(updateBirthrightPolicySchema.safeParse({ description: null }).success).toBe(true);
	});

	it('rejects empty conditions array when provided', () => {
		expect(updateBirthrightPolicySchema.safeParse({ conditions: [] }).success).toBe(false);
	});

	it('accepts valid conditions when provided', () => {
		const result = updateBirthrightPolicySchema.safeParse({
			conditions: [{ attribute: 'dept', operator: 'equals', value: 'IT' }]
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty entitlement_ids array when provided', () => {
		expect(updateBirthrightPolicySchema.safeParse({ entitlement_ids: [] }).success).toBe(false);
	});

	it('accepts valid entitlement_ids when provided', () => {
		expect(updateBirthrightPolicySchema.safeParse({ entitlement_ids: [validUUID] }).success).toBe(true);
	});

	it('rejects invalid entitlement UUID', () => {
		expect(updateBirthrightPolicySchema.safeParse({ entitlement_ids: ['bad'] }).success).toBe(false);
	});

	it('rejects grace_period_days over 365', () => {
		expect(updateBirthrightPolicySchema.safeParse({ grace_period_days: 400 }).success).toBe(false);
	});

	it('accepts valid evaluation_mode', () => {
		expect(updateBirthrightPolicySchema.safeParse({ evaluation_mode: 'first_match' }).success).toBe(true);
	});

	it('rejects invalid evaluation_mode', () => {
		expect(updateBirthrightPolicySchema.safeParse({ evaluation_mode: 'invalid' }).success).toBe(false);
	});
});

describe('simulatePolicySchema', () => {
	it('accepts valid attributes', () => {
		const result = simulatePolicySchema.safeParse({
			attributes: { department: 'Engineering', location: 'US' }
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty attributes object', () => {
		const result = simulatePolicySchema.safeParse({ attributes: {} });
		expect(result.success).toBe(false);
	});

	it('rejects missing attributes', () => {
		const result = simulatePolicySchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('accepts attributes with various value types', () => {
		const result = simulatePolicySchema.safeParse({
			attributes: {
				department: 'Engineering',
				level: 5,
				active: true,
				tags: ['a', 'b']
			}
		});
		expect(result.success).toBe(true);
	});

	it('accepts attributes with a single key', () => {
		const result = simulatePolicySchema.safeParse({
			attributes: { role: 'admin' }
		});
		expect(result.success).toBe(true);
	});
});
