import { z } from 'zod/v3';

export const createConditionSchema = z.object({
	condition_type: z.enum(['time_window', 'user_attribute', 'entitlement_check']),
	attribute_path: z.string().optional().default(''),
	operator: z.enum(['equals', 'not_equals', 'contains', 'in_list']).optional(),
	value: z.string().min(1, 'Value is required')
});

export const createPolicySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional().default(''),
	effect: z.enum(['allow', 'deny']),
	priority: z.coerce.number().int().min(0).max(10000).optional().default(100),
	resource_type: z.string().min(1, 'Resource type is required'),
	action: z.string().min(1, 'Action is required')
});

export const updatePolicySchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	effect: z.enum(['allow', 'deny']).optional(),
	priority: z.coerce.number().int().min(0).max(10000).optional(),
	resource_type: z.string().min(1).optional(),
	action: z.string().min(1).optional()
});

export const createMappingSchema = z.object({
	entitlement_id: z.string().uuid('Must be a valid UUID'),
	action: z.string().min(1, 'Action is required'),
	resource_type: z.string().min(1, 'Resource type is required')
});

export const authCheckSchema = z.object({
	user_id: z.string().uuid('Must be a valid UUID'),
	action: z.string().min(1, 'Action is required'),
	resource_type: z.string().min(1, 'Resource type is required'),
	resource_id: z
		.union([z.string().uuid(), z.literal('')])
		.optional()
		.default('')
});

export const explainNhiSchema = z.object({
	nhi_id: z.string().uuid('Must be a valid UUID'),
	action: z.string().min(1, 'Action is required').default('create'),
	resource_type: z.string().min(1, 'Resource type is required').default('mcp')
});

export type CreateConditionSchema = typeof createConditionSchema;
export type CreatePolicySchema = typeof createPolicySchema;
export type UpdatePolicySchema = typeof updatePolicySchema;
export type CreateMappingSchema = typeof createMappingSchema;
export type AuthCheckSchema = typeof authCheckSchema;
export type ExplainNhiSchema = typeof explainNhiSchema;
