import { z } from 'zod/v3';

export const CONDITION_OPERATORS = ['equals', 'not_equals', 'in', 'not_in', 'starts_with', 'contains'] as const;
export const EVALUATION_MODES = ['first_match', 'all_match'] as const;
export const LIFECYCLE_EVENT_TYPES = ['joiner', 'mover', 'leaver'] as const;

const policyConditionSchema = z.object({
	attribute: z.string().min(1, 'Attribute is required'),
	operator: z.enum(CONDITION_OPERATORS),
	value: z.union([z.string().min(1, 'Value is required'), z.array(z.string().min(1)).min(1, 'At least one value is required')])
});

export const createBirthrightPolicySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(2000).optional(),
	priority: z.coerce.number().int('Must be an integer').min(0, 'Must be non-negative'),
	conditions: z.array(policyConditionSchema).min(1, 'At least one condition is required'),
	entitlement_ids: z.array(z.string().uuid()).min(1, 'At least one entitlement is required'),
	evaluation_mode: z.enum(EVALUATION_MODES).default('all_match'),
	grace_period_days: z.coerce.number().int('Must be an integer').min(0, 'Must be non-negative').max(365, 'Maximum 365 days').default(7)
});

export const updateBirthrightPolicySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	description: z.string().max(2000).optional(),
	priority: z.coerce.number().int('Must be an integer').min(0).optional(),
	conditions: z.array(policyConditionSchema).min(1, 'At least one condition is required').optional(),
	entitlement_ids: z.array(z.string().uuid()).min(1, 'At least one entitlement is required').optional(),
	evaluation_mode: z.enum(EVALUATION_MODES).optional(),
	grace_period_days: z.coerce.number().int().min(0).max(365).optional()
});

export const simulatePolicySchema = z.object({
	attributes: z.string().min(1, 'Attributes JSON is required').refine(
		(val) => {
			try {
				const parsed = JSON.parse(val);
				return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
			} catch {
				return false;
			}
		},
		{ message: 'Must be a valid JSON object' }
	)
});

export const createLifecycleEventSchema = z.object({
	user_id: z.string().uuid('Must be a valid user ID'),
	event_type: z.enum(LIFECYCLE_EVENT_TYPES),
	attributes_before: z.string().optional().refine(
		(val) => {
			if (!val) return true;
			try {
				const parsed = JSON.parse(val);
				return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
			} catch {
				return false;
			}
		},
		{ message: 'Must be a valid JSON object' }
	),
	attributes_after: z.string().optional().refine(
		(val) => {
			if (!val) return true;
			try {
				const parsed = JSON.parse(val);
				return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
			} catch {
				return false;
			}
		},
		{ message: 'Must be a valid JSON object' }
	),
	source: z.string().default('api')
});

/** Flat schema for superForm — excludes nested conditions/entitlement_ids (managed via hidden fields) */
export const birthrightPolicyFormSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(2000).optional(),
	priority: z.coerce.number().int('Must be an integer').min(0, 'Must be non-negative'),
	evaluation_mode: z.enum(EVALUATION_MODES).default('all_match'),
	grace_period_days: z.coerce.number().int('Must be an integer').min(0, 'Must be non-negative').max(365, 'Maximum 365 days').default(7)
});

export type CreateBirthrightPolicyInput = z.infer<typeof createBirthrightPolicySchema>;
export type UpdateBirthrightPolicyInput = z.infer<typeof updateBirthrightPolicySchema>;
export type SimulatePolicyInput = z.infer<typeof simulatePolicySchema>;
export type CreateLifecycleEventInput = z.infer<typeof createLifecycleEventSchema>;
