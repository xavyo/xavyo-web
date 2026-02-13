import { z } from 'zod/v3';

export const createA2aTaskSchema = z.object({
	target_agent_id: z.string().uuid('Please select a target agent'),
	task_type: z.string().min(1, 'Task type is required').max(255),
	input: z.string().min(2, 'Input JSON is required'),
	callback_url: z.string().url().optional().or(z.literal('')),
	source_agent_id: z.string().uuid().optional().or(z.literal(''))
});

export const mcpInvokeSchema = z.object({
	parameters: z.string().min(2, 'Parameters JSON is required')
});

export const grantToolPermissionSchema = z.object({
	tool_id: z.string().uuid('Please select a tool'),
	expires_at: z.string().optional().or(z.literal(''))
});

export const grantNhiPermissionSchema = z.object({
	target_id: z.string().uuid('Please select a target NHI'),
	permission_type: z.string().min(1, 'Permission type is required').max(255),
	allowed_actions: z.string().optional().or(z.literal('')),
	max_calls_per_hour: z.coerce.number().int().min(1).optional().or(z.literal('')),
	expires_at: z.string().optional().or(z.literal(''))
});

export const grantUserPermissionSchema = z.object({
	user_id: z.string().uuid('Please select a user')
});

export type CreateA2aTaskSchema = typeof createA2aTaskSchema;
export type McpInvokeSchema = typeof mcpInvokeSchema;
export type GrantToolPermissionSchema = typeof grantToolPermissionSchema;
export type GrantNhiPermissionSchema = typeof grantNhiPermissionSchema;
export type GrantUserPermissionSchema = typeof grantUserPermissionSchema;
