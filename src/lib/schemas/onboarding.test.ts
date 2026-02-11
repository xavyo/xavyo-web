import { describe, it, expect } from 'vitest';
import { onboardingSchema } from './onboarding';

describe('onboardingSchema', () => {
	it('accepts a valid organization name', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Acme Corp' });
		expect(result.success).toBe(true);
	});

	it('accepts names with hyphens', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Acme-Corp' });
		expect(result.success).toBe(true);
	});

	it('accepts names with underscores', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Acme_Corp' });
		expect(result.success).toBe(true);
	});

	it('accepts names with spaces', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Acme Corp Inc' });
		expect(result.success).toBe(true);
	});

	it('accepts names with numbers', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Company123' });
		expect(result.success).toBe(true);
	});

	it('rejects empty organization name', () => {
		const result = onboardingSchema.safeParse({ organizationName: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name longer than 100 characters', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'a'.repeat(101) });
		expect(result.success).toBe(false);
	});

	it('accepts name exactly 100 characters', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'a'.repeat(100) });
		expect(result.success).toBe(true);
	});

	it('rejects special characters', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Acme<script>' });
		expect(result.success).toBe(false);
	});

	it('rejects names with dots', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Acme.Corp' });
		expect(result.success).toBe(false);
	});

	it('rejects names with slashes', () => {
		const result = onboardingSchema.safeParse({ organizationName: 'Acme/Corp' });
		expect(result.success).toBe(false);
	});
});
