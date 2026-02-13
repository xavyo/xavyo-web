import { describe, it, expect } from 'vitest';
import {
	updateProfileSchema,
	passwordChangeSchema,
	totpVerifySchema,
	totpDisableSchema,
	recoveryRegenerateSchema,
	webauthnNameSchema,
	emailChangeSchema,
	emailVerifySchema,
	deviceRenameSchema,
	deviceTrustSchema
} from './settings';

describe('updateProfileSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'John Doe',
			first_name: 'John',
			last_name: 'Doe',
			avatar_url: 'https://example.com/avatar.jpg'
		});
		expect(result.success).toBe(true);
	});

	it('accepts minimal input with display_name only', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'John'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty avatar_url', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'John',
			avatar_url: ''
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty display_name', () => {
		const result = updateProfileSchema.safeParse({
			display_name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects display_name over 100 chars', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'a'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('accepts display_name at exactly 100 chars', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'a'.repeat(100)
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid avatar_url', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'John',
			avatar_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects first_name over 100 chars', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'John',
			first_name: 'a'.repeat(101)
		});
		expect(result.success).toBe(false);
	});
});

describe('passwordChangeSchema', () => {
	it('accepts valid password change', () => {
		const result = passwordChangeSchema.safeParse({
			current_password: 'oldpass123',
			new_password: 'NewStr0ng!Pass',
			confirm_password: 'NewStr0ng!Pass',
			revoke_other_sessions: true
		});
		expect(result.success).toBe(true);
	});

	it('defaults revoke_other_sessions to true', () => {
		const result = passwordChangeSchema.safeParse({
			current_password: 'oldpass123',
			new_password: 'NewStr0ng!Pass',
			confirm_password: 'NewStr0ng!Pass'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.revoke_other_sessions).toBe(true);
		}
	});

	it('rejects empty current_password', () => {
		const result = passwordChangeSchema.safeParse({
			current_password: '',
			new_password: 'NewStr0ng!Pass',
			confirm_password: 'NewStr0ng!Pass'
		});
		expect(result.success).toBe(false);
	});

	it('rejects new_password under 8 chars', () => {
		const result = passwordChangeSchema.safeParse({
			current_password: 'oldpass',
			new_password: 'short',
			confirm_password: 'short'
		});
		expect(result.success).toBe(false);
	});

	it('rejects new_password over 128 chars', () => {
		const long = 'a'.repeat(129);
		const result = passwordChangeSchema.safeParse({
			current_password: 'oldpass',
			new_password: long,
			confirm_password: long
		});
		expect(result.success).toBe(false);
	});

	it('rejects mismatched passwords', () => {
		const result = passwordChangeSchema.safeParse({
			current_password: 'oldpass123',
			new_password: 'NewStr0ng!Pass',
			confirm_password: 'DifferentPass!'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map((i) => i.path.join('.'));
			expect(paths).toContain('confirm_password');
		}
	});
});

describe('totpVerifySchema', () => {
	it('accepts valid 6-digit code', () => {
		const result = totpVerifySchema.safeParse({ code: '123456' });
		expect(result.success).toBe(true);
	});

	it('rejects code with letters', () => {
		const result = totpVerifySchema.safeParse({ code: '12345a' });
		expect(result.success).toBe(false);
	});

	it('rejects code shorter than 6 digits', () => {
		const result = totpVerifySchema.safeParse({ code: '12345' });
		expect(result.success).toBe(false);
	});

	it('rejects code longer than 6 digits', () => {
		const result = totpVerifySchema.safeParse({ code: '1234567' });
		expect(result.success).toBe(false);
	});

	it('rejects empty code', () => {
		const result = totpVerifySchema.safeParse({ code: '' });
		expect(result.success).toBe(false);
	});
});

describe('totpDisableSchema', () => {
	it('accepts valid password and code', () => {
		const result = totpDisableSchema.safeParse({
			password: 'mypassword',
			code: '123456'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty password', () => {
		const result = totpDisableSchema.safeParse({
			password: '',
			code: '123456'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid code', () => {
		const result = totpDisableSchema.safeParse({
			password: 'mypassword',
			code: 'abc'
		});
		expect(result.success).toBe(false);
	});
});

describe('recoveryRegenerateSchema', () => {
	it('accepts valid password', () => {
		const result = recoveryRegenerateSchema.safeParse({
			password: 'mypassword'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty password', () => {
		const result = recoveryRegenerateSchema.safeParse({
			password: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing password', () => {
		const result = recoveryRegenerateSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('webauthnNameSchema', () => {
	it('accepts valid name', () => {
		const result = webauthnNameSchema.safeParse({ name: 'MacBook Touch ID' });
		expect(result.success).toBe(true);
	});

	it('accepts empty name (optional)', () => {
		const result = webauthnNameSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('rejects name over 100 chars', () => {
		const result = webauthnNameSchema.safeParse({ name: 'a'.repeat(101) });
		expect(result.success).toBe(false);
	});
});

describe('emailChangeSchema', () => {
	it('accepts valid email and password', () => {
		const result = emailChangeSchema.safeParse({
			new_email: 'new@example.com',
			current_password: 'mypassword'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid email', () => {
		const result = emailChangeSchema.safeParse({
			new_email: 'not-an-email',
			current_password: 'mypassword'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty email', () => {
		const result = emailChangeSchema.safeParse({
			new_email: '',
			current_password: 'mypassword'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty password', () => {
		const result = emailChangeSchema.safeParse({
			new_email: 'new@example.com',
			current_password: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects email over 255 chars', () => {
		const result = emailChangeSchema.safeParse({
			new_email: 'a'.repeat(250) + '@b.com',
			current_password: 'mypassword'
		});
		expect(result.success).toBe(false);
	});
});

describe('emailVerifySchema', () => {
	it('accepts valid 43-char token', () => {
		const result = emailVerifySchema.safeParse({
			token: 'a'.repeat(43)
		});
		expect(result.success).toBe(true);
	});

	it('rejects token shorter than 43 chars', () => {
		const result = emailVerifySchema.safeParse({
			token: 'a'.repeat(42)
		});
		expect(result.success).toBe(false);
	});

	it('rejects token longer than 43 chars', () => {
		const result = emailVerifySchema.safeParse({
			token: 'a'.repeat(44)
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty token', () => {
		const result = emailVerifySchema.safeParse({ token: '' });
		expect(result.success).toBe(false);
	});
});

describe('deviceRenameSchema', () => {
	it('accepts valid device name', () => {
		const result = deviceRenameSchema.safeParse({
			device_name: 'Work Laptop'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty device name', () => {
		const result = deviceRenameSchema.safeParse({
			device_name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects device name over 100 chars', () => {
		const result = deviceRenameSchema.safeParse({
			device_name: 'a'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('accepts device name at exactly 100 chars', () => {
		const result = deviceRenameSchema.safeParse({
			device_name: 'a'.repeat(100)
		});
		expect(result.success).toBe(true);
	});
});

describe('deviceTrustSchema', () => {
	it('accepts valid trust duration', () => {
		const result = deviceTrustSchema.safeParse({
			trust_duration_days: 30
		});
		expect(result.success).toBe(true);
	});

	it('accepts zero duration (permanent)', () => {
		const result = deviceTrustSchema.safeParse({
			trust_duration_days: 0
		});
		expect(result.success).toBe(true);
	});

	it('accepts max duration 365', () => {
		const result = deviceTrustSchema.safeParse({
			trust_duration_days: 365
		});
		expect(result.success).toBe(true);
	});

	it('rejects negative duration', () => {
		const result = deviceTrustSchema.safeParse({
			trust_duration_days: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects duration over 365', () => {
		const result = deviceTrustSchema.safeParse({
			trust_duration_days: 366
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty object (duration optional)', () => {
		const result = deviceTrustSchema.safeParse({});
		expect(result.success).toBe(true);
	});
});
