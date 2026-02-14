import { z } from 'zod/v3';

export const createRiskFactorSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	category: z.enum(['static', 'dynamic']),
	factor_type: z.string().min(1, 'Factor type is required').max(50),
	weight: z.coerce.number().min(0).max(10),
	description: z.string().max(1000).optional(),
	is_enabled: z.boolean().optional().default(true)
});

export const updateRiskFactorSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	category: z.enum(['static', 'dynamic']).optional(),
	factor_type: z.string().min(1).max(50).optional(),
	weight: z.coerce.number().min(0).max(10).optional(),
	description: z.string().max(1000).optional(),
	is_enabled: z.boolean().optional()
});

export const createRiskThresholdSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	score_value: z.coerce.number().min(1).max(100),
	severity: z.enum(['info', 'warning', 'critical']),
	action: z.enum(['alert', 'require_mfa', 'block']).optional(),
	cooldown_hours: z.coerce.number().min(1).max(720).optional(),
	is_enabled: z.boolean().optional().default(true)
});

export const updateRiskThresholdSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	score_value: z.coerce.number().min(1).max(100).optional(),
	severity: z.enum(['info', 'warning', 'critical']).optional(),
	action: z.enum(['alert', 'require_mfa', 'block']).optional(),
	cooldown_hours: z.coerce.number().min(1).max(720).optional(),
	is_enabled: z.boolean().optional()
});

export type CreateRiskFactorSchema = typeof createRiskFactorSchema;
export type UpdateRiskFactorSchema = typeof updateRiskFactorSchema;
export type CreateRiskThresholdSchema = typeof createRiskThresholdSchema;
export type UpdateRiskThresholdSchema = typeof updateRiskThresholdSchema;
