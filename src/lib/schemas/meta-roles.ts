import { z } from 'zod/v3';

export const CRITERIA_FIELDS = [
	'risk_level',
	'application_id',
	'owner_id',
	'status',
	'name',
	'is_delegable',
	'metadata'
] as const;

export const CRITERIA_OPERATORS = [
	'eq',
	'neq',
	'in',
	'not_in',
	'gt',
	'gte',
	'lt',
	'lte',
	'contains',
	'starts_with'
] as const;

export const PERMISSION_TYPES = ['grant', 'deny'] as const;

export const CONSTRAINT_TYPES = [
	'max_session_duration',
	'require_mfa',
	'ip_whitelist',
	'approval_required'
] as const;

export const SIMULATION_TYPES = [
	'create',
	'update',
	'delete',
	'criteria_change',
	'enable',
	'disable'
] as const;

export const RESOLUTION_STATUSES = ['resolved_priority', 'resolved_manual', 'ignored'] as const;

export const createMetaRoleSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(2000).optional(),
	priority: z.coerce.number().int().min(1, 'Priority must be at least 1').max(1000, 'Priority must be at most 1000'),
	criteria_logic: z.enum(['and', 'or']).optional().default('and')
});

export const updateMetaRoleSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	description: z.string().max(2000).optional(),
	priority: z.coerce.number().int().min(1).max(1000).optional(),
	criteria_logic: z.enum(['and', 'or']).optional()
});

export const addCriterionSchema = z.object({
	field: z.enum(CRITERIA_FIELDS, { errorMap: () => ({ message: 'Please select a field' }) }),
	operator: z.enum(CRITERIA_OPERATORS, { errorMap: () => ({ message: 'Please select an operator' }) }),
	value: z.string().min(1, 'Value is required')
});

export const addEntitlementSchema = z.object({
	entitlement_id: z.string().uuid('Please select an entitlement'),
	permission_type: z.enum(PERMISSION_TYPES).optional().default('grant')
});

export const addConstraintSchema = z.object({
	constraint_type: z.enum(CONSTRAINT_TYPES, { errorMap: () => ({ message: 'Please select a constraint type' }) }),
	constraint_value: z.string().min(1, 'Value is required')
});

export const resolveConflictSchema = z.object({
	resolution_status: z.enum(RESOLUTION_STATUSES, { errorMap: () => ({ message: 'Please select a resolution strategy' }) }),
	resolution_choice: z.string().optional(),
	comment: z.string().max(2000).optional()
});

export const simulateSchema = z.object({
	simulation_type: z.enum(SIMULATION_TYPES, { errorMap: () => ({ message: 'Please select a simulation type' }) }),
	criteria_changes: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(1000).optional().default(100)
});

export const cascadeSchema = z.object({
	dry_run: z.boolean().optional().default(false)
});

export type CreateMetaRoleSchema = typeof createMetaRoleSchema;
export type UpdateMetaRoleSchema = typeof updateMetaRoleSchema;
export type AddCriterionSchema = typeof addCriterionSchema;
export type AddEntitlementSchema = typeof addEntitlementSchema;
export type AddConstraintSchema = typeof addConstraintSchema;
export type ResolveConflictSchema = typeof resolveConflictSchema;
export type SimulateSchema = typeof simulateSchema;
export type CascadeSchema = typeof cascadeSchema;
