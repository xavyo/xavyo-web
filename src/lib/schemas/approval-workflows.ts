import { z } from 'zod/v3';

export const createWorkflowSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional()
});

export const updateWorkflowSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional()
});

export const addStepSchema = z.object({
	approver_type: z.enum(['manager', 'entitlement_owner', 'specific_users'], {
		required_error: 'Please select an approver type'
	}),
	specific_approvers: z.string().optional()
});

export const createGroupSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional()
});

export const updateGroupSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional()
});

export const addMemberSchema = z.object({
	user_id: z.string().uuid('Please select a user')
});

export const createEscalationPolicySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	default_timeout_secs: z.coerce.number().int().min(60, 'Timeout must be at least 60 seconds'),
	warning_threshold_secs: z.coerce.number().int().min(60).optional(),
	final_fallback: z.enum(['escalate_admin', 'auto_approve', 'auto_reject', 'remain_pending'], {
		required_error: 'Please select a final fallback action'
	})
});

export const updateEscalationPolicySchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	default_timeout_secs: z.coerce.number().int().min(60).optional(),
	warning_threshold_secs: z.coerce.number().int().min(60).optional(),
	final_fallback: z
		.enum(['escalate_admin', 'auto_approve', 'auto_reject', 'remain_pending'])
		.optional()
});

export const addLevelSchema = z.object({
	level_order: z.coerce.number().int().min(1).max(10),
	level_name: z.string().max(255).optional(),
	timeout_secs: z.coerce.number().int().min(60, 'Timeout must be at least 60 seconds'),
	target_type: z.enum(
		['specific_user', 'approval_group', 'manager', 'manager_chain', 'tenant_admin'],
		{ required_error: 'Please select a target type' }
	),
	target_id: z.string().uuid().optional(),
	manager_chain_depth: z.coerce.number().int().min(1).max(10).optional()
});

export const createExemptionSchema = z.object({
	rule_id: z.string().uuid('Please select a SoD rule'),
	user_id: z.string().uuid('Please select a user'),
	justification: z.string().min(10, 'Justification must be at least 10 characters').max(2000),
	expires_at: z.string().min(1, 'Expiration date is required')
});

export type CreateWorkflowSchema = typeof createWorkflowSchema;
export type UpdateWorkflowSchema = typeof updateWorkflowSchema;
export type AddStepSchema = typeof addStepSchema;
export type CreateGroupSchema = typeof createGroupSchema;
export type UpdateGroupSchema = typeof updateGroupSchema;
export type AddMemberSchema = typeof addMemberSchema;
export type CreateEscalationPolicySchema = typeof createEscalationPolicySchema;
export type UpdateEscalationPolicySchema = typeof updateEscalationPolicySchema;
export type AddLevelSchema = typeof addLevelSchema;
export type CreateExemptionSchema = typeof createExemptionSchema;
