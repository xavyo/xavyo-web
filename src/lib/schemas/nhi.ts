import { z } from 'zod/v3';

export const createToolSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	category: z.string().max(100).optional(),
	input_schema: z.string().min(1, 'Input schema is required'),
	output_schema: z.string().optional(),
	requires_approval: z.boolean().optional().default(false),
	max_calls_per_hour: z.coerce.number().int().min(1).optional(),
	provider: z.string().max(255).optional()
});

export const createAgentSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	agent_type: z.string().min(1, 'Agent type is required').max(100),
	model_provider: z.string().max(255).optional(),
	model_name: z.string().max(255).optional(),
	model_version: z.string().max(100).optional(),
	max_token_lifetime_secs: z.coerce.number().int().min(1).optional(),
	requires_human_approval: z.boolean().optional().default(false)
});

export const createServiceAccountSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	purpose: z.string().min(1, 'Purpose is required').max(1000),
	environment: z.string().max(100).optional()
});

export const updateToolSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	category: z.string().max(100).optional(),
	input_schema: z.string().optional(),
	output_schema: z.string().optional(),
	requires_approval: z.boolean().optional(),
	max_calls_per_hour: z.coerce.number().int().min(1).optional(),
	provider: z.string().max(255).optional()
});

export const updateAgentSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	agent_type: z.string().min(1).max(100).optional(),
	model_provider: z.string().max(255).optional(),
	model_name: z.string().max(255).optional(),
	model_version: z.string().max(100).optional(),
	max_token_lifetime_secs: z.coerce.number().int().min(1).optional(),
	requires_human_approval: z.boolean().optional()
});

export const updateServiceAccountSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	purpose: z.string().min(1).max(1000).optional(),
	environment: z.string().max(100).optional()
});

export const issueCredentialSchema = z.object({
	credential_type: z.enum(['api_key', 'secret', 'certificate']),
	valid_days: z.coerce.number().int().min(1).max(3650).optional()
});

export const suspendNhiSchema = z.object({
	reason: z.string().max(1000).optional()
});

export type CreateToolSchema = typeof createToolSchema;
export type CreateAgentSchema = typeof createAgentSchema;
export type CreateServiceAccountSchema = typeof createServiceAccountSchema;
export type UpdateToolSchema = typeof updateToolSchema;
export type UpdateAgentSchema = typeof updateAgentSchema;
export type UpdateServiceAccountSchema = typeof updateServiceAccountSchema;
export type IssueCredentialSchema = typeof issueCredentialSchema;
export type SuspendNhiSchema = typeof suspendNhiSchema;
