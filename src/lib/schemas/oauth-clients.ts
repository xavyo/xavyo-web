import { z } from 'zod/v3';

// Must mirror the grant types the backend accepts at POST /admin/oauth/clients
// (crates/xavyo-api-oauth/src/handlers/client_admin.rs valid_grant_types).
// `implicit` is intentionally NOT here: it is deprecated by OAuth 2.1 and rejected
// by the backend, so offering it would produce a confusing 400.
export const GRANT_TYPES = [
	'authorization_code',
	'client_credentials',
	'refresh_token',
	'urn:ietf:params:oauth:grant-type:device_code',
	'urn:ietf:params:oauth:grant-type:token-exchange'
] as const;
export const CLIENT_TYPES = ['confidential', 'public'] as const;

/** Parse a comma-separated grant_types field into a trimmed, non-empty list. */
export function parseGrantTypes(value: string): string[] {
	return value
		.split(',')
		.map((g) => g.trim())
		.filter((g) => g.length > 0);
}

function validateGrantTypes(value: string, ctx: z.RefinementCtx) {
	const supported = GRANT_TYPES as readonly string[];
	const invalid = parseGrantTypes(value).filter((g) => !supported.includes(g));
	if (invalid.length > 0) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ['grant_types'],
			message: `Unsupported grant type(s): ${invalid.join(', ')}. Supported: ${GRANT_TYPES.join(', ')}`
		});
	}
}

export const createOAuthClientSchema = z
	.object({
		name: z.string().min(1, 'Name is required').max(255),
		client_type: z.enum(CLIENT_TYPES),
		redirect_uris: z.string().min(1, 'At least one redirect URI is required'),
		grant_types: z.string().min(1, 'At least one grant type is required'),
		scopes: z.string().min(1, 'At least one scope is required'),
		post_logout_redirect_uris: z.string().optional().nullable(),
		logo_url: z.string().url().or(z.literal('')).optional().nullable(),
		description: z.string().max(500).optional().nullable(),
		require_dpop: z.boolean().optional().default(false),
		fapi_profile: z.boolean().optional().default(false),
		jwks: z.string().optional().nullable(),
		tls_client_cert_thumbprint: z.string().max(128).optional().nullable(),
		nhi_id: z.string().uuid().or(z.literal('')).optional().nullable()
	})
	.superRefine((data, ctx) => validateGrantTypes(data.grant_types, ctx));

export const updateOAuthClientSchema = z
	.object({
		name: z.string().min(1, 'Name is required').max(255).optional(),
		redirect_uris: z.string().optional(),
		grant_types: z.string().optional(),
		scopes: z.string().optional(),
		post_logout_redirect_uris: z.string().optional().nullable(),
		is_active: z.boolean().optional(),
		logo_url: z.string().url().or(z.literal('')).optional().nullable(),
		description: z.string().max(500).optional().nullable(),
		require_dpop: z.boolean().optional(),
		fapi_profile: z.boolean().optional(),
		jwks: z.string().optional().nullable(),
		tls_client_cert_thumbprint: z.string().max(128).optional().nullable(),
		nhi_id: z.string().uuid().or(z.literal('')).optional().nullable()
	})
	.superRefine((data, ctx) => {
		if (data.grant_types && data.grant_types.trim().length > 0) {
			validateGrantTypes(data.grant_types, ctx);
		}
	});

export type CreateOAuthClientSchema = typeof createOAuthClientSchema;
export type UpdateOAuthClientSchema = typeof updateOAuthClientSchema;
export type CreateOAuthClientInput = z.infer<typeof createOAuthClientSchema>;
export type UpdateOAuthClientInput = z.infer<typeof updateOAuthClientSchema>;
