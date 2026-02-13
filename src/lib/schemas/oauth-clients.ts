import { z } from 'zod/v3';

export const GRANT_TYPES = [
	'authorization_code',
	'client_credentials',
	'refresh_token',
	'implicit'
] as const;
export const CLIENT_TYPES = ['confidential', 'public'] as const;

export const createOAuthClientSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	client_type: z.enum(CLIENT_TYPES),
	redirect_uris: z.string().min(1, 'At least one redirect URI is required'),
	grant_types: z.string().min(1, 'At least one grant type is required'),
	scopes: z.string().min(1, 'At least one scope is required')
});

export const updateOAuthClientSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	redirect_uris: z.string().optional(),
	grant_types: z.string().optional(),
	scopes: z.string().optional(),
	is_active: z.boolean().optional()
});

export type CreateOAuthClientSchema = typeof createOAuthClientSchema;
export type UpdateOAuthClientSchema = typeof updateOAuthClientSchema;
export type CreateOAuthClientInput = z.infer<typeof createOAuthClientSchema>;
export type UpdateOAuthClientInput = z.infer<typeof updateOAuthClientSchema>;
