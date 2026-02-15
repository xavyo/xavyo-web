import { describe, it, expect } from 'vitest';
import { createScimTargetSchema, editScimTargetSchema } from './scim-targets';

describe('createScimTargetSchema', () => {
	it('validates with required fields and bearer auth', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Azure AD SCIM',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(true);
	});

	it('validates with required fields and oauth2 auth', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Okta SCIM',
			base_url: 'https://scim.okta.com/v2',
			auth_method: 'oauth2'
		});
		expect(result.success).toBe(true);
	});

	it('validates with all optional bearer fields', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Azure AD SCIM',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			bearer_token: 'secret-token',
			deprovisioning_strategy: 'deactivate',
			tls_verify: 'on',
			rate_limit_per_minute: 60,
			request_timeout_secs: 30,
			max_retries: 5
		});
		expect(result.success).toBe(true);
	});

	it('validates with all optional oauth2 fields', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Okta SCIM',
			base_url: 'https://scim.okta.com/v2',
			auth_method: 'oauth2',
			client_id: 'my-client',
			client_secret: 'my-secret',
			token_endpoint: 'https://auth.example.com/token',
			scopes: 'scim.read,scim.write',
			deprovisioning_strategy: 'delete'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createScimTargetSchema.safeParse({
			name: '',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createScimTargetSchema.safeParse({
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid base_url', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'not-a-url',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing base_url', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid auth_method', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'basic'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing auth_method', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid deprovisioning_strategy', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			deprovisioning_strategy: 'suspend'
		});
		expect(result.success).toBe(false);
	});

	it('rejects rate_limit_per_minute below minimum', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			rate_limit_per_minute: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects rate_limit_per_minute above maximum', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			rate_limit_per_minute: 10001
		});
		expect(result.success).toBe(false);
	});

	it('rejects request_timeout_secs below minimum', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			request_timeout_secs: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects request_timeout_secs above maximum', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			request_timeout_secs: 301
		});
		expect(result.success).toBe(false);
	});

	it('rejects max_retries below minimum', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			max_retries: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects max_retries above maximum', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			max_retries: 21
		});
		expect(result.success).toBe(false);
	});

	it('coerces string numbers for numeric fields', () => {
		const result = createScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer',
			rate_limit_per_minute: '60',
			request_timeout_secs: '30',
			max_retries: '3'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.rate_limit_per_minute).toBe(60);
			expect(result.data.request_timeout_secs).toBe(30);
			expect(result.data.max_retries).toBe(3);
		}
	});
});

describe('editScimTargetSchema', () => {
	it('validates with required fields', () => {
		const result = editScimTargetSchema.safeParse({
			name: 'Updated SCIM Target',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(true);
	});

	it('validates with all fields', () => {
		const result = editScimTargetSchema.safeParse({
			name: 'Updated',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'oauth2',
			client_id: 'new-client',
			client_secret: 'new-secret',
			token_endpoint: 'https://auth.example.com/token',
			scopes: 'scim.read',
			deprovisioning_strategy: 'delete',
			tls_verify: 'off',
			rate_limit_per_minute: 120,
			request_timeout_secs: 60,
			max_retries: 10
		});
		expect(result.success).toBe(true);
	});

	it('allows empty credential fields (for keeping current)', () => {
		const result = editScimTargetSchema.safeParse({
			name: 'Updated',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.bearer_token).toBeUndefined();
		}
	});

	it('rejects empty name', () => {
		const result = editScimTargetSchema.safeParse({
			name: '',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid base_url', () => {
		const result = editScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'not-a-url',
			auth_method: 'bearer'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid auth_method', () => {
		const result = editScimTargetSchema.safeParse({
			name: 'Test',
			base_url: 'https://scim.example.com/v2',
			auth_method: 'apikey'
		});
		expect(result.success).toBe(false);
	});
});
