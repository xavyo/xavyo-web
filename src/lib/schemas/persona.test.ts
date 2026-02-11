import { describe, it, expect } from 'vitest';
import {
	createArchetypeSchema,
	updateArchetypeSchema,
	createPersonaSchema,
	updatePersonaSchema,
	reasonSchema
} from './persona';

describe('createArchetypeSchema', () => {
	it('accepts valid input', () => {
		const result = createArchetypeSchema.safeParse({
			name: 'Admin Template',
			naming_pattern: 'admin.{username}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createArchetypeSchema.safeParse({
			name: 'Admin Template',
			naming_pattern: 'admin.{username}',
			description: 'Template for admin personas',
			default_validity_days: 365,
			max_validity_days: 730,
			notification_before_expiry_days: 30
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createArchetypeSchema.safeParse({
			naming_pattern: 'admin.{username}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing naming_pattern', () => {
		const result = createArchetypeSchema.safeParse({
			name: 'Admin Template'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description too long', () => {
		const result = createArchetypeSchema.safeParse({
			name: 'Admin Template',
			naming_pattern: 'admin.{username}',
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});

	it('coerces validity days from string to number', () => {
		const result = createArchetypeSchema.safeParse({
			name: 'Admin Template',
			naming_pattern: 'admin.{username}',
			default_validity_days: '365'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.default_validity_days).toBe(365);
		}
	});

	it('rejects invalid validity days (out of range)', () => {
		const result = createArchetypeSchema.safeParse({
			name: 'Admin Template',
			naming_pattern: 'admin.{username}',
			default_validity_days: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects validity days exceeding 3650', () => {
		const result = createArchetypeSchema.safeParse({
			name: 'Admin Template',
			naming_pattern: 'admin.{username}',
			max_validity_days: 3651
		});
		expect(result.success).toBe(false);
	});
});

describe('updateArchetypeSchema', () => {
	it('accepts valid partial update', () => {
		const result = updateArchetypeSchema.safeParse({
			name: 'Updated Name'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all fields optional (empty object)', () => {
		const result = updateArchetypeSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts full update', () => {
		const result = updateArchetypeSchema.safeParse({
			name: 'Updated',
			description: 'Updated desc',
			naming_pattern: 'new.{username}',
			default_validity_days: 180,
			max_validity_days: 365,
			notification_before_expiry_days: 14
		});
		expect(result.success).toBe(true);
	});
});

describe('createPersonaSchema', () => {
	it('accepts valid input', () => {
		const result = createPersonaSchema.safeParse({
			archetype_id: 'arch-123',
			physical_user_id: 'user-456'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing archetype_id', () => {
		const result = createPersonaSchema.safeParse({
			physical_user_id: 'user-456'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing physical_user_id', () => {
		const result = createPersonaSchema.safeParse({
			archetype_id: 'arch-123'
		});
		expect(result.success).toBe(false);
	});

	it('accepts with optional dates', () => {
		const result = createPersonaSchema.safeParse({
			archetype_id: 'arch-123',
			physical_user_id: 'user-456',
			valid_from: '2026-03-01',
			valid_until: '2026-12-31'
		});
		expect(result.success).toBe(true);
	});
});

describe('updatePersonaSchema', () => {
	it('accepts valid partial update', () => {
		const result = updatePersonaSchema.safeParse({
			display_name: 'New Display Name'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = updatePersonaSchema.safeParse({});
		expect(result.success).toBe(true);
	});
});

describe('reasonSchema', () => {
	it('accepts valid reason', () => {
		const result = reasonSchema.safeParse({
			reason: 'User requested deactivation due to role change'
		});
		expect(result.success).toBe(true);
	});

	it('rejects reason too short (under 5 chars)', () => {
		const result = reasonSchema.safeParse({
			reason: 'no'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Reason must be at least 5 characters');
		}
	});

	it('rejects reason too long (over 1000 chars)', () => {
		const result = reasonSchema.safeParse({
			reason: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});
