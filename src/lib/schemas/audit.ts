import { z } from 'zod/v3';

export const loginHistoryFilterSchema = z.object({
	start_date: z.string().optional().default(''),
	end_date: z.string().optional().default(''),
	success: z.enum(['all', 'true', 'false']).optional().default('all')
});

export const adminAuditFilterSchema = z.object({
	user_id: z.string().optional().default(''),
	email: z.string().optional().default(''),
	auth_method: z
		.enum(['all', 'password', 'social', 'sso', 'mfa', 'refresh'])
		.optional()
		.default('all'),
	start_date: z.string().optional().default(''),
	end_date: z.string().optional().default(''),
	success: z.enum(['all', 'true', 'false']).optional().default('all')
});

export const alertFilterSchema = z.object({
	type: z
		.enum(['all', 'new_device', 'new_location', 'failed_attempts', 'password_change', 'mfa_disabled'])
		.optional()
		.default('all'),
	severity: z.enum(['all', 'info', 'warning', 'critical']).optional().default('all'),
	acknowledged: z.enum(['all', 'true', 'false']).optional().default('all')
});

export type LoginHistoryFilterSchema = typeof loginHistoryFilterSchema;
export type AdminAuditFilterSchema = typeof adminAuditFilterSchema;
export type AlertFilterSchema = typeof alertFilterSchema;
