import { z } from 'zod/v3';

export const OUTLIER_ANALYSIS_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export const OUTLIER_TRIGGER_TYPES = ['scheduled', 'manual', 'api'] as const;
export const OUTLIER_CLASSIFICATIONS = ['normal', 'outlier', 'unclassifiable'] as const;
export const OUTLIER_DISPOSITION_STATUSES = ['new', 'legitimate', 'requires_remediation', 'under_investigation', 'remediated'] as const;
export const OUTLIER_ALERT_TYPES = ['new_outlier', 'score_increase', 'repeated_outlier'] as const;
export const OUTLIER_ALERT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export const updateOutlierConfigSchema = z.object({
	confidence_threshold: z.number().min(0).max(10).optional(),
	frequency_threshold: z.number().min(0).max(1).optional(),
	min_peer_group_size: z.number().int().min(1).max(1000).optional(),
	scoring_weights: z.object({
		role_frequency: z.number().min(0).max(1),
		entitlement_count: z.number().min(0).max(1),
		assignment_pattern: z.number().min(0).max(1),
		peer_group_coverage: z.number().min(0).max(1),
		historical_deviation: z.number().min(0).max(1)
	}).optional(),
	schedule_cron: z.string().min(1).max(100).optional(),
	retention_days: z.number().int().min(1).max(3650).optional(),
	is_enabled: z.boolean().optional()
});

export const triggerAnalysisSchema = z.object({
	triggered_by: z.enum(OUTLIER_TRIGGER_TYPES).default('manual')
});

export const createDispositionSchema = z.object({
	status: z.enum(OUTLIER_DISPOSITION_STATUSES),
	justification: z.string().max(2000).optional(),
	expires_at: z.string().optional()
});

export const generateReportSchema = z.object({
	start_date: z.string().min(1, 'Start date is required'),
	end_date: z.string().min(1, 'End date is required'),
	include_trends: z.boolean().default(true),
	include_peer_breakdown: z.boolean().default(true)
});

export type UpdateOutlierConfigSchema = z.infer<typeof updateOutlierConfigSchema>;
export type TriggerAnalysisSchema = z.infer<typeof triggerAnalysisSchema>;
export type CreateDispositionSchema = z.infer<typeof createDispositionSchema>;
export type GenerateReportSchema = z.infer<typeof generateReportSchema>;
