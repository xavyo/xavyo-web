import { describe, it, expect } from 'vitest';
import {
	submitNhiRequestSchema,
	approveNhiRequestSchema,
	rejectNhiRequestSchema
} from './nhi-requests';

describe('submitNhiRequestSchema', () => {
	it('accepts valid input with all required fields', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request',
			purpose: 'This is a test purpose for the NHI request'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request',
			purpose: 'This is a test purpose for the NHI request',
			requested_permissions: 'read,write',
			requested_expiration: '2026-12-31',
			rotation_interval_days: 90
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.requested_permissions).toBe('read,write');
			expect(result.data.rotation_interval_days).toBe(90);
		}
	});

	it('rejects missing name', () => {
		const result = submitNhiRequestSchema.safeParse({
			purpose: 'This is a test purpose for the NHI request'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: '',
			purpose: 'This is a test purpose for the NHI request'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const nameIssues = result.error.issues.filter((i) => i.path.includes('name'));
			expect(nameIssues[0].message).toBe('Name is required');
		}
	});

	it('rejects name over 200 characters', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'x'.repeat(201),
			purpose: 'This is a test purpose for the NHI request'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing purpose', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request'
		});
		expect(result.success).toBe(false);
	});

	it('rejects purpose under 10 characters', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request',
			purpose: 'Short'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const purposeIssues = result.error.issues.filter((i) => i.path.includes('purpose'));
			expect(purposeIssues[0].message).toBe('Purpose must be at least 10 characters');
		}
	});

	it('defaults optional fields when omitted', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request',
			purpose: 'This is a test purpose for the NHI request'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.requested_permissions).toBe('');
			expect(result.data.requested_expiration).toBe('');
			expect(result.data.rotation_interval_days).toBeUndefined();
		}
	});

	it('rejects rotation_interval_days below 1', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request',
			purpose: 'This is a test purpose for the NHI request',
			rotation_interval_days: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects rotation_interval_days above 365', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request',
			purpose: 'This is a test purpose for the NHI request',
			rotation_interval_days: 366
		});
		expect(result.success).toBe(false);
	});

	it('coerces rotation_interval_days from string', () => {
		const result = submitNhiRequestSchema.safeParse({
			name: 'Test NHI Request',
			purpose: 'This is a test purpose for the NHI request',
			rotation_interval_days: '30'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.rotation_interval_days).toBe(30);
		}
	});
});

describe('approveNhiRequestSchema', () => {
	it('accepts valid input with comments', () => {
		const result = approveNhiRequestSchema.safeParse({
			comments: 'Approved after review'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.comments).toBe('Approved after review');
		}
	});

	it('accepts valid input without comments', () => {
		const result = approveNhiRequestSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.comments).toBe('');
		}
	});

	it('defaults comments to empty string when omitted', () => {
		const result = approveNhiRequestSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.comments).toBe('');
		}
	});
});

describe('rejectNhiRequestSchema', () => {
	it('accepts valid input with reason', () => {
		const result = rejectNhiRequestSchema.safeParse({
			reason: 'Does not meet security requirements'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('Does not meet security requirements');
		}
	});

	it('rejects missing reason', () => {
		const result = rejectNhiRequestSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects reason under 5 characters', () => {
		const result = rejectNhiRequestSchema.safeParse({
			reason: 'No'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const reasonIssues = result.error.issues.filter((i) => i.path.includes('reason'));
			expect(reasonIssues[0].message).toBe('Reason must be at least 5 characters');
		}
	});

	it('accepts reason with exactly 5 characters', () => {
		const result = rejectNhiRequestSchema.safeParse({
			reason: 'Nope!'
		});
		expect(result.success).toBe(true);
	});
});
