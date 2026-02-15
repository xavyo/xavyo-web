import { z } from 'zod/v3';

const validJsonString = z.string().refine(
	(val) => {
		try {
			JSON.parse(val);
			return true;
		} catch {
			return false;
		}
	},
	{ message: 'Must be valid JSON' }
);

const commaSeparatedString = z.string().refine(
	(val) =>
		val
			.split(',')
			.map((s) => s.trim())
			.every((s) => s.length > 0),
	{ message: 'Must be a comma-separated list of values' }
);

export const createIdentityProviderSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	provider_type: z.string().min(1, 'Provider type is required'),
	issuer_url: z.string().min(1, 'Issuer URL is required').url('Must be a valid URL'),
	client_id: z.string().min(1, 'Client ID is required').max(1000),
	client_secret: z.string().min(1, 'Client secret is required').max(2000),
	scopes: commaSeparatedString.optional(),
	claim_mapping: validJsonString.optional(),
	sync_on_login: z.boolean().optional().default(false)
});

export const updateIdentityProviderSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	provider_type: z.string().min(1).optional(),
	issuer_url: z.string().url('Must be a valid URL').optional(),
	client_id: z.string().min(1).max(1000).optional(),
	client_secret: z.string().min(1).max(2000).optional(),
	scopes: commaSeparatedString.optional(),
	claim_mapping: validJsonString.optional(),
	sync_on_login: z.boolean().optional()
});

export const createServiceProviderSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	entity_id: z.string().min(1, 'Entity ID is required').max(1000),
	acs_urls: z.string().min(1, 'At least one ACS URL is required'),
	certificate: z.string().optional(),
	attribute_mapping: validJsonString.optional(),
	name_id_format: z.string().optional(),
	sign_assertions: z.boolean().optional().default(true),
	validate_signatures: z.boolean().optional().default(false),
	assertion_validity_seconds: z.coerce.number().int().min(60).max(86400).optional().default(300),
	metadata_url: z.string().url('Must be a valid URL').optional()
});

export const updateServiceProviderSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	entity_id: z.string().min(1).max(1000).optional(),
	acs_urls: z.string().min(1).optional(),
	certificate: z.string().optional(),
	attribute_mapping: validJsonString.optional(),
	name_id_format: z.string().optional(),
	sign_assertions: z.boolean().optional(),
	validate_signatures: z.boolean().optional(),
	assertion_validity_seconds: z.coerce.number().int().min(60).max(86400).optional(),
	metadata_url: z.string().url('Must be a valid URL').optional(),
	enabled: z.boolean().optional()
});

export const uploadCertificateSchema = z.object({
	certificate: z
		.string()
		.min(1, 'Certificate is required')
		.refine((val) => val.includes('BEGIN CERTIFICATE'), {
			message: 'Must contain a valid PEM certificate'
		}),
	private_key: z
		.string()
		.min(1, 'Private key is required')
		.refine((val) => val.includes('BEGIN'), {
			message: 'Must contain a valid PEM private key'
		}),
	key_id: z.string().min(1, 'Key ID is required').max(255),
	subject_dn: z.string().optional(),
	issuer_dn: z.string().optional(),
	not_before: z.string().optional(),
	not_after: z.string().optional()
});

export const updateSocialProviderSchema = z.object({
	enabled: z.boolean().optional(),
	client_id: z.string().min(1).max(1000).optional(),
	client_secret: z.string().min(1).max(2000).optional(),
	scopes: commaSeparatedString.optional(),
	additional_config: validJsonString.optional()
});

export const addDomainSchema = z.object({
	domain: z
		.string()
		.min(1, 'Domain is required')
		.max(255)
		.regex(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
			message: 'Must be a valid domain (e.g., example.com)'
		}),
	priority: z.coerce.number().int().min(0).optional()
});

export const generateCertificateSchema = z.object({
	common_name: z.string().min(1, 'Common Name is required').max(255),
	organization: z.string().max(255).optional(),
	country: z.string().max(2).optional(),
	validity_days: z.coerce.number().int().min(1).max(3650).optional().default(365)
});

export const importSpMetadataSchema = z.object({
	metadata_url: z.string().url('Must be a valid URL').optional(),
	metadata_xml: z.string().optional()
});

export type CreateIdentityProviderSchema = typeof createIdentityProviderSchema;
export type UpdateIdentityProviderSchema = typeof updateIdentityProviderSchema;
export type CreateServiceProviderSchema = typeof createServiceProviderSchema;
export type UpdateServiceProviderSchema = typeof updateServiceProviderSchema;
export type UploadCertificateSchema = typeof uploadCertificateSchema;
export type UpdateSocialProviderSchema = typeof updateSocialProviderSchema;
export type AddDomainSchema = typeof addDomainSchema;
export type GenerateCertificateSchema = typeof generateCertificateSchema;
export type ImportSpMetadataSchema = typeof importSpMetadataSchema;
