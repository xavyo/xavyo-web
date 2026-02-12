import { z } from 'zod/v3';

export const POA_STATUSES = ['pending', 'active', 'expired', 'revoked'] as const;
export const POA_EVENT_TYPES = ['granted', 'activated', 'assumed', 'dropped', 'extended', 'revoked', 'expired'] as const;

export const grantPoaSchema = z.object({
	attorney_id: z.string().uuid('Must be a valid user ID'),
	scope_application_ids: z.string().default(''),
	scope_workflow_types: z.string().default(''),
	starts_at: z.string().min(1, 'Start date is required'),
	ends_at: z.string().min(1, 'End date is required'),
	reason: z.string().min(1, 'Reason is required').max(2000)
});

export const revokePoaSchema = z.object({
	reason: z.string().max(2000).optional()
});

export const extendPoaSchema = z.object({
	new_ends_at: z.string().min(1, 'New end date is required')
});

export type GrantPoaInput = z.infer<typeof grantPoaSchema>;
export type RevokePoaInput = z.infer<typeof revokePoaSchema>;
export type ExtendPoaInput = z.infer<typeof extendPoaSchema>;
