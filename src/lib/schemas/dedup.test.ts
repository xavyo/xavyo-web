import { describe, it, expect } from 'vitest';
import {
	dismissDuplicateSchema,
	runDetectionSchema,
	mergeExecuteSchema,
	batchMergeSchema
} from './dedup';

describe('dismissDuplicateSchema', () => {
	it('accepts valid reason', () => {
		const result = dismissDuplicateSchema.safeParse({ reason: 'Different people' });
		expect(result.success).toBe(true);
	});

	it('rejects empty reason', () => {
		const result = dismissDuplicateSchema.safeParse({ reason: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing reason', () => {
		const result = dismissDuplicateSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('runDetectionSchema', () => {
	it('accepts valid confidence', () => {
		const result = runDetectionSchema.safeParse({ min_confidence: 70 });
		expect(result.success).toBe(true);
	});

	it('accepts empty confidence (optional)', () => {
		const result = runDetectionSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts empty string confidence (form field)', () => {
		const result = runDetectionSchema.safeParse({ min_confidence: '' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.min_confidence).toBeUndefined();
		}
	});

	it('rejects confidence below 0', () => {
		const result = runDetectionSchema.safeParse({ min_confidence: -1 });
		expect(result.success).toBe(false);
	});

	it('rejects confidence above 100', () => {
		const result = runDetectionSchema.safeParse({ min_confidence: 101 });
		expect(result.success).toBe(false);
	});
});

describe('mergeExecuteSchema', () => {
	const validUuidA = '11111111-1111-1111-1111-111111111111';
	const validUuidB = '22222222-2222-2222-2222-222222222222';

	it('accepts valid merge params', () => {
		const result = mergeExecuteSchema.safeParse({
			source_identity_id: validUuidA,
			target_identity_id: validUuidB,
			entitlement_strategy: 'union'
		});
		expect(result.success).toBe(true);
	});

	it('rejects matching source and target', () => {
		const result = mergeExecuteSchema.safeParse({
			source_identity_id: validUuidA,
			target_identity_id: validUuidA,
			entitlement_strategy: 'union'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toContain('target_identity_id');
		}
	});

	it('rejects missing strategy', () => {
		const result = mergeExecuteSchema.safeParse({
			source_identity_id: validUuidA,
			target_identity_id: validUuidB
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid strategy', () => {
		const result = mergeExecuteSchema.safeParse({
			source_identity_id: validUuidA,
			target_identity_id: validUuidB,
			entitlement_strategy: 'invalid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid uuid', () => {
		const result = mergeExecuteSchema.safeParse({
			source_identity_id: 'not-a-uuid',
			target_identity_id: validUuidB,
			entitlement_strategy: 'union'
		});
		expect(result.success).toBe(false);
	});

	it('accepts optional sod_override_reason', () => {
		const result = mergeExecuteSchema.safeParse({
			source_identity_id: validUuidA,
			target_identity_id: validUuidB,
			entitlement_strategy: 'intersection',
			sod_override_reason: 'Approved by manager'
		});
		expect(result.success).toBe(true);
	});
});

describe('batchMergeSchema', () => {
	const validUuid = '11111111-1111-1111-1111-111111111111';

	it('accepts valid batch params', () => {
		const result = batchMergeSchema.safeParse({
			candidate_ids: [validUuid],
			entitlement_strategy: 'union',
			attribute_rule: 'newest_wins',
			skip_sod_violations: false
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty candidate_ids', () => {
		const result = batchMergeSchema.safeParse({
			candidate_ids: [],
			entitlement_strategy: 'union',
			attribute_rule: 'newest_wins',
			skip_sod_violations: false
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid attribute_rule', () => {
		const result = batchMergeSchema.safeParse({
			candidate_ids: [validUuid],
			entitlement_strategy: 'union',
			attribute_rule: 'invalid_rule',
			skip_sod_violations: false
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid attribute rules', () => {
		for (const rule of ['newest_wins', 'oldest_wins', 'prefer_non_null']) {
			const result = batchMergeSchema.safeParse({
				candidate_ids: [validUuid],
				entitlement_strategy: 'union',
				attribute_rule: rule,
				skip_sod_violations: false
			});
			expect(result.success).toBe(true);
		}
	});

	it('defaults skip_sod_violations to false', () => {
		const result = batchMergeSchema.safeParse({
			candidate_ids: [validUuid],
			entitlement_strategy: 'union',
			attribute_rule: 'newest_wins'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.skip_sod_violations).toBe(false);
		}
	});

	it('accepts optional min_confidence', () => {
		const result = batchMergeSchema.safeParse({
			candidate_ids: [validUuid],
			entitlement_strategy: 'union',
			attribute_rule: 'newest_wins',
			min_confidence: 80
		});
		expect(result.success).toBe(true);
	});
});
