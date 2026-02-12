import { describe, it, expect } from 'vitest';
import { acceptInvitationSchema } from './imports';

describe('acceptInvitationSchema', () => {
	it('accepts valid password and matching confirmation', () => {
		const result = acceptInvitationSchema.safeParse({
			password: 'SecurePassword123',
			confirm_password: 'SecurePassword123'
		});
		expect(result.success).toBe(true);
	});

	it('accepts minimum length password (8 chars)', () => {
		const result = acceptInvitationSchema.safeParse({
			password: '12345678',
			confirm_password: '12345678'
		});
		expect(result.success).toBe(true);
	});

	it('accepts maximum length password (128 chars)', () => {
		const pw = 'a'.repeat(128);
		const result = acceptInvitationSchema.safeParse({
			password: pw,
			confirm_password: pw
		});
		expect(result.success).toBe(true);
	});

	it('rejects password shorter than 8 characters', () => {
		const result = acceptInvitationSchema.safeParse({
			password: 'short',
			confirm_password: 'short'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
		}
	});

	it('rejects password longer than 128 characters', () => {
		const pw = 'a'.repeat(129);
		const result = acceptInvitationSchema.safeParse({
			password: pw,
			confirm_password: pw
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Password must be at most 128 characters');
		}
	});

	it('rejects mismatched passwords', () => {
		const result = acceptInvitationSchema.safeParse({
			password: 'SecurePassword123',
			confirm_password: 'DifferentPassword456'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const confirmIssue = result.error.issues.find((i) => i.path.includes('confirm_password'));
			expect(confirmIssue?.message).toBe('Passwords do not match');
		}
	});

	it('rejects empty password', () => {
		const result = acceptInvitationSchema.safeParse({
			password: '',
			confirm_password: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty confirm_password', () => {
		const result = acceptInvitationSchema.safeParse({
			password: 'SecurePassword123',
			confirm_password: ''
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const confirmIssue = result.error.issues.find((i) => i.path.includes('confirm_password'));
			expect(confirmIssue).toBeDefined();
		}
	});
});
