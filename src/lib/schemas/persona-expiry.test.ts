import { describe, it, expect } from 'vitest';
import { extendPersonaSchema } from './persona-expiry';

describe('extendPersonaSchema', () => {
	it('accepts valid input with date', () => {
		const result = extendPersonaSchema.safeParse({
			new_valid_until: '2026-12-31'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.new_valid_until).toBe('2026-12-31');
		}
	});

	it('accepts valid input with date and reason', () => {
		const result = extendPersonaSchema.safeParse({
			new_valid_until: '2026-12-31',
			reason: 'Extended for project completion'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('Extended for project completion');
		}
	});

	it('rejects missing new_valid_until', () => {
		const result = extendPersonaSchema.safeParse({
			reason: 'Some reason'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty new_valid_until', () => {
		const result = extendPersonaSchema.safeParse({
			new_valid_until: ''
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const dateIssues = result.error.issues.filter((i) =>
				i.path.includes('new_valid_until')
			);
			expect(dateIssues[0].message).toBe('Expiration date is required');
		}
	});

	it('defaults reason to empty string when omitted', () => {
		const result = extendPersonaSchema.safeParse({
			new_valid_until: '2026-12-31'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('');
		}
	});

	it('accepts ISO datetime string', () => {
		const result = extendPersonaSchema.safeParse({
			new_valid_until: '2026-12-31T23:59:59Z'
		});
		expect(result.success).toBe(true);
	});
});
