import { z } from 'zod/v3';

export const CORRELATION_MATCH_TYPES = ['exact', 'fuzzy', 'expression'] as const;
export const CORRELATION_ALGORITHMS = ['levenshtein', 'jaro_winkler'] as const;

// 1. Create Correlation Rule (connector-scoped)
export const createCorrelationRuleSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	source_attribute: z.string().min(1, 'Source attribute is required').max(255),
	target_attribute: z.string().min(1, 'Target attribute is required').max(255),
	match_type: z.enum(CORRELATION_MATCH_TYPES),
	algorithm: z.enum(CORRELATION_ALGORITHMS).optional(),
	threshold: z.coerce.number().min(0, 'Must be between 0 and 1').max(1, 'Must be between 0 and 1'),
	weight: z.coerce.number().min(0, 'Must be non-negative'),
	expression: z.string().optional(),
	tier: z.coerce.number().int('Must be an integer').min(1, 'Must be at least 1'),
	is_definitive: z.boolean().default(false),
	normalize: z.boolean().default(true),
	priority: z.coerce.number().int('Must be an integer').min(0).default(10)
}).refine(
	(data) => data.match_type !== 'expression' || (data.expression && data.expression.trim().length > 0),
	{ message: 'Expression is required when match type is expression', path: ['expression'] }
).refine(
	(data) => data.match_type !== 'fuzzy' || data.algorithm,
	{ message: 'Algorithm is required when match type is fuzzy', path: ['algorithm'] }
);

// 2. Update Correlation Rule — all fields optional
export const updateCorrelationRuleSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	source_attribute: z.string().min(1).max(255).optional(),
	target_attribute: z.string().min(1).max(255).optional(),
	match_type: z.enum(CORRELATION_MATCH_TYPES).optional(),
	algorithm: z.enum(CORRELATION_ALGORITHMS).nullable().optional(),
	threshold: z.coerce.number().min(0).max(1).optional(),
	weight: z.coerce.number().min(0).optional(),
	expression: z.string().nullable().optional(),
	tier: z.coerce.number().int().min(1).optional(),
	is_definitive: z.boolean().optional(),
	normalize: z.boolean().optional(),
	is_active: z.boolean().optional(),
	priority: z.coerce.number().int().min(0).optional()
});

// 3. Create Identity Correlation Rule (tenant-wide)
export const createIdentityCorrelationRuleSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	attribute: z.string().min(1, 'Attribute is required').max(255),
	match_type: z.enum(CORRELATION_MATCH_TYPES),
	algorithm: z.enum(CORRELATION_ALGORITHMS).optional(),
	threshold: z.coerce.number().min(0, 'Must be between 0 and 1').max(1, 'Must be between 0 and 1'),
	weight: z.coerce.number().min(0, 'Must be non-negative'),
	priority: z.coerce.number().int('Must be an integer').min(0).default(10)
});

// 4. Update Identity Correlation Rule — all fields optional
export const updateIdentityCorrelationRuleSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	attribute: z.string().min(1).max(255).optional(),
	match_type: z.enum(CORRELATION_MATCH_TYPES).optional(),
	algorithm: z.enum(CORRELATION_ALGORITHMS).nullable().optional(),
	threshold: z.coerce.number().min(0).max(1).optional(),
	weight: z.coerce.number().min(0).optional(),
	is_active: z.boolean().optional(),
	priority: z.coerce.number().int().min(0).optional()
});

// 5. Upsert Threshold — cross-field validation: auto >= manual
export const upsertThresholdSchema = z.object({
	auto_confirm_threshold: z.coerce.number().min(0, 'Must be between 0 and 1').max(1, 'Must be between 0 and 1'),
	manual_review_threshold: z.coerce.number().min(0, 'Must be between 0 and 1').max(1, 'Must be between 0 and 1'),
	tuning_mode: z.boolean().default(false),
	include_deactivated: z.boolean().default(false),
	batch_size: z.coerce.number().int('Must be an integer').min(1, 'Must be at least 1').max(10000).default(100)
}).refine(
	(data) => data.auto_confirm_threshold >= data.manual_review_threshold,
	{ message: 'Auto-confirm threshold must be greater than or equal to manual review threshold', path: ['auto_confirm_threshold'] }
);

// 6. Validate Expression
export const validateExpressionSchema = z.object({
	expression: z.string().min(1, 'Expression is required'),
	test_input: z.object({
		source: z.record(z.unknown()),
		target: z.record(z.unknown())
	}).optional()
});

// 7. Confirm Case
export const confirmCaseSchema = z.object({
	candidate_id: z.string().uuid('Invalid candidate ID'),
	reason: z.string().optional()
});

// 8. Reject Case
export const rejectCaseSchema = z.object({
	reason: z.string().min(1, 'Reason is required')
});

// 9. Create Identity from Case
export const createIdentityFromCaseSchema = z.object({
	reason: z.string().optional()
});

// 10. Reassign Case
export const reassignCaseSchema = z.object({
	assigned_to: z.string().uuid('Invalid user ID'),
	reason: z.string().optional()
});
