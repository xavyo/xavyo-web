import { z } from 'zod/v3';

export const POLICY_CONDITION_OPERATORS = ['equals', 'not_equals', 'in', 'not_in', 'starts_with', 'contains'] as const;
export const EVALUATION_MODES = ['first_match', 'all_match'] as const;

const policyConditionSchema = z.object({
	attribute: z.string().min(1, 'Attribute is required'),
	operator: z.enum(POLICY_CONDITION_OPERATORS, { errorMap: () => ({ message: 'Invalid operator' }) }),
	value: z.unknown().refine((v) => v !== undefined && v !== null, 'Value is required')
});

export const createBirthrightPolicySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
	description: z.string().max(2000).optional(),
	priority: z.coerce.number().int('Must be an integer').min(0, 'Priority must be non-negative'),
	conditions: z.array(policyConditionSchema).min(1, 'At least one condition is required'),
	entitlement_ids: z.array(z.string().uuid('Invalid entitlement ID')).min(1, 'At least one entitlement is required'),
	evaluation_mode: z.enum(EVALUATION_MODES).default('all_match'),
	grace_period_days: z.coerce.number().int().min(0).max(365, 'Grace period must be 365 days or less').optional()
});

export const updateBirthrightPolicySchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(2000).nullable().optional(),
	priority: z.coerce.number().int().min(0).optional(),
	conditions: z.array(policyConditionSchema).min(1).optional(),
	entitlement_ids: z.array(z.string().uuid('Invalid entitlement ID')).min(1).optional(),
	evaluation_mode: z.enum(EVALUATION_MODES).optional(),
	grace_period_days: z.coerce.number().int().min(0).max(365).optional()
});

export const simulatePolicySchema = z.object({
	attributes: z.record(z.unknown()).refine(
		(obj) => Object.keys(obj).length > 0,
		'At least one attribute is required'
	)
});
