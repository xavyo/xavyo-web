import { describe, it, expect } from 'vitest';
import { switchContextSchema, switchBackSchema } from './persona-context';

describe('switchContextSchema', () => {
	it('accepts valid input with persona_id', () => {
		const result = switchContextSchema.safeParse({
			persona_id: '550e8400-e29b-41d4-a716-446655440001'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.persona_id).toBe('550e8400-e29b-41d4-a716-446655440001');
		}
	});

	it('accepts valid input with persona_id and reason', () => {
		const result = switchContextSchema.safeParse({
			persona_id: '550e8400-e29b-41d4-a716-446655440001',
			reason: 'Switching to admin persona for maintenance'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('Switching to admin persona for maintenance');
		}
	});

	it('rejects missing persona_id', () => {
		const result = switchContextSchema.safeParse({
			reason: 'Some reason'
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-uuid persona_id', () => {
		const result = switchContextSchema.safeParse({
			persona_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const personaIssues = result.error.issues.filter((i) => i.path.includes('persona_id'));
			expect(personaIssues[0].message).toBe('Invalid persona ID');
		}
	});

	it('rejects empty persona_id', () => {
		const result = switchContextSchema.safeParse({
			persona_id: ''
		});
		expect(result.success).toBe(false);
	});

	it('defaults reason to empty string when omitted', () => {
		const result = switchContextSchema.safeParse({
			persona_id: '550e8400-e29b-41d4-a716-446655440001'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('');
		}
	});
});

describe('switchBackSchema', () => {
	it('accepts valid input with reason', () => {
		const result = switchBackSchema.safeParse({
			reason: 'Maintenance complete'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('Maintenance complete');
		}
	});

	it('accepts valid input without reason', () => {
		const result = switchBackSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('');
		}
	});

	it('defaults reason to empty string', () => {
		const result = switchBackSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('');
		}
	});
});
