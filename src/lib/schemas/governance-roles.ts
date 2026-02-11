import { z } from 'zod/v3';

export const PARAMETER_TYPES = ['string', 'integer', 'boolean', 'date', 'enum'] as const;

export const createRoleSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(2000).optional(),
	parent_id: z.string().uuid().nullable().optional()
});

export const updateRoleSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(2000).optional(),
	is_abstract: z.boolean().optional().default(false),
	version: z.coerce.number().int().min(1)
});

export const moveRoleSchema = z.object({
	parent_id: z.string().uuid().nullable().optional(),
	version: z.coerce.number().int().min(1)
});

export const addRoleEntitlementSchema = z.object({
	entitlement_id: z.string().uuid('Please select an entitlement'),
	role_name: z.string().min(1, 'Role name is required')
});

export const addParameterSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	parameter_type: z.enum(PARAMETER_TYPES),
	description: z.string().max(2000).optional(),
	is_required: z.boolean().optional().default(false),
	default_value: z.string().optional(),
	constraints_json: z.string().optional(),
	display_name: z.string().max(255).optional(),
	display_order: z.coerce.number().int().min(0).optional().default(0)
});

export const updateParameterSchema = z.object({
	description: z.string().max(2000).optional(),
	is_required: z.boolean().optional(),
	default_value: z.string().optional(),
	constraints_json: z.string().optional(),
	display_name: z.string().max(255).optional(),
	display_order: z.coerce.number().int().min(0).optional()
});

export const addInheritanceBlockSchema = z.object({
	entitlement_id: z.string().uuid('Please select an entitlement')
});

export type CreateRoleSchema = typeof createRoleSchema;
export type UpdateRoleSchema = typeof updateRoleSchema;
export type MoveRoleSchema = typeof moveRoleSchema;
export type AddRoleEntitlementSchema = typeof addRoleEntitlementSchema;
export type AddParameterSchema = typeof addParameterSchema;
export type UpdateParameterSchema = typeof updateParameterSchema;
export type AddInheritanceBlockSchema = typeof addInheritanceBlockSchema;
