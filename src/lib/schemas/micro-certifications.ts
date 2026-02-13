import { z } from 'zod/v3';

export const decideMicroCertificationSchema = z.object({
	decision: z.enum(['approve', 'revoke', 'reduce', 'delegate']),
	comment: z.string().max(2000).optional()
});

export const delegateMicroCertificationSchema = z.object({
	delegate_to: z.string().uuid('Please provide a valid reviewer ID'),
	comment: z.string().max(2000).optional()
});

export const skipMicroCertificationSchema = z.object({
	reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000)
});

export const bulkDecisionSchema = z.object({
	certification_ids: z.array(z.string().uuid()).min(1, 'Select at least one certification'),
	decision: z.enum(['approve', 'revoke', 'reduce']),
	comment: z.string().max(2000).optional()
});

export const manualTriggerSchema = z.object({
	user_id: z.string().uuid('Please provide a valid user ID'),
	entitlement_id: z.string().uuid('Please provide a valid entitlement ID'),
	trigger_rule_id: z.string().uuid().optional(),
	reviewer_id: z.string().uuid().optional(),
	reason: z.string().min(1, 'Reason is required').max(2000)
});

export const createTriggerRuleSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	trigger_type: z.enum(['high_risk_assignment', 'sod_violation', 'manager_change', 'periodic_recert', 'manual']),
	scope_type: z.enum(['tenant', 'application', 'entitlement']),
	scope_id: z.string().uuid().optional(),
	reviewer_type: z.enum(['user_manager', 'entitlement_owner', 'application_owner', 'specific_user']),
	specific_reviewer_id: z.string().uuid().optional(),
	fallback_reviewer_id: z.string().uuid().optional(),
	timeout_secs: z.coerce.number().int().min(0).optional(),
	reminder_threshold_percent: z.coerce.number().int().min(0).max(100).optional(),
	auto_revoke: z.boolean().default(false),
	revoke_triggering_assignment: z.boolean().default(false),
	is_default: z.boolean().default(false),
	priority: z.coerce.number().int().min(0).optional(),
	metadata: z.record(z.unknown()).optional()
});

export const updateTriggerRuleSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	trigger_type: z.enum(['high_risk_assignment', 'sod_violation', 'manager_change', 'periodic_recert', 'manual']).optional(),
	scope_type: z.enum(['tenant', 'application', 'entitlement']).optional(),
	scope_id: z.string().uuid().optional(),
	reviewer_type: z.enum(['user_manager', 'entitlement_owner', 'application_owner', 'specific_user']).optional(),
	specific_reviewer_id: z.string().uuid().optional(),
	fallback_reviewer_id: z.string().uuid().optional(),
	timeout_secs: z.coerce.number().int().min(0).optional(),
	reminder_threshold_percent: z.coerce.number().int().min(0).max(100).optional(),
	auto_revoke: z.boolean().optional(),
	revoke_triggering_assignment: z.boolean().optional(),
	is_default: z.boolean().optional(),
	priority: z.coerce.number().int().min(0).optional(),
	metadata: z.record(z.unknown()).optional()
});

export const globalEventsSearchSchema = z.object({
	event_type: z.string().optional(),
	actor_id: z.string().uuid().optional(),
	certification_id: z.string().uuid().optional(),
	from_date: z.string().optional(),
	to_date: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0)
});
