import { describe, it, expect } from 'vitest';
import { createOAuthClientSchema, updateOAuthClientSchema } from './oauth-clients';

describe('createOAuthClientSchema', () => {
	const validInput = {
		name: 'My OAuth App',
		client_type: 'confidential' as const,
		redirect_uris: 'https://app.example.com/callback',
		grant_types: 'authorization_code,refresh_token',
		scopes: 'openid,profile,email'
	};

	it('accepts valid full input', () => {
		const result = createOAuthClientSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts public client type', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			client_type: 'public'
		});
		expect(result.success).toBe(true);
	});

	it('accepts confidential client type', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			client_type: 'confidential'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const { name: _, ...rest } = validInput;
		const result = createOAuthClientSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createOAuthClientSchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('accepts name at 255 chars', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			name: 'x'.repeat(255)
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing client_type', () => {
		const { client_type: _, ...rest } = validInput;
		const result = createOAuthClientSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid client_type', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			client_type: 'hybrid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing redirect_uris', () => {
		const { redirect_uris: _, ...rest } = validInput;
		const result = createOAuthClientSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty redirect_uris', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			redirect_uris: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing grant_types', () => {
		const { grant_types: _, ...rest } = validInput;
		const result = createOAuthClientSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty grant_types', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			grant_types: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing scopes', () => {
		const { scopes: _, ...rest } = validInput;
		const result = createOAuthClientSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty scopes', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			scopes: ''
		});
		expect(result.success).toBe(false);
	});

	it('accepts multiple comma-separated redirect_uris', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			redirect_uris: 'https://app.example.com/callback,https://app.example.com/callback2'
		});
		expect(result.success).toBe(true);
	});

	it('accepts multiple comma-separated grant_types', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			grant_types: 'authorization_code,client_credentials,refresh_token'
		});
		expect(result.success).toBe(true);
	});

	it('accepts multiple comma-separated scopes', () => {
		const result = createOAuthClientSchema.safeParse({
			...validInput,
			scopes: 'openid,profile,email,offline_access'
		});
		expect(result.success).toBe(true);
	});
});

describe('updateOAuthClientSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateOAuthClientSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with name only', () => {
		const result = updateOAuthClientSchema.safeParse({
			name: 'Updated App Name'
		});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with is_active only', () => {
		const result = updateOAuthClientSchema.safeParse({
			is_active: false
		});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with multiple fields', () => {
		const result = updateOAuthClientSchema.safeParse({
			name: 'Updated Name',
			redirect_uris: 'https://new.example.com/callback',
			scopes: 'openid,profile',
			is_active: true
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name when provided', () => {
		const result = updateOAuthClientSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars when provided', () => {
		const result = updateOAuthClientSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid grant_types update', () => {
		const result = updateOAuthClientSchema.safeParse({
			grant_types: 'authorization_code,refresh_token'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid scopes update', () => {
		const result = updateOAuthClientSchema.safeParse({
			scopes: 'openid,email'
		});
		expect(result.success).toBe(true);
	});
});
