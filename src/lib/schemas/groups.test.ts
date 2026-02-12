import { describe, it, expect } from 'vitest';
import { createGroupSchema, updateGroupSchema, addMembersSchema } from './groups';

describe('createGroupSchema', () => {
	it('accepts valid input with name only', () => {
		const result = createGroupSchema.safeParse({
			name: 'Engineering Team'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with name and description', () => {
		const result = createGroupSchema.safeParse({
			name: 'Engineering Team',
			description: 'All engineering staff including backend and frontend developers'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createGroupSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createGroupSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createGroupSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('accepts name at exactly 255 chars', () => {
		const result = createGroupSchema.safeParse({
			name: 'x'.repeat(255)
		});
		expect(result.success).toBe(true);
	});

	it('accepts description as optional (not provided)', () => {
		const result = createGroupSchema.safeParse({ name: 'Test Group' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeUndefined();
		}
	});

	it('rejects description over 1000 chars', () => {
		const result = createGroupSchema.safeParse({
			name: 'Test Group',
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});

	it('accepts description at exactly 1000 chars', () => {
		const result = createGroupSchema.safeParse({
			name: 'Test Group',
			description: 'x'.repeat(1000)
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty description', () => {
		const result = createGroupSchema.safeParse({
			name: 'Test Group',
			description: ''
		});
		expect(result.success).toBe(true);
	});
});

describe('updateGroupSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateGroupSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with name only', () => {
		const result = updateGroupSchema.safeParse({
			name: 'Updated Group Name'
		});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with description only', () => {
		const result = updateGroupSchema.safeParse({
			description: 'Updated description'
		});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with both fields', () => {
		const result = updateGroupSchema.safeParse({
			name: 'New Name',
			description: 'New description'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name when provided', () => {
		const result = updateGroupSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars when provided', () => {
		const result = updateGroupSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars when provided', () => {
		const result = updateGroupSchema.safeParse({
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});

describe('addMembersSchema', () => {
	it('accepts valid member_ids string', () => {
		const result = addMembersSchema.safeParse({
			member_ids: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts comma-separated member_ids', () => {
		const result = addMembersSchema.safeParse({
			member_ids:
				'550e8400-e29b-41d4-a716-446655440000,6ba7b810-9dad-11d1-80b4-00c04fd430c8'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty member_ids', () => {
		const result = addMembersSchema.safeParse({
			member_ids: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing member_ids', () => {
		const result = addMembersSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
