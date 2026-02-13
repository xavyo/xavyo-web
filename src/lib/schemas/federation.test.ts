import { describe, it, expect } from 'vitest';
import {
	createIdentityProviderSchema,
	updateIdentityProviderSchema,
	createServiceProviderSchema,
	updateServiceProviderSchema,
	uploadCertificateSchema,
	updateSocialProviderSchema,
	addDomainSchema
} from './federation';

describe('createIdentityProviderSchema', () => {
	const validInput = {
		name: 'Okta OIDC',
		provider_type: 'oidc',
		issuer_url: 'https://okta.example.com',
		client_id: 'client-123',
		client_secret: 'secret-456'
	};

	it('accepts valid complete input', () => {
		const result = createIdentityProviderSchema.safeParse({
			...validInput,
			scopes: 'openid,profile,email',
			claim_mapping: '{"sub": "user_id"}',
			sync_on_login: true
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid minimal input (required fields only)', () => {
		const result = createIdentityProviderSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('defaults sync_on_login to false when not provided', () => {
		const result = createIdentityProviderSchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.sync_on_login).toBe(false);
		}
	});

	it('rejects missing name', () => {
		const { name: _, ...rest } = validInput;
		const result = createIdentityProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createIdentityProviderSchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing provider_type', () => {
		const { provider_type: _, ...rest } = validInput;
		const result = createIdentityProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing issuer_url', () => {
		const { issuer_url: _, ...rest } = validInput;
		const result = createIdentityProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid issuer_url', () => {
		const result = createIdentityProviderSchema.safeParse({
			...validInput,
			issuer_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing client_id', () => {
		const { client_id: _, ...rest } = validInput;
		const result = createIdentityProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing client_secret', () => {
		const { client_secret: _, ...rest } = validInput;
		const result = createIdentityProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid JSON in claim_mapping', () => {
		const result = createIdentityProviderSchema.safeParse({
			...validInput,
			claim_mapping: '{invalid json}'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid JSON in claim_mapping', () => {
		const result = createIdentityProviderSchema.safeParse({
			...validInput,
			claim_mapping: '{"email": "email_claim", "name": "full_name"}'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid scopes (empty segment in comma-separated list)', () => {
		const result = createIdentityProviderSchema.safeParse({
			...validInput,
			scopes: 'openid,,email'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid scopes', () => {
		const result = createIdentityProviderSchema.safeParse({
			...validInput,
			scopes: 'openid,profile,email'
		});
		expect(result.success).toBe(true);
	});
});

describe('updateIdentityProviderSchema', () => {
	it('accepts valid partial update (name only)', () => {
		const result = updateIdentityProviderSchema.safeParse({ name: 'Updated Name' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateIdentityProviderSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid issuer_url', () => {
		const result = updateIdentityProviderSchema.safeParse({
			issuer_url: 'https://new-issuer.example.com'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid issuer_url', () => {
		const result = updateIdentityProviderSchema.safeParse({
			issuer_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid claim_mapping JSON', () => {
		const result = updateIdentityProviderSchema.safeParse({
			claim_mapping: 'bad-json{'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid partial with multiple fields', () => {
		const result = updateIdentityProviderSchema.safeParse({
			name: 'New Name',
			sync_on_login: true,
			scopes: 'openid,email'
		});
		expect(result.success).toBe(true);
	});
});

describe('createServiceProviderSchema', () => {
	const validInput = {
		name: 'My Service Provider',
		entity_id: 'sp-entity-001',
		acs_urls: 'https://sp.example.com/saml/acs'
	};

	it('accepts valid complete input', () => {
		const result = createServiceProviderSchema.safeParse({
			...validInput,
			certificate: '-----BEGIN CERTIFICATE-----\nMIIB...',
			attribute_mapping: '{"email": "user.email"}',
			name_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
			sign_assertions: true,
			validate_signatures: true,
			assertion_validity_seconds: 600,
			metadata_url: 'https://sp.example.com/metadata'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid minimal input (required fields only)', () => {
		const result = createServiceProviderSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('defaults sign_assertions to true', () => {
		const result = createServiceProviderSchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.sign_assertions).toBe(true);
		}
	});

	it('defaults validate_signatures to false', () => {
		const result = createServiceProviderSchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.validate_signatures).toBe(false);
		}
	});

	it('defaults assertion_validity_seconds to 300', () => {
		const result = createServiceProviderSchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.assertion_validity_seconds).toBe(300);
		}
	});

	it('rejects missing entity_id', () => {
		const { entity_id: _, ...rest } = validInput;
		const result = createServiceProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const { name: _, ...rest } = validInput;
		const result = createServiceProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing acs_urls', () => {
		const { acs_urls: _, ...rest } = validInput;
		const result = createServiceProviderSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid JSON in attribute_mapping', () => {
		const result = createServiceProviderSchema.safeParse({
			...validInput,
			attribute_mapping: '{not valid json'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid metadata_url', () => {
		const result = createServiceProviderSchema.safeParse({
			...validInput,
			metadata_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects assertion_validity_seconds below 60', () => {
		const result = createServiceProviderSchema.safeParse({
			...validInput,
			assertion_validity_seconds: 30
		});
		expect(result.success).toBe(false);
	});

	it('rejects assertion_validity_seconds above 86400', () => {
		const result = createServiceProviderSchema.safeParse({
			...validInput,
			assertion_validity_seconds: 100000
		});
		expect(result.success).toBe(false);
	});
});

describe('updateServiceProviderSchema', () => {
	it('accepts valid partial update', () => {
		const result = updateServiceProviderSchema.safeParse({
			name: 'Updated SP',
			enabled: false
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateServiceProviderSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('rejects invalid metadata_url', () => {
		const result = updateServiceProviderSchema.safeParse({
			metadata_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid metadata_url', () => {
		const result = updateServiceProviderSchema.safeParse({
			metadata_url: 'https://sp.example.com/metadata'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid attribute_mapping JSON', () => {
		const result = updateServiceProviderSchema.safeParse({
			attribute_mapping: 'bad{json'
		});
		expect(result.success).toBe(false);
	});

	it('rejects assertion_validity_seconds below 60', () => {
		const result = updateServiceProviderSchema.safeParse({
			assertion_validity_seconds: 10
		});
		expect(result.success).toBe(false);
	});
});

describe('uploadCertificateSchema', () => {
	const validInput = {
		certificate: '-----BEGIN CERTIFICATE-----\nMIIBxTCCAW...\n-----END CERTIFICATE-----',
		private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBAD...\n-----END PRIVATE KEY-----',
		key_id: 'my-key-1'
	};

	it('accepts valid PEM certificate and key', () => {
		const result = uploadCertificateSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts with optional fields', () => {
		const result = uploadCertificateSchema.safeParse({
			...validInput,
			subject_dn: 'CN=example.com',
			issuer_dn: 'CN=Example CA',
			not_before: '2024-01-01T00:00:00Z',
			not_after: '2025-01-01T00:00:00Z'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing private_key', () => {
		const { private_key: _, ...rest } = validInput;
		const result = uploadCertificateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing certificate', () => {
		const { certificate: _, ...rest } = validInput;
		const result = uploadCertificateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing key_id', () => {
		const { key_id: _, ...rest } = validInput;
		const result = uploadCertificateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid PEM certificate format (missing BEGIN CERTIFICATE)', () => {
		const result = uploadCertificateSchema.safeParse({
			...validInput,
			certificate: 'just some random text'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid PEM private key format (missing BEGIN)', () => {
		const result = uploadCertificateSchema.safeParse({
			...validInput,
			private_key: 'not a pem key'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty certificate', () => {
		const result = uploadCertificateSchema.safeParse({
			...validInput,
			certificate: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty private_key', () => {
		const result = uploadCertificateSchema.safeParse({
			...validInput,
			private_key: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('updateSocialProviderSchema', () => {
	it('accepts valid update with all fields', () => {
		const result = updateSocialProviderSchema.safeParse({
			enabled: true,
			client_id: 'google-client-id',
			client_secret: 'google-secret',
			scopes: 'openid,profile,email',
			additional_config: '{"hd": "example.com"}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateSocialProviderSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update (enabled only)', () => {
		const result = updateSocialProviderSchema.safeParse({ enabled: false });
		expect(result.success).toBe(true);
	});

	it('rejects invalid JSON in additional_config', () => {
		const result = updateSocialProviderSchema.safeParse({
			additional_config: '{bad json}'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid JSON in additional_config', () => {
		const result = updateSocialProviderSchema.safeParse({
			additional_config: '{"key": "value"}'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid scopes (empty segment)', () => {
		const result = updateSocialProviderSchema.safeParse({
			scopes: 'openid,,email'
		});
		expect(result.success).toBe(false);
	});
});

describe('addDomainSchema', () => {
	it('accepts valid domain', () => {
		const result = addDomainSchema.safeParse({ domain: 'example.com' });
		expect(result.success).toBe(true);
	});

	it('accepts valid subdomain', () => {
		const result = addDomainSchema.safeParse({ domain: 'auth.example.com' });
		expect(result.success).toBe(true);
	});

	it('accepts domain with optional priority', () => {
		const result = addDomainSchema.safeParse({ domain: 'example.com', priority: 10 });
		expect(result.success).toBe(true);
	});

	it('accepts priority of 0', () => {
		const result = addDomainSchema.safeParse({ domain: 'example.com', priority: 0 });
		expect(result.success).toBe(true);
	});

	it('rejects invalid domain format (no TLD)', () => {
		const result = addDomainSchema.safeParse({ domain: 'invalid' });
		expect(result.success).toBe(false);
	});

	it('rejects empty string', () => {
		const result = addDomainSchema.safeParse({ domain: '' });
		expect(result.success).toBe(false);
	});

	it('rejects domain with spaces', () => {
		const result = addDomainSchema.safeParse({ domain: 'example .com' });
		expect(result.success).toBe(false);
	});

	it('rejects domain starting with hyphen', () => {
		const result = addDomainSchema.safeParse({ domain: '-example.com' });
		expect(result.success).toBe(false);
	});

	it('rejects missing domain', () => {
		const result = addDomainSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects negative priority', () => {
		const result = addDomainSchema.safeParse({ domain: 'example.com', priority: -1 });
		expect(result.success).toBe(false);
	});
});
