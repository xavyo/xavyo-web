import { z } from 'zod/v3';

export const createEntitlementSchema = z.object({
	application_id: z.string().uuid('Please select an application'),
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(2000).optional(),
	risk_level: z.enum(['low', 'medium', 'high', 'critical']),
	data_protection_classification: z.enum(['none', 'personal', 'sensitive', 'special_category']),
	legal_basis: z
		.enum([
			'consent',
			'contract',
			'legal_obligation',
			'vital_interest',
			'public_task',
			'legitimate_interest'
		])
		.optional(),
	is_delegable: z.boolean().optional().default(true),
	retention_period_days: z.coerce.number().int().min(1).optional(),
	data_controller: z.string().max(500).optional(),
	data_processor: z.string().max(500).optional(),
	purposes: z.string().optional()
});

export const updateEntitlementSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(2000).optional(),
	risk_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
	data_protection_classification: z
		.enum(['none', 'personal', 'sensitive', 'special_category'])
		.optional(),
	legal_basis: z
		.enum([
			'consent',
			'contract',
			'legal_obligation',
			'vital_interest',
			'public_task',
			'legitimate_interest'
		])
		.optional(),
	is_delegable: z.boolean().optional(),
	retention_period_days: z.coerce.number().int().min(1).optional(),
	data_controller: z.string().max(500).optional(),
	data_processor: z.string().max(500).optional(),
	purposes: z.string().optional()
});

export const createSodRuleSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	first_entitlement_id: z.string().uuid(),
	second_entitlement_id: z.string().uuid(),
	severity: z.enum(['low', 'medium', 'high', 'critical']),
	business_rationale: z.string().max(2000).optional()
});

export const updateSodRuleSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	first_entitlement_id: z.string().uuid().optional(),
	second_entitlement_id: z.string().uuid().optional(),
	severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
	business_rationale: z.string().max(2000).optional()
});

export const createCampaignSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().optional(),
	scope_type: z.enum(['all_users', 'department', 'application', 'entitlement']),
	scope_config_department: z.string().optional(),
	scope_config_application_id: z.string().optional(),
	scope_config_entitlement_id: z.string().optional(),
	reviewer_type: z.enum([
		'user_manager',
		'application_owner',
		'entitlement_owner',
		'specific_users'
	]),
	deadline: z.string().min(1, 'Deadline is required')
});

export const createAccessRequestSchema = z.object({
	entitlement_id: z.string().uuid(),
	justification: z.string().min(20, 'Justification must be at least 20 characters'),
	requested_expires_at: z.string().optional()
});

export const approveRequestSchema = z.object({
	notes: z.string().optional()
});

export const rejectRequestSchema = z.object({
	reason: z.string().min(1, 'Reason is required')
});

export const certificationDecisionSchema = z.object({
	decision: z.enum(['approved', 'revoked']),
	notes: z.string().optional()
});

export type CreateEntitlementSchema = typeof createEntitlementSchema;
export type UpdateEntitlementSchema = typeof updateEntitlementSchema;
export type CreateSodRuleSchema = typeof createSodRuleSchema;
export type UpdateSodRuleSchema = typeof updateSodRuleSchema;
export type CreateCampaignSchema = typeof createCampaignSchema;
export type CreateAccessRequestSchema = typeof createAccessRequestSchema;
export type ApproveRequestSchema = typeof approveRequestSchema;
export type RejectRequestSchema = typeof rejectRequestSchema;
export type CertificationDecisionSchema = typeof certificationDecisionSchema;
