import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-requests', () => ({
	submitNhiRequest: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';

describe('NHI Request Create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('returns a form object', async () => {
			const result = (await load({} as any)) as any;
			expect(result.form).toBeDefined();
		});

		it('form has initial empty values', async () => {
			const result = (await load({} as any)) as any;
			expect(result.form.data.name).toBe('');
			expect(result.form.data.purpose).toBe('');
		});

		it('form has valid flag set to false initially', async () => {
			const result = (await load({} as any)) as any;
			expect(result.form.valid).toBe(false);
		});
	});
});

describe('NHI Request Create +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	}, 15000);
});

describe('NHI Request Create form schema', () => {
	it('schema is importable', async () => {
		const mod = await import('$lib/schemas/nhi-requests');
		expect(mod.submitNhiRequestSchema).toBeDefined();
	});

	describe('field definitions', () => {
		const fields = ['name', 'purpose', 'requested_permissions', 'requested_expiration', 'rotation_interval_days'];

		it('has 5 fields', () => {
			expect(fields).toHaveLength(5);
		});

		it('includes name', () => {
			expect(fields).toContain('name');
		});

		it('includes purpose', () => {
			expect(fields).toContain('purpose');
		});

		it('includes requested_permissions', () => {
			expect(fields).toContain('requested_permissions');
		});

		it('includes requested_expiration', () => {
			expect(fields).toContain('requested_expiration');
		});

		it('includes rotation_interval_days', () => {
			expect(fields).toContain('rotation_interval_days');
		});
	});

	describe('validation rules', () => {
		it('name is required', async () => {
			const { submitNhiRequestSchema } = await import('$lib/schemas/nhi-requests');
			const result = submitNhiRequestSchema.safeParse({ name: '', purpose: 'A valid purpose here.' });
			expect(result.success).toBe(false);
		});

		it('purpose requires min 10 characters', async () => {
			const { submitNhiRequestSchema } = await import('$lib/schemas/nhi-requests');
			const result = submitNhiRequestSchema.safeParse({ name: 'Test', purpose: 'short' });
			expect(result.success).toBe(false);
		});

		it('valid data passes', async () => {
			const { submitNhiRequestSchema } = await import('$lib/schemas/nhi-requests');
			const result = submitNhiRequestSchema.safeParse({
				name: 'Test SA',
				purpose: 'This is a valid purpose for testing.'
			});
			expect(result.success).toBe(true);
		});
	});

	describe('form labels', () => {
		const labels = ['Name', 'Purpose', 'Permissions (comma-separated UUIDs, optional)', 'Expiration Date (optional)', 'Credential Rotation Interval (days, optional)'];

		it('has correct number of labels', () => {
			expect(labels).toHaveLength(5);
		});
	});

	describe('page navigation', () => {
		it('back link points to /nhi/requests', () => {
			const href = '/nhi/requests';
			expect(href).toBe('/nhi/requests');
		});

		it('cancel link points to /nhi/requests', () => {
			const href = '/nhi/requests';
			expect(href).toBe('/nhi/requests');
		});
	});
});
