import { z } from 'zod/v3';

export const CATALOG_ITEM_TYPES = ['role', 'entitlement', 'resource'] as const;
export const CATALOG_ITEM_TYPE_LABELS: Record<string, string> = { role: 'Role', entitlement: 'Entitlement', resource: 'Resource' };
export const FORM_FIELD_TYPES = ['text', 'number', 'select', 'textarea'] as const;

const formFieldSchema = z.object({
	name: z.string().min(1, 'Field name is required'),
	label: z.string().min(1, 'Field label is required'),
	field_type: z.enum(FORM_FIELD_TYPES),
	required: z.boolean().default(false),
	options: z.array(z.string()).optional(),
	placeholder: z.string().optional()
});

const requestabilityRulesSchema = z.object({
	self_request: z.boolean().optional(),
	manager_request: z.boolean().optional(),
	department_restriction: z.array(z.string()).optional(),
	archetype_restriction: z.array(z.string()).optional(),
	prerequisite_roles: z.array(z.string().uuid('Invalid role ID')).optional(),
	prerequisite_entitlements: z.array(z.string().uuid('Invalid entitlement ID')).optional()
});

// Category schemas
export const createCategorySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
	description: z.string().max(2000).optional(),
	parent_id: z.union([z.string().uuid('Invalid parent category ID'), z.literal('')]).optional(),
	icon: z.string().optional(),
	display_order: z.coerce.number().int().min(0).default(0)
});

export const updateCategorySchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	description: z.string().max(2000).nullable().optional(),
	parent_id: z.union([z.string().uuid('Invalid parent category ID'), z.literal('')]).nullable().optional(),
	icon: z.string().nullable().optional(),
	display_order: z.coerce.number().int().min(0).optional()
});

// Catalog item schemas
export const createCatalogItemSchema = z.object({
	category_id: z.union([z.string().uuid('Invalid category ID'), z.literal('')]).optional(),
	item_type: z.enum(CATALOG_ITEM_TYPES, { errorMap: () => ({ message: 'Item type must be role, entitlement, or resource' }) }),
	name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
	description: z.string().max(10000).optional(),
	reference_id: z.string().uuid('Invalid reference ID').optional(),
	requestability_rules: requestabilityRulesSchema.optional(),
	form_fields: z.array(formFieldSchema).optional(),
	tags: z.string().optional()
});

export const updateCatalogItemSchema = z.object({
	category_id: z.union([z.string().uuid('Invalid category ID'), z.literal('')]).nullable().optional(),
	item_type: z.enum(CATALOG_ITEM_TYPES).optional(),
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(10000).nullable().optional(),
	reference_id: z.string().uuid('Invalid reference ID').nullable().optional(),
	requestability_rules: requestabilityRulesSchema.nullable().optional(),
	form_fields: z.array(formFieldSchema).optional(),
	tags: z.string().optional()
});

// Cart schemas
export const addToCartSchema = z.object({
	catalog_item_id: z.string().uuid('Invalid catalog item ID'),
	beneficiary_id: z.string().uuid('Invalid beneficiary ID').optional(),
	parameters: z.record(z.unknown()).optional(),
	form_values: z.record(z.unknown()).optional()
});

export const updateCartItemSchema = z.object({
	parameters: z.record(z.unknown()).optional(),
	form_values: z.record(z.unknown()).optional()
});

export const submitCartSchema = z.object({
	beneficiary_id: z.string().uuid('Invalid beneficiary ID').optional(),
	global_justification: z.string().max(5000, 'Justification must be 5000 characters or less').optional()
});
