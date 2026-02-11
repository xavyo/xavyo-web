import { describe, it, expect } from 'vitest';
import { createUserSchema, updateUserSchema } from './user';

describe('createUserSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = createUserSchema.safeParse({
			email: 'test@example.com',
			password: 'securePass123',
			roles: ['admin'],
			username: 'testuser'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input without optional username', () => {
		const result = createUserSchema.safeParse({
			email: 'test@example.com',
			password: 'securePass123',
			roles: ['user']
		});
		expect(result.success).toBe(true);
	});

	it('accepts multiple roles', () => {
		const result = createUserSchema.safeParse({
			email: 'test@example.com',
			password: 'securePass123',
			roles: ['admin', 'user']
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing email', () => {
		const result = createUserSchema.safeParse({
			password: 'securePass123',
			roles: ['user']
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty email', () => {
		const result = createUserSchema.safeParse({
			email: '',
			password: 'securePass123',
			roles: ['user']
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid email format', () => {
		const result = createUserSchema.safeParse({
			email: 'not-an-email',
			password: 'securePass123',
			roles: ['user']
		});
		expect(result.success).toBe(false);
	});

	it('rejects short password (less than 8 chars)', () => {
		const result = createUserSchema.safeParse({
			email: 'test@example.com',
			password: 'short',
			roles: ['user']
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty roles array', () => {
		const result = createUserSchema.safeParse({
			email: 'test@example.com',
			password: 'securePass123',
			roles: []
		});
		expect(result.success).toBe(false);
	});

	it('rejects username longer than 100 characters', () => {
		const result = createUserSchema.safeParse({
			email: 'test@example.com',
			password: 'securePass123',
			roles: ['user'],
			username: 'a'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('accepts username at exactly 100 characters', () => {
		const result = createUserSchema.safeParse({
			email: 'test@example.com',
			password: 'securePass123',
			roles: ['user'],
			username: 'a'.repeat(100)
		});
		expect(result.success).toBe(true);
	});
});

describe('updateUserSchema', () => {
	it('accepts valid partial update with email only', () => {
		const result = updateUserSchema.safeParse({
			email: 'new@example.com'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update with roles only', () => {
		const result = updateUserSchema.safeParse({
			roles: ['admin', 'user']
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update with username only', () => {
		const result = updateUserSchema.safeParse({
			username: 'newname'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (no fields to update)', () => {
		const result = updateUserSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('rejects invalid email format', () => {
		const result = updateUserSchema.safeParse({
			email: 'not-valid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty roles array', () => {
		const result = updateUserSchema.safeParse({
			roles: []
		});
		expect(result.success).toBe(false);
	});

	it('rejects username longer than 100 characters', () => {
		const result = updateUserSchema.safeParse({
			username: 'a'.repeat(101)
		});
		expect(result.success).toBe(false);
	});
});
