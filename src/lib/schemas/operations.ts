import { z } from 'zod/v3';

export const OPERATION_TYPES = ['create', 'update', 'delete'] as const;
export const OPERATION_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'dead_letter', 'awaiting_system', 'resolved', 'cancelled'] as const;
export const DISCREPANCY_TYPES = ['missing', 'orphan', 'mismatch', 'collision', 'unlinked', 'deleted'] as const;
export const REMEDIATION_ACTIONS = ['create', 'update', 'delete', 'link', 'unlink', 'inactivate_identity'] as const;
export const REMEDIATION_DIRECTIONS = ['xavyo_to_target', 'target_to_xavyo'] as const;
export const CONFLICT_OUTCOMES = ['applied', 'superseded', 'merged', 'rejected'] as const;
export const SCHEDULE_FREQUENCIES = ['hourly', 'daily', 'weekly', 'monthly', 'cron'] as const;
export const RECONCILIATION_MODES = ['full', 'delta'] as const;
export const RESOLUTION_STATUSES = ['pending', 'resolved', 'ignored'] as const;

export const resolveOperationSchema = z.object({
	resolution_notes: z.string().optional()
});

export const resolveConflictSchema = z.object({
	outcome: z.enum(CONFLICT_OUTCOMES, { required_error: 'Outcome is required' }),
	notes: z.string().optional()
});

export const triggerRunSchema = z.object({
	mode: z.enum(RECONCILIATION_MODES, { required_error: 'Mode is required' }),
	dry_run: z.boolean().default(false)
});

export const remediateDiscrepancySchema = z.object({
	action: z.enum(REMEDIATION_ACTIONS, { required_error: 'Action is required' }),
	direction: z.enum(REMEDIATION_DIRECTIONS, { required_error: 'Direction is required' }),
	identity_id: z.string().uuid().optional(),
	dry_run: z.boolean().default(false)
});

export const bulkRemediateSchema = z.object({
	action: z.enum(REMEDIATION_ACTIONS, { required_error: 'Action is required' }),
	direction: z.enum(REMEDIATION_DIRECTIONS, { required_error: 'Direction is required' }),
	dry_run: z.boolean().default(false)
});

export const createScheduleSchema = z.object({
	mode: z.enum(RECONCILIATION_MODES, { required_error: 'Mode is required' }),
	frequency: z.enum(SCHEDULE_FREQUENCIES, { required_error: 'Frequency is required' }),
	day_of_week: z.coerce.number().min(0).max(6).optional(),
	day_of_month: z.coerce.number().min(1).max(31).optional(),
	hour_of_day: z.coerce.number().min(0).max(23),
	enabled: z.boolean().default(true)
});
