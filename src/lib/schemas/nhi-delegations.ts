import { z } from 'zod/v3';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createDelegationSchema = z.object({
	principal_id: z.string().regex(UUID_REGEX, 'Must be a valid UUID'),
	principal_type: z.enum(['user', 'nhi']),
	actor_nhi_id: z.string().regex(UUID_REGEX, 'Must be a valid UUID'),
	allowed_scopes: z.string().optional().default(''),
	allowed_resource_types: z.string().optional().default(''),
	max_delegation_depth: z.coerce.number().min(1).max(5).optional(),
	expires_at: z.string().optional().default('')
});

export type CreateDelegationFormData = z.infer<typeof createDelegationSchema>;

export const DELEGATION_STATUSES = ['active', 'expired', 'revoked'] as const;
