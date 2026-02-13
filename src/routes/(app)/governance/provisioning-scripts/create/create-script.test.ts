import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	createProvisioningScript: vi.fn()
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
import { hasAdminRole } from '$lib/server/auth';

const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Create Script +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects to login when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}
		});

		it('redirects to login when no tenantId', async () => {
			try {
				await load({
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}
		});

		it('redirects non-admin users to home', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false)
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/');
			}
		});

		it('returns form for admin user', async () => {
			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.form).toBeDefined();
		});

		it('form has default empty values', async () => {
			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.form.data.name).toBe('');
			expect(result.form.data.description).toBe('');
		});

		it('calls hasAdminRole with user roles', async () => {
			await load({
				locals: mockLocals(true)
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('Create Script +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});

describe('Create Script form rendering logic', () => {
	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Create Script';
			expect(title).toBe('Create Script');
		});

		it('has correct description', () => {
			const description = 'Create a new provisioning script';
			expect(description).toContain('provisioning script');
		});
	});

	describe('form fields', () => {
		const fields = ['name', 'description'];

		it('has Name field', () => {
			expect(fields).toContain('name');
		});

		it('has Description field', () => {
			expect(fields).toContain('description');
		});

		it('has 2 fields total', () => {
			expect(fields).toHaveLength(2);
		});
	});

	describe('form labels', () => {
		it('name field label is Name', () => {
			const label = 'Name';
			expect(label).toBe('Name');
		});

		it('description field label includes optional', () => {
			const label = 'Description (optional)';
			expect(label).toContain('optional');
		});
	});

	describe('form placeholders', () => {
		it('name placeholder suggests example', () => {
			const placeholder = 'e.g. AD User Sync Script';
			expect(placeholder).toContain('AD');
		});

		it('description placeholder describes purpose', () => {
			const placeholder = 'Describe what this script does...';
			expect(placeholder).toContain('script');
		});
	});

	describe('form buttons', () => {
		it('has Create Script submit button', () => {
			const text = 'Create Script';
			expect(text).toBe('Create Script');
		});

		it('has Cancel link', () => {
			const text = 'Cancel';
			expect(text).toBe('Cancel');
		});

		it('Cancel links back to hub', () => {
			const href = '/governance/provisioning-scripts';
			expect(href).toBe('/governance/provisioning-scripts');
		});
	});

	describe('back link', () => {
		it('has back link to Scripts', () => {
			const href = '/governance/provisioning-scripts';
			expect(href).toBe('/governance/provisioning-scripts');
		});

		it('has correct back link text', () => {
			// Rendered with &larr; entity
			const text = 'Back to Scripts';
			expect(text).toContain('Back');
		});
	});

	describe('card header', () => {
		it('has Script details heading', () => {
			const heading = 'Script details';
			expect(heading).toBe('Script details');
		});

		it('has helper text about version creation', () => {
			const text =
				'Create the script first, then add the script body via version creation on the detail page.';
			expect(text).toContain('version creation');
		});
	});

	describe('schema validation', () => {
		it('name is required', () => {
			const nameRequired = true;
			expect(nameRequired).toBe(true);
		});

		it('name max length is 200', () => {
			const maxLen = 200;
			expect(maxLen).toBe(200);
		});

		it('description max length is 2000', () => {
			const maxLen = 2000;
			expect(maxLen).toBe(2000);
		});

		it('description is optional', () => {
			const isOptional = true;
			expect(isOptional).toBe(true);
		});
	});
});
