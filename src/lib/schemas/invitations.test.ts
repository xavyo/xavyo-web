import { describe, it, expect } from 'vitest';
import { createInvitationSchema } from './invitations';

describe('createInvitationSchema', () => {
	it('accepts valid email', () => {
		const result = createInvitationSchema.safeParse({ email: 'user@example.com' });
		expect(result.success).toBe(true);
	});

	it('rejects empty email', () => {
		const result = createInvitationSchema.safeParse({ email: '' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid email format', () => {
		const result = createInvitationSchema.safeParse({ email: 'not-an-email' });
		expect(result.success).toBe(false);
	});

	it('rejects missing email field', () => {
		const result = createInvitationSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
