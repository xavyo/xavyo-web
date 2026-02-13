import { describe, it, expect } from 'vitest';
import { createScimTokenSchema, mappingRequestSchema } from './scim';

describe('createScimTokenSchema', () => {
	it('accepts valid token name', () => {
		const result = createScimTokenSchema.safeParse({ name: 'Okta Provisioning' });
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createScimTokenSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Token name is required');
		}
	});

	it('rejects name longer than 255 characters', () => {
		const result = createScimTokenSchema.safeParse({ name: 'a'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('accepts name at max length (255 chars)', () => {
		const result = createScimTokenSchema.safeParse({ name: 'a'.repeat(255) });
		expect(result.success).toBe(true);
	});
});

describe('mappingRequestSchema', () => {
	it('accepts valid mapping with transform', () => {
		const result = mappingRequestSchema.safeParse({
			scim_path: 'userName',
			xavyo_field: 'email',
			transform: 'lowercase',
			required: true
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid mapping with null transform', () => {
		const result = mappingRequestSchema.safeParse({
			scim_path: 'name.givenName',
			xavyo_field: 'first_name',
			transform: null,
			required: false
		});
		expect(result.success).toBe(true);
	});

	it('accepts uppercase transform', () => {
		const result = mappingRequestSchema.safeParse({
			scim_path: 'x',
			xavyo_field: 'y',
			transform: 'uppercase',
			required: false
		});
		expect(result.success).toBe(true);
	});

	it('accepts trim transform', () => {
		const result = mappingRequestSchema.safeParse({
			scim_path: 'x',
			xavyo_field: 'y',
			transform: 'trim',
			required: false
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid transform value', () => {
		const result = mappingRequestSchema.safeParse({
			scim_path: 'userName',
			xavyo_field: 'email',
			transform: 'reverse',
			required: true
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty scim_path', () => {
		const result = mappingRequestSchema.safeParse({
			scim_path: '',
			xavyo_field: 'email',
			transform: null,
			required: true
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty xavyo_field', () => {
		const result = mappingRequestSchema.safeParse({
			scim_path: 'userName',
			xavyo_field: '',
			transform: null,
			required: true
		});
		expect(result.success).toBe(false);
	});
});
