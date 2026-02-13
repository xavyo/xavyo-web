import { z } from 'zod/v3';

export const dismissDuplicateSchema = z.object({
	reason: z.string().min(1, 'Reason is required')
});

export const runDetectionSchema = z.object({
	min_confidence: z.preprocess(
		(v) => (v === '' || v === undefined ? undefined : v),
		z.coerce.number().min(0).max(100).optional()
	)
});

export const mergeExecuteSchema = z
	.object({
		source_identity_id: z.string().uuid('Invalid source identity'),
		target_identity_id: z.string().uuid('Invalid target identity'),
		entitlement_strategy: z.enum(['union', 'intersection', 'manual'], {
			required_error: 'Entitlement strategy is required'
		}),
		attribute_selections: z.string().optional(),
		entitlement_selections: z.string().optional(),
		sod_override_reason: z.string().optional()
	})
	.refine((data) => data.source_identity_id !== data.target_identity_id, {
		message: 'Source and target identities must be different',
		path: ['target_identity_id']
	});

export const batchMergeSchema = z.object({
	candidate_ids: z.array(z.string().uuid()).min(1, 'At least one candidate is required'),
	entitlement_strategy: z.enum(['union', 'intersection', 'manual'], {
		required_error: 'Entitlement strategy is required'
	}),
	attribute_rule: z.enum(['newest_wins', 'oldest_wins', 'prefer_non_null'], {
		required_error: 'Attribute resolution rule is required'
	}),
	min_confidence: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().min(0).max(100).optional()
	),
	skip_sod_violations: z.boolean().default(false)
});
