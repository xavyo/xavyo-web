import { describe, it, expect } from 'vitest';
import {
	createCorrelationRuleSchema,
	updateCorrelationRuleSchema,
	createIdentityCorrelationRuleSchema,
	updateIdentityCorrelationRuleSchema,
	upsertThresholdSchema,
	validateExpressionSchema,
	confirmCaseSchema,
	rejectCaseSchema,
	createIdentityFromCaseSchema,
	reassignCaseSchema
} from './correlation';

describe('createCorrelationRuleSchema', () => {
	const validInput = {
		name: 'Email Match',
		source_attribute: 'email',
		target_attribute: 'email',
		match_type: 'exact' as const,
		threshold: 0.85,
		weight: 1.0,
		tier: 1,
		is_definitive: false,
		normalize: true,
		priority: 10
	};

	it('accepts valid exact rule', () => {
		const result = createCorrelationRuleSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts valid fuzzy rule with algorithm', () => {
		const result = createCorrelationRuleSchema.safeParse({
			...validInput,
			match_type: 'fuzzy',
			algorithm: 'jaro_winkler'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid expression rule with expression', () => {
		const result = createCorrelationRuleSchema.safeParse({
			...validInput,
			match_type: 'expression',
			expression: 'source.email == target.email'
		});
		expect(result.success).toBe(true);
	});

	it('rejects expression type without expression value', () => {
		const result = createCorrelationRuleSchema.safeParse({
			...validInput,
			match_type: 'expression'
		});
		expect(result.success).toBe(false);
	});

	it('rejects fuzzy type without algorithm', () => {
		const result = createCorrelationRuleSchema.safeParse({
			...validInput,
			match_type: 'fuzzy'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const { name, ...rest } = validInput;
		const result = createCorrelationRuleSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects threshold > 1', () => {
		const result = createCorrelationRuleSchema.safeParse({ ...validInput, threshold: 1.5 });
		expect(result.success).toBe(false);
	});

	it('rejects threshold < 0', () => {
		const result = createCorrelationRuleSchema.safeParse({ ...validInput, threshold: -0.1 });
		expect(result.success).toBe(false);
	});

	it('rejects invalid match_type', () => {
		const result = createCorrelationRuleSchema.safeParse({ ...validInput, match_type: 'phonetic' });
		expect(result.success).toBe(false);
	});

	it('coerces string numbers', () => {
		const result = createCorrelationRuleSchema.safeParse({
			...validInput,
			threshold: '0.85',
			weight: '1.0',
			tier: '1',
			priority: '10'
		});
		expect(result.success).toBe(true);
	});
});

describe('updateCorrelationRuleSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateCorrelationRuleSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update', () => {
		const result = updateCorrelationRuleSchema.safeParse({ weight: 2.0, is_active: false });
		expect(result.success).toBe(true);
	});

	it('rejects invalid threshold', () => {
		const result = updateCorrelationRuleSchema.safeParse({ threshold: 5.0 });
		expect(result.success).toBe(false);
	});
});

describe('createIdentityCorrelationRuleSchema', () => {
	const validInput = {
		name: 'Email Similarity',
		attribute: 'email',
		match_type: 'fuzzy' as const,
		algorithm: 'jaro_winkler' as const,
		threshold: 0.85,
		weight: 1.0,
		priority: 10
	};

	it('accepts valid input', () => {
		const result = createIdentityCorrelationRuleSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('rejects missing attribute', () => {
		const { attribute, ...rest } = validInput;
		const result = createIdentityCorrelationRuleSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createIdentityCorrelationRuleSchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});
});

describe('updateIdentityCorrelationRuleSchema', () => {
	it('accepts empty object', () => {
		expect(updateIdentityCorrelationRuleSchema.safeParse({}).success).toBe(true);
	});

	it('accepts partial update', () => {
		expect(updateIdentityCorrelationRuleSchema.safeParse({ weight: 2.0 }).success).toBe(true);
	});
});

describe('upsertThresholdSchema', () => {
	const validInput = {
		auto_confirm_threshold: 0.95,
		manual_review_threshold: 0.7,
		tuning_mode: false,
		include_deactivated: false,
		batch_size: 100
	};

	it('accepts valid thresholds', () => {
		const result = upsertThresholdSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('rejects auto < manual (cross-field)', () => {
		const result = upsertThresholdSchema.safeParse({
			...validInput,
			auto_confirm_threshold: 0.5,
			manual_review_threshold: 0.8
		});
		expect(result.success).toBe(false);
	});

	it('accepts auto == manual', () => {
		const result = upsertThresholdSchema.safeParse({
			...validInput,
			auto_confirm_threshold: 0.8,
			manual_review_threshold: 0.8
		});
		expect(result.success).toBe(true);
	});

	it('rejects threshold > 1', () => {
		const result = upsertThresholdSchema.safeParse({ ...validInput, auto_confirm_threshold: 1.5 });
		expect(result.success).toBe(false);
	});

	it('rejects batch_size < 1', () => {
		const result = upsertThresholdSchema.safeParse({ ...validInput, batch_size: 0 });
		expect(result.success).toBe(false);
	});

	it('coerces string numbers', () => {
		const result = upsertThresholdSchema.safeParse({
			auto_confirm_threshold: '0.95',
			manual_review_threshold: '0.7',
			tuning_mode: false,
			include_deactivated: false,
			batch_size: '100'
		});
		expect(result.success).toBe(true);
	});
});

describe('validateExpressionSchema', () => {
	it('accepts valid expression', () => {
		const result = validateExpressionSchema.safeParse({ expression: 'source.email == target.email' });
		expect(result.success).toBe(true);
	});

	it('accepts expression with test_input', () => {
		const result = validateExpressionSchema.safeParse({
			expression: 'source.email == target.email',
			test_input: {
				source: { email: 'a@b.com' },
				target: { email: 'a@b.com' }
			}
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty expression', () => {
		const result = validateExpressionSchema.safeParse({ expression: '' });
		expect(result.success).toBe(false);
	});
});

describe('confirmCaseSchema', () => {
	it('accepts valid confirm with candidate_id', () => {
		const result = confirmCaseSchema.safeParse({
			candidate_id: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts confirm with reason', () => {
		const result = confirmCaseSchema.safeParse({
			candidate_id: '550e8400-e29b-41d4-a716-446655440000',
			reason: 'Manual verification'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID', () => {
		const result = confirmCaseSchema.safeParse({ candidate_id: 'not-a-uuid' });
		expect(result.success).toBe(false);
	});

	it('rejects missing candidate_id', () => {
		const result = confirmCaseSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('rejectCaseSchema', () => {
	it('accepts valid reject with reason', () => {
		expect(rejectCaseSchema.safeParse({ reason: 'Not a match' }).success).toBe(true);
	});

	it('rejects missing reason', () => {
		expect(rejectCaseSchema.safeParse({}).success).toBe(false);
	});

	it('rejects empty reason', () => {
		expect(rejectCaseSchema.safeParse({ reason: '' }).success).toBe(false);
	});
});

describe('createIdentityFromCaseSchema', () => {
	it('accepts empty (reason optional)', () => {
		expect(createIdentityFromCaseSchema.safeParse({}).success).toBe(true);
	});

	it('accepts with reason', () => {
		expect(createIdentityFromCaseSchema.safeParse({ reason: 'New person' }).success).toBe(true);
	});
});

describe('reassignCaseSchema', () => {
	it('accepts valid reassign', () => {
		const result = reassignCaseSchema.safeParse({
			assigned_to: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID', () => {
		const result = reassignCaseSchema.safeParse({ assigned_to: 'bad' });
		expect(result.success).toBe(false);
	});

	it('rejects missing assigned_to', () => {
		expect(reassignCaseSchema.safeParse({}).success).toBe(false);
	});

	it('accepts with optional reason', () => {
		const result = reassignCaseSchema.safeParse({
			assigned_to: '550e8400-e29b-41d4-a716-446655440000',
			reason: 'Specialist needed'
		});
		expect(result.success).toBe(true);
	});
});
