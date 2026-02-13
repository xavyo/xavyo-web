import { z } from 'zod/v3';

export const confirmTaskSchema = z.object({
	notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional()
});

export type ConfirmTaskFormData = z.infer<typeof confirmTaskSchema>;

export const rejectTaskSchema = z.object({
	reason: z
		.string()
		.min(5, 'Reason must be at least 5 characters')
		.max(1000, 'Reason must be 1000 characters or less')
});

export type RejectTaskFormData = z.infer<typeof rejectTaskSchema>;

export const configureSemiManualSchema = z.object({
	is_semi_manual: z.boolean(),
	ticketing_config_id: z.string().uuid('Invalid ticketing config ID').optional().nullable(),
	sla_policy_id: z.string().uuid('Invalid SLA policy ID').optional().nullable(),
	requires_approval_before_ticket: z.boolean()
});

export type ConfigureSemiManualFormData = z.infer<typeof configureSemiManualSchema>;

export const createDetectionRuleSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be 100 characters or less'),
	rule_type: z.enum(['no_manager', 'terminated', 'inactive', 'custom']),
	is_enabled: z.boolean(),
	priority: z.number().int().min(1, 'Priority must be at least 1'),
	days_threshold: z.number().int().min(1).optional(),
	expression: z.string().optional(),
	description: z.string().max(500, 'Description must be 500 characters or less').optional()
});

export type CreateDetectionRuleFormData = z.infer<typeof createDetectionRuleSchema>;

export const updateDetectionRuleSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be 100 characters or less')
		.optional(),
	is_enabled: z.boolean().optional(),
	priority: z.number().int().min(1, 'Priority must be at least 1').optional(),
	days_threshold: z.number().int().min(1).optional(),
	expression: z.string().optional(),
	description: z.string().max(500, 'Description must be 500 characters or less').optional()
});

export type UpdateDetectionRuleFormData = z.infer<typeof updateDetectionRuleSchema>;

export const gracePeriodSchema = z.object({
	grace_days: z.number().int().min(1, 'Must be at least 1 day').max(365, 'Must be 365 days or less')
});

export type GracePeriodFormData = z.infer<typeof gracePeriodSchema>;
