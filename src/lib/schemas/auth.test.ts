import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from './auth';

describe('loginSchema', () => {
	it('accepts valid email and password', () => {
		const result = loginSchema.safeParse({ email: 'user@example.com', password: 'mypassword' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid email', () => {
		const result = loginSchema.safeParse({ email: 'not-an-email', password: 'mypassword' });
		expect(result.success).toBe(false);
	});

	it('rejects missing password', () => {
		const result = loginSchema.safeParse({ email: 'user@example.com' });
		expect(result.success).toBe(false);
	});

	it('rejects empty password', () => {
		const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
		expect(result.success).toBe(false);
	});
});

describe('signupSchema', () => {
	it('accepts valid email and password', () => {
		const result = signupSchema.safeParse({ email: 'user@example.com', password: 'password123' });
		expect(result.success).toBe(true);
	});

	it('accepts valid email, password, and displayName', () => {
		const result = signupSchema.safeParse({
			email: 'user@example.com',
			password: 'password123',
			displayName: 'John Doe'
		});
		expect(result.success).toBe(true);
	});

	it('accepts missing displayName (optional)', () => {
		const result = signupSchema.safeParse({ email: 'user@example.com', password: 'password123' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.displayName).toBeUndefined();
		}
	});

	it('rejects password too short (< 8 chars)', () => {
		const result = signupSchema.safeParse({ email: 'user@example.com', password: 'short' });
		expect(result.success).toBe(false);
	});

	it('rejects password too long (> 128 chars)', () => {
		const result = signupSchema.safeParse({
			email: 'user@example.com',
			password: 'a'.repeat(129)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid email', () => {
		const result = signupSchema.safeParse({ email: 'bad', password: 'password123' });
		expect(result.success).toBe(false);
	});

	it('rejects displayName too long (> 255 chars)', () => {
		const result = signupSchema.safeParse({
			email: 'user@example.com',
			password: 'password123',
			displayName: 'a'.repeat(256)
		});
		expect(result.success).toBe(false);
	});
});

describe('forgotPasswordSchema', () => {
	it('accepts valid email', () => {
		const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid email', () => {
		const result = forgotPasswordSchema.safeParse({ email: 'not-valid' });
		expect(result.success).toBe(false);
	});

	it('rejects missing email', () => {
		const result = forgotPasswordSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('resetPasswordSchema', () => {
	it('accepts valid token (43 chars) and password', () => {
		const result = resetPasswordSchema.safeParse({
			token: 'a'.repeat(43),
			newPassword: 'newpassword123'
		});
		expect(result.success).toBe(true);
	});

	it('rejects token too short', () => {
		const result = resetPasswordSchema.safeParse({
			token: 'short',
			newPassword: 'newpassword123'
		});
		expect(result.success).toBe(false);
	});

	it('rejects token too long', () => {
		const result = resetPasswordSchema.safeParse({
			token: 'a'.repeat(44),
			newPassword: 'newpassword123'
		});
		expect(result.success).toBe(false);
	});

	it('rejects password too short (< 8 chars)', () => {
		const result = resetPasswordSchema.safeParse({
			token: 'a'.repeat(43),
			newPassword: 'short'
		});
		expect(result.success).toBe(false);
	});

	it('rejects password too long (> 128 chars)', () => {
		const result = resetPasswordSchema.safeParse({
			token: 'a'.repeat(43),
			newPassword: 'a'.repeat(129)
		});
		expect(result.success).toBe(false);
	});
});
