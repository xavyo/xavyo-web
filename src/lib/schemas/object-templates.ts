import { z } from 'zod/v3';

// --- Template Rules ---

export const createTemplateRuleSchema = z.object({
	rule_type: z.enum(['default', 'computed', 'validation', 'normalization']),
	target_attribute: z.string().min(1, 'Target attribute is required').max(255),
	expression: z.string().min(1, 'Expression is required'),
	strength: z.enum(['strong', 'normal', 'weak']).default('normal'),
	authoritative: z.boolean().default(true),
	priority: z.coerce.number().int().min(1).max(1000).default(100),
	condition: z.string().optional(),
	error_message: z.string().max(500).optional(),
	exclusive: z.boolean().default(false)
});

export const updateTemplateRuleSchema = z.object({
	expression: z.string().min(1, 'Expression is required').optional(),
	strength: z.enum(['strong', 'normal', 'weak']).optional(),
	authoritative: z.boolean().optional(),
	priority: z.coerce.number().int().min(1).max(1000).optional(),
	condition: z.string().optional(),
	error_message: z.string().max(500).optional(),
	exclusive: z.boolean().optional()
});

// --- Template Scopes ---

export const createTemplateScopeSchema = z.object({
	scope_type: z.enum(['global', 'organization', 'category', 'condition']),
	scope_value: z.string().max(500).optional(),
	condition: z.string().optional()
});

// --- Merge Policy ---

export const createMergePolicySchema = z.object({
	attribute: z.string().min(1, 'Attribute is required').max(255),
	strategy: z.enum([
		'source_precedence',
		'timestamp_wins',
		'concatenate_unique',
		'first_wins',
		'manual_only'
	]),
	source_precedence: z.array(z.string()).optional(),
	null_handling: z.enum(['merge', 'preserve_empty']).default('merge')
});

// --- Simulation ---

export const simulateTemplateSchema = z.object({
	sample_object: z.string().min(1, 'Sample object JSON is required'),
	limit: z.coerce.number().int().min(1).default(100).optional()
});

// --- Object Templates (used with Superforms) ---

export const createObjectTemplateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(2000).optional(),
	object_type: z.enum(['user', 'role', 'entitlement', 'application']),
	priority: z.coerce.number().int().min(1).max(1000).default(100),
	parent_template_id: z
		.string()
		.uuid('Must be a valid UUID')
		.optional()
		.or(z.literal('')),
	rules: z.array(createTemplateRuleSchema).optional(),
	scopes: z.array(createTemplateScopeSchema).optional()
});

export const updateObjectTemplateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	description: z.string().max(2000).optional(),
	priority: z.coerce.number().int().min(1).max(1000).optional(),
	parent_template_id: z
		.string()
		.uuid('Must be a valid UUID')
		.optional()
		.or(z.literal(''))
});

// --- Exported Types ---

export type CreateObjectTemplateInput = z.infer<typeof createObjectTemplateSchema>;
export type UpdateObjectTemplateInput = z.infer<typeof updateObjectTemplateSchema>;
export type CreateTemplateRuleInput = z.infer<typeof createTemplateRuleSchema>;
export type UpdateTemplateRuleInput = z.infer<typeof updateTemplateRuleSchema>;
export type CreateTemplateScopeInput = z.infer<typeof createTemplateScopeSchema>;
export type CreateMergePolicyInput = z.infer<typeof createMergePolicySchema>;
export type SimulateTemplateInput = z.infer<typeof simulateTemplateSchema>;
