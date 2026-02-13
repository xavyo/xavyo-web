import { z } from 'zod/v3';

export const TICKETING_TYPES = ['service_now', 'jira', 'webhook'] as const;

export const BULK_ACTION_TYPES = [
	'assign_role',
	'revoke_role',
	'enable',
	'disable',
	'modify_attribute'
] as const;

// 1. Create SLA Policy
export const createSlaPolicySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	target_duration_seconds: z.coerce
		.number()
		.int('Must be an integer')
		.min(60, 'Minimum 60 seconds')
		.max(604800, 'Maximum 604800 seconds (7 days)'),
	warning_threshold_percent: z.coerce
		.number()
		.int('Must be an integer')
		.min(1, 'Minimum 1%')
		.max(100, 'Maximum 100%')
		.default(75),
	breach_notification_enabled: z.boolean().default(true),
	escalation_contacts: z.string().optional()
});

// 2. Update SLA Policy — all fields optional
export const updateSlaPolicySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	description: z.string().max(1000).optional(),
	target_duration_seconds: z.coerce
		.number()
		.int('Must be an integer')
		.min(60, 'Minimum 60 seconds')
		.max(604800, 'Maximum 604800 seconds (7 days)')
		.optional(),
	warning_threshold_percent: z.coerce
		.number()
		.int('Must be an integer')
		.min(1, 'Minimum 1%')
		.max(100, 'Maximum 100%')
		.optional(),
	breach_notification_enabled: z.boolean().optional(),
	escalation_contacts: z.string().optional()
});

// 3. Create Ticketing Config
export const createTicketingConfigSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	ticketing_type: z.enum(TICKETING_TYPES),
	endpoint_url: z.string().url('Must be a valid URL'),
	credentials: z.string().min(1, 'Credentials are required'),
	field_mappings: z.string().optional(),
	default_assignee: z.string().optional(),
	default_assignment_group: z.string().optional(),
	project_key: z.string().optional(),
	issue_type: z.string().optional(),
	polling_interval_seconds: z.coerce
		.number()
		.int('Must be an integer')
		.min(60, 'Minimum 60 seconds')
		.max(3600, 'Maximum 3600 seconds')
		.default(300)
});

// 4. Update Ticketing Config — all fields optional
export const updateTicketingConfigSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	endpoint_url: z.string().url('Must be a valid URL').optional(),
	credentials: z.string().min(1, 'Credentials are required').optional(),
	field_mappings: z.string().optional(),
	default_assignee: z.string().optional(),
	default_assignment_group: z.string().optional(),
	project_key: z.string().optional(),
	issue_type: z.string().optional(),
	polling_interval_seconds: z.coerce
		.number()
		.int('Must be an integer')
		.min(60, 'Minimum 60 seconds')
		.max(3600, 'Maximum 3600 seconds')
		.optional(),
	is_active: z.boolean().optional()
});

// 5. Create Bulk Action
export const createBulkActionSchema = z.object({
	filter_expression: z.string().min(1, 'Filter expression is required').max(10000),
	action_type: z.enum(BULK_ACTION_TYPES),
	action_params: z.string().min(2, 'Action params JSON is required'),
	justification: z.string().min(10, 'Justification must be at least 10 characters').max(2000)
});

// 5b. Update Bulk Action
export const updateBulkActionSchema = z.object({
	filter_expression: z.string().min(1, 'Filter expression is required').max(10000),
	action_type: z.enum(BULK_ACTION_TYPES),
	action_params: z.string().min(2, 'Action params JSON is required'),
	justification: z.string().min(10, 'Justification must be at least 10 characters').max(2000)
});

// 6. Validate Expression
export const validateExpressionSchema = z.object({
	expression: z.string().min(1, 'Expression is required').max(10000)
});

// 7. Create Bulk Operation
export const createBulkOperationSchema = z.object({
	transition_id: z.string().uuid('Must be a valid UUID'),
	object_ids: z.string().min(1, 'Object IDs are required')
});

// Schema types for Superforms
export type CreateSlaPolicySchema = typeof createSlaPolicySchema;
export type UpdateSlaPolicySchema = typeof updateSlaPolicySchema;
export type CreateTicketingConfigSchema = typeof createTicketingConfigSchema;
export type UpdateTicketingConfigSchema = typeof updateTicketingConfigSchema;
export type CreateBulkActionSchema = typeof createBulkActionSchema;
export type UpdateBulkActionSchema = typeof updateBulkActionSchema;
export type ValidateExpressionSchema = typeof validateExpressionSchema;
export type CreateBulkOperationSchema = typeof createBulkOperationSchema;

// Inferred input types
export type CreateSlaPolicyInput = z.infer<typeof createSlaPolicySchema>;
export type UpdateSlaPolicyInput = z.infer<typeof updateSlaPolicySchema>;
export type CreateTicketingConfigInput = z.infer<typeof createTicketingConfigSchema>;
export type UpdateTicketingConfigInput = z.infer<typeof updateTicketingConfigSchema>;
export type CreateBulkActionInput = z.infer<typeof createBulkActionSchema>;
export type UpdateBulkActionInput = z.infer<typeof updateBulkActionSchema>;
export type ValidateExpressionInput = z.infer<typeof validateExpressionSchema>;
export type CreateBulkOperationInput = z.infer<typeof createBulkOperationSchema>;
