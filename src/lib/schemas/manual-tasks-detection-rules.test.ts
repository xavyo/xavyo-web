import { describe, it, expect } from 'vitest';
import {
	confirmTaskSchema,
	rejectTaskSchema,
	configureSemiManualSchema,
	createDetectionRuleSchema,
	updateDetectionRuleSchema,
	gracePeriodSchema
} from './manual-tasks-detection-rules';

describe('confirmTaskSchema', () => {
	it('accepts empty object (notes is optional)', () => {
		const result = confirmTaskSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts with notes', () => {
		const result = confirmTaskSchema.safeParse({ notes: 'Confirmed after review' });
		expect(result.success).toBe(true);
	});

	it('accepts with empty string notes', () => {
		const result = confirmTaskSchema.safeParse({ notes: '' });
		expect(result.success).toBe(true);
	});

	it('accepts notes at exactly 2000 characters', () => {
		const result = confirmTaskSchema.safeParse({ notes: 'a'.repeat(2000) });
		expect(result.success).toBe(true);
	});

	it('rejects notes exceeding 2000 characters', () => {
		const result = confirmTaskSchema.safeParse({ notes: 'a'.repeat(2001) });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Notes must be 2000 characters or less');
		}
	});

	it('accepts without notes field at all', () => {
		const result = confirmTaskSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBeUndefined();
		}
	});
});

describe('rejectTaskSchema', () => {
	it('accepts valid reason', () => {
		const result = rejectTaskSchema.safeParse({ reason: 'Not appropriate for this case' });
		expect(result.success).toBe(true);
	});

	it('accepts reason at exactly 5 characters', () => {
		const result = rejectTaskSchema.safeParse({ reason: 'abcde' });
		expect(result.success).toBe(true);
	});

	it('accepts reason at exactly 1000 characters', () => {
		const result = rejectTaskSchema.safeParse({ reason: 'a'.repeat(1000) });
		expect(result.success).toBe(true);
	});

	it('rejects reason shorter than 5 characters', () => {
		const result = rejectTaskSchema.safeParse({ reason: 'abcd' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Reason must be at least 5 characters');
		}
	});

	it('rejects empty reason', () => {
		const result = rejectTaskSchema.safeParse({ reason: '' });
		expect(result.success).toBe(false);
	});

	it('rejects reason exceeding 1000 characters', () => {
		const result = rejectTaskSchema.safeParse({ reason: 'a'.repeat(1001) });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Reason must be 1000 characters or less');
		}
	});

	it('rejects missing reason', () => {
		const result = rejectTaskSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('configureSemiManualSchema', () => {
	const validInput = {
		is_semi_manual: true,
		ticketing_config_id: '550e8400-e29b-41d4-a716-446655440000',
		sla_policy_id: '660e8400-e29b-41d4-a716-446655440000',
		requires_approval_before_ticket: false
	};

	it('accepts valid input with all fields', () => {
		const result = configureSemiManualSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts null ticketing_config_id', () => {
		const result = configureSemiManualSchema.safeParse({
			...validInput,
			ticketing_config_id: null
		});
		expect(result.success).toBe(true);
	});

	it('accepts null sla_policy_id', () => {
		const result = configureSemiManualSchema.safeParse({
			...validInput,
			sla_policy_id: null
		});
		expect(result.success).toBe(true);
	});

	it('accepts undefined ticketing_config_id (optional)', () => {
		const { ticketing_config_id, ...rest } = validInput;
		const result = configureSemiManualSchema.safeParse(rest);
		expect(result.success).toBe(true);
	});

	it('accepts undefined sla_policy_id (optional)', () => {
		const { sla_policy_id, ...rest } = validInput;
		const result = configureSemiManualSchema.safeParse(rest);
		expect(result.success).toBe(true);
	});

	it('accepts both config IDs as null', () => {
		const result = configureSemiManualSchema.safeParse({
			is_semi_manual: false,
			ticketing_config_id: null,
			sla_policy_id: null,
			requires_approval_before_ticket: false
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID for ticketing_config_id', () => {
		const result = configureSemiManualSchema.safeParse({
			...validInput,
			ticketing_config_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Invalid ticketing config ID');
		}
	});

	it('rejects invalid UUID for sla_policy_id', () => {
		const result = configureSemiManualSchema.safeParse({
			...validInput,
			sla_policy_id: 'bad-uuid'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Invalid SLA policy ID');
		}
	});

	it('rejects missing is_semi_manual', () => {
		const { is_semi_manual, ...rest } = validInput;
		const result = configureSemiManualSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing requires_approval_before_ticket', () => {
		const { requires_approval_before_ticket, ...rest } = validInput;
		const result = configureSemiManualSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects non-boolean is_semi_manual', () => {
		const result = configureSemiManualSchema.safeParse({
			...validInput,
			is_semi_manual: 'true'
		});
		expect(result.success).toBe(false);
	});
});

describe('createDetectionRuleSchema', () => {
	const validInput = {
		name: 'No Manager Rule',
		rule_type: 'no_manager' as const,
		is_enabled: true,
		priority: 1
	};

	it('accepts valid input with required fields only', () => {
		const result = createDetectionRuleSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			days_threshold: 30,
			expression: 'user.status == "inactive"',
			description: 'Detects users without managers'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all valid rule_types', () => {
		for (const ruleType of ['no_manager', 'terminated', 'inactive', 'custom']) {
			const result = createDetectionRuleSchema.safeParse({
				...validInput,
				rule_type: ruleType
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid rule_type', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			rule_type: 'Unknown'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createDetectionRuleSchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Name is required');
		}
	});

	it('rejects name exceeding 100 characters', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			name: 'a'.repeat(101)
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Name must be 100 characters or less');
		}
	});

	it('accepts name at exactly 100 characters', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			name: 'a'.repeat(100)
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const { name, ...rest } = validInput;
		const result = createDetectionRuleSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects priority of 0', () => {
		const result = createDetectionRuleSchema.safeParse({ ...validInput, priority: 0 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Priority must be at least 1');
		}
	});

	it('rejects negative priority', () => {
		const result = createDetectionRuleSchema.safeParse({ ...validInput, priority: -1 });
		expect(result.success).toBe(false);
	});

	it('accepts priority of 1 (minimum)', () => {
		const result = createDetectionRuleSchema.safeParse({ ...validInput, priority: 1 });
		expect(result.success).toBe(true);
	});

	it('rejects non-integer priority', () => {
		const result = createDetectionRuleSchema.safeParse({ ...validInput, priority: 1.5 });
		expect(result.success).toBe(false);
	});

	it('rejects days_threshold of 0', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			days_threshold: 0
		});
		expect(result.success).toBe(false);
	});

	it('accepts days_threshold of 1 (minimum)', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			days_threshold: 1
		});
		expect(result.success).toBe(true);
	});

	it('rejects non-integer days_threshold', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			days_threshold: 2.5
		});
		expect(result.success).toBe(false);
	});

	it('rejects description exceeding 500 characters', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			description: 'a'.repeat(501)
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Description must be 500 characters or less');
		}
	});

	it('accepts description at exactly 500 characters', () => {
		const result = createDetectionRuleSchema.safeParse({
			...validInput,
			description: 'a'.repeat(500)
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing is_enabled', () => {
		const { is_enabled, ...rest } = validInput;
		const result = createDetectionRuleSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing rule_type', () => {
		const { rule_type, ...rest } = validInput;
		const result = createDetectionRuleSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});
});

describe('updateDetectionRuleSchema', () => {
	it('accepts empty object (all fields optional)', () => {
		const result = updateDetectionRuleSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with name only', () => {
		const result = updateDetectionRuleSchema.safeParse({ name: 'Updated Rule' });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with is_enabled only', () => {
		const result = updateDetectionRuleSchema.safeParse({ is_enabled: false });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with priority only', () => {
		const result = updateDetectionRuleSchema.safeParse({ priority: 5 });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with days_threshold only', () => {
		const result = updateDetectionRuleSchema.safeParse({ days_threshold: 90 });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with expression only', () => {
		const result = updateDetectionRuleSchema.safeParse({ expression: 'user.active == false' });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with description only', () => {
		const result = updateDetectionRuleSchema.safeParse({ description: 'Updated description' });
		expect(result.success).toBe(true);
	});

	it('accepts multiple fields together', () => {
		const result = updateDetectionRuleSchema.safeParse({
			name: 'New Name',
			is_enabled: true,
			priority: 3,
			description: 'New description'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name when provided', () => {
		const result = updateDetectionRuleSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Name is required');
		}
	});

	it('rejects name exceeding 100 characters when provided', () => {
		const result = updateDetectionRuleSchema.safeParse({ name: 'a'.repeat(101) });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Name must be 100 characters or less');
		}
	});

	it('rejects priority of 0 when provided', () => {
		const result = updateDetectionRuleSchema.safeParse({ priority: 0 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Priority must be at least 1');
		}
	});

	it('rejects non-integer priority when provided', () => {
		const result = updateDetectionRuleSchema.safeParse({ priority: 2.7 });
		expect(result.success).toBe(false);
	});

	it('rejects days_threshold of 0 when provided', () => {
		const result = updateDetectionRuleSchema.safeParse({ days_threshold: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects description exceeding 500 characters when provided', () => {
		const result = updateDetectionRuleSchema.safeParse({ description: 'a'.repeat(501) });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Description must be 500 characters or less');
		}
	});
});

describe('gracePeriodSchema', () => {
	it('accepts valid grace_days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 30 });
		expect(result.success).toBe(true);
	});

	it('accepts grace_days at minimum boundary (1)', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 1 });
		expect(result.success).toBe(true);
	});

	it('accepts grace_days at maximum boundary (365)', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 365 });
		expect(result.success).toBe(true);
	});

	it('rejects grace_days of 0', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 0 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Must be at least 1 day');
		}
	});

	it('rejects negative grace_days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: -1 });
		expect(result.success).toBe(false);
	});

	it('rejects grace_days exceeding 365', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 366 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Must be 365 days or less');
		}
	});

	it('rejects non-integer grace_days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 30.5 });
		expect(result.success).toBe(false);
	});

	it('rejects missing grace_days', () => {
		const result = gracePeriodSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
