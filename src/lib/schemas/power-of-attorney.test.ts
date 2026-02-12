import { describe, it, expect } from 'vitest';
import { grantPoaSchema, revokePoaSchema, extendPoaSchema } from './power-of-attorney';

describe('grantPoaSchema', () => {
	it('validates a valid grant request', () => {
		const result = grantPoaSchema.safeParse({
			attorney_id: '550e8400-e29b-41d4-a716-446655440000',
			starts_at: '2026-02-12T00:00:00Z',
			ends_at: '2026-03-12T00:00:00Z',
			reason: 'Planned vacation'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing attorney_id', () => {
		const result = grantPoaSchema.safeParse({
			starts_at: '2026-02-12T00:00:00Z',
			ends_at: '2026-03-12T00:00:00Z',
			reason: 'Test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid UUID for attorney_id', () => {
		const result = grantPoaSchema.safeParse({
			attorney_id: 'not-a-uuid',
			starts_at: '2026-02-12T00:00:00Z',
			ends_at: '2026-03-12T00:00:00Z',
			reason: 'Test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty reason', () => {
		const result = grantPoaSchema.safeParse({
			attorney_id: '550e8400-e29b-41d4-a716-446655440000',
			starts_at: '2026-02-12T00:00:00Z',
			ends_at: '2026-03-12T00:00:00Z',
			reason: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing starts_at', () => {
		const result = grantPoaSchema.safeParse({
			attorney_id: '550e8400-e29b-41d4-a716-446655440000',
			starts_at: '',
			ends_at: '2026-03-12T00:00:00Z',
			reason: 'Test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing ends_at', () => {
		const result = grantPoaSchema.safeParse({
			attorney_id: '550e8400-e29b-41d4-a716-446655440000',
			starts_at: '2026-02-12T00:00:00Z',
			ends_at: '',
			reason: 'Test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects reason over 2000 characters', () => {
		const result = grantPoaSchema.safeParse({
			attorney_id: '550e8400-e29b-41d4-a716-446655440000',
			starts_at: '2026-02-12T00:00:00Z',
			ends_at: '2026-03-12T00:00:00Z',
			reason: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});
});

describe('revokePoaSchema', () => {
	it('validates with reason', () => {
		const result = revokePoaSchema.safeParse({ reason: 'No longer needed' });
		expect(result.success).toBe(true);
	});

	it('validates without reason', () => {
		const result = revokePoaSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('rejects reason over 2000 characters', () => {
		const result = revokePoaSchema.safeParse({ reason: 'x'.repeat(2001) });
		expect(result.success).toBe(false);
	});
});

describe('extendPoaSchema', () => {
	it('validates a valid extend request', () => {
		const result = extendPoaSchema.safeParse({ new_ends_at: '2026-04-01T00:00:00Z' });
		expect(result.success).toBe(true);
	});

	it('rejects empty new_ends_at', () => {
		const result = extendPoaSchema.safeParse({ new_ends_at: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing new_ends_at', () => {
		const result = extendPoaSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
