import { describe, it, expect } from 'vitest';
import {
	createBirthrightPolicySchema,
	updateBirthrightPolicySchema,
	simulatePolicySchema,
	createLifecycleEventSchema
} from './birthright';

const validUuid = '00000000-0000-0000-0000-000000000001';
const validUuid2 = '00000000-0000-0000-0000-000000000002';

describe('createBirthrightPolicySchema', () => {
	const validInput = {
		name: 'Engineering Birthright',
		priority: 1,
		conditions: [{ attribute: 'department', operator: 'equals' as const, value: 'Engineering' }],
		entitlement_ids: [validUuid]
	};

	it('accepts valid input with required fields', () => {
		const result = createBirthrightPolicySchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('defaults evaluation_mode to all_match', () => {
		const result = createBirthrightPolicySchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.evaluation_mode).toBe('all_match');
		}
	});

	it('defaults grace_period_days to 7', () => {
		const result = createBirthrightPolicySchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.grace_period_days).toBe(7);
		}
	});

	it('accepts all optional fields', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			description: 'Auto-provision for engineering team',
			evaluation_mode: 'first_match',
			grace_period_days: 30
		});
		expect(result.success).toBe(true);
	});

	it('accepts multiple conditions', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [
				{ attribute: 'department', operator: 'equals', value: 'Engineering' },
				{ attribute: 'location', operator: 'in', value: ['US', 'UK'] }
			]
		});
		expect(result.success).toBe(true);
	});

	it('accepts multiple entitlement_ids', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			entitlement_ids: [validUuid, validUuid2]
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createBirthrightPolicySchema.safeParse({
			priority: 1,
			conditions: [{ attribute: 'department', operator: 'equals', value: 'Eng' }],
			entitlement_ids: [validUuid]
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty conditions array', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: []
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty entitlement_ids array', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			entitlement_ids: []
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid operator', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [{ attribute: 'department', operator: 'like', value: 'Eng' }]
		});
		expect(result.success).toBe(false);
	});

	it('rejects grace_period_days over 365', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			grace_period_days: 400
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative priority', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			priority: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid evaluation_mode', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			evaluation_mode: 'any_match'
		});
		expect(result.success).toBe(false);
	});

	it('coerces priority from string', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			priority: '5'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(5);
		}
	});

	it('rejects condition with empty attribute', () => {
		const result = createBirthrightPolicySchema.safeParse({
			...validInput,
			conditions: [{ attribute: '', operator: 'equals', value: 'Eng' }]
		});
		expect(result.success).toBe(false);
	});
});

describe('updateBirthrightPolicySchema', () => {
	it('accepts empty object (all fields optional)', () => {
		const result = updateBirthrightPolicySchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with name only', () => {
		const result = updateBirthrightPolicySchema.safeParse({ name: 'Updated Name' });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with conditions', () => {
		const result = updateBirthrightPolicySchema.safeParse({
			conditions: [{ attribute: 'role', operator: 'contains', value: 'admin' }]
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty conditions array when provided', () => {
		const result = updateBirthrightPolicySchema.safeParse({ conditions: [] });
		expect(result.success).toBe(false);
	});

	it('rejects empty entitlement_ids array when provided', () => {
		const result = updateBirthrightPolicySchema.safeParse({ entitlement_ids: [] });
		expect(result.success).toBe(false);
	});
});

describe('simulatePolicySchema', () => {
	it('accepts valid JSON object string', () => {
		const result = simulatePolicySchema.safeParse({
			attributes: '{"department": "Engineering", "location": "US"}'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty string', () => {
		const result = simulatePolicySchema.safeParse({ attributes: '' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid JSON', () => {
		const result = simulatePolicySchema.safeParse({ attributes: 'not json' });
		expect(result.success).toBe(false);
	});

	it('rejects JSON array', () => {
		const result = simulatePolicySchema.safeParse({ attributes: '[1,2,3]' });
		expect(result.success).toBe(false);
	});

	it('rejects JSON primitive', () => {
		const result = simulatePolicySchema.safeParse({ attributes: '"hello"' });
		expect(result.success).toBe(false);
	});

	it('accepts nested JSON object', () => {
		const result = simulatePolicySchema.safeParse({
			attributes: '{"metadata": {"cost_center": "CC123"}, "department": "HR"}'
		});
		expect(result.success).toBe(true);
	});
});

describe('createLifecycleEventSchema', () => {
	const validEvent = {
		user_id: validUuid,
		event_type: 'joiner' as const
	};

	it('accepts joiner event with attributes_after', () => {
		const result = createLifecycleEventSchema.safeParse({
			...validEvent,
			attributes_after: '{"department": "Engineering"}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts joiner event without attributes', () => {
		const result = createLifecycleEventSchema.safeParse(validEvent);
		expect(result.success).toBe(true);
	});

	it('accepts mover event with both attributes', () => {
		const result = createLifecycleEventSchema.safeParse({
			...validEvent,
			event_type: 'mover',
			attributes_before: '{"department": "Sales"}',
			attributes_after: '{"department": "Engineering"}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts leaver event without attributes', () => {
		const result = createLifecycleEventSchema.safeParse({
			...validEvent,
			event_type: 'leaver'
		});
		expect(result.success).toBe(true);
	});

	it('defaults source to api', () => {
		const result = createLifecycleEventSchema.safeParse(validEvent);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.source).toBe('api');
		}
	});

	it('rejects missing user_id', () => {
		const result = createLifecycleEventSchema.safeParse({ event_type: 'joiner' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid event_type', () => {
		const result = createLifecycleEventSchema.safeParse({
			user_id: validUuid,
			event_type: 'transfer'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid attributes_before JSON', () => {
		const result = createLifecycleEventSchema.safeParse({
			...validEvent,
			event_type: 'mover',
			attributes_before: 'not json'
		});
		expect(result.success).toBe(false);
	});

	it('rejects array as attributes_after', () => {
		const result = createLifecycleEventSchema.safeParse({
			...validEvent,
			attributes_after: '[1,2]'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid user_id format', () => {
		const result = createLifecycleEventSchema.safeParse({
			user_id: 'not-a-uuid',
			event_type: 'joiner'
		});
		expect(result.success).toBe(false);
	});
});
