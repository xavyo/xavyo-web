import { z } from 'zod/v3';

export const AUTH_METHODS = ['bearer', 'oauth2'] as const;
export const DEPROVISIONING_STRATEGIES = ['deactivate', 'delete'] as const;

export const createScimTargetSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	base_url: z.string().url('Must be a valid URL'),
	auth_method: z.enum(AUTH_METHODS, { required_error: 'Auth method is required' }),
	// Bearer credentials
	bearer_token: z.string().optional(),
	// OAuth2 credentials
	client_id: z.string().optional(),
	client_secret: z.string().optional(),
	token_endpoint: z.string().optional(),
	scopes: z.string().optional(),
	// Advanced settings
	deprovisioning_strategy: z.enum(DEPROVISIONING_STRATEGIES).optional(),
	tls_verify: z.string().optional(),
	rate_limit_per_minute: z.coerce.number().min(1).max(10000).optional(),
	request_timeout_secs: z.coerce.number().min(1).max(300).optional(),
	max_retries: z.coerce.number().min(0).max(20).optional()
});

export const editScimTargetSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	base_url: z.string().url('Must be a valid URL'),
	auth_method: z.enum(AUTH_METHODS, { required_error: 'Auth method is required' }),
	// Bearer credentials (optional on edit — blank means keep current)
	bearer_token: z.string().optional(),
	// OAuth2 credentials
	client_id: z.string().optional(),
	client_secret: z.string().optional(),
	token_endpoint: z.string().optional(),
	scopes: z.string().optional(),
	// Advanced settings
	deprovisioning_strategy: z.enum(DEPROVISIONING_STRATEGIES).optional(),
	tls_verify: z.string().optional(),
	rate_limit_per_minute: z.coerce.number().min(1).max(10000).optional(),
	request_timeout_secs: z.coerce.number().min(1).max(300).optional(),
	max_retries: z.coerce.number().min(0).max(20).optional()
});
