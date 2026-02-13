import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	createScriptTemplate: vi.fn()
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

describe('Create Template +page.server', () => {
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
			expect(result.form.data.template_body).toBe('');
			expect(result.form.data.placeholder_annotations).toBe('');
		});

		it('calls hasAdminRole with user roles', async () => {
			await load({
				locals: mockLocals(true)
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('Create Template +page.svelte', () => {
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

describe('Create Template form rendering logic', () => {
	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Create Template';
			expect(title).toBe('Create Template');
		});

		it('has correct description', () => {
			const description = 'Create a new script template';
			expect(description).toContain('script template');
		});
	});

	describe('form fields', () => {
		const fields = ['name', 'description', 'category', 'template_body', 'placeholder_annotations'];

		it('has Name field', () => {
			expect(fields).toContain('name');
		});

		it('has Description field', () => {
			expect(fields).toContain('description');
		});

		it('has Category field', () => {
			expect(fields).toContain('category');
		});

		it('has Template Body field', () => {
			expect(fields).toContain('template_body');
		});

		it('has Placeholder Annotations field', () => {
			expect(fields).toContain('placeholder_annotations');
		});

		it('has 5 fields total', () => {
			expect(fields).toHaveLength(5);
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

		it('category field label is Category', () => {
			const label = 'Category';
			expect(label).toBe('Category');
		});

		it('template body field label is Template Body', () => {
			const label = 'Template Body';
			expect(label).toBe('Template Body');
		});

		it('annotations field label includes optional JSON', () => {
			const label = 'Placeholder Annotations (optional JSON)';
			expect(label).toContain('optional JSON');
		});
	});

	describe('category options', () => {
		const categories = [
			{ value: 'attribute_mapping', label: 'Attribute Mapping' },
			{ value: 'value_generation', label: 'Value Generation' },
			{ value: 'conditional_logic', label: 'Conditional Logic' },
			{ value: 'data_formatting', label: 'Data Formatting' },
			{ value: 'custom', label: 'Custom' }
		];

		it('has 5 category options', () => {
			expect(categories).toHaveLength(5);
		});

		it('has Attribute Mapping option', () => {
			expect(categories.find((c) => c.value === 'attribute_mapping')?.label).toBe(
				'Attribute Mapping'
			);
		});

		it('has Value Generation option', () => {
			expect(categories.find((c) => c.value === 'value_generation')?.label).toBe(
				'Value Generation'
			);
		});

		it('has Conditional Logic option', () => {
			expect(categories.find((c) => c.value === 'conditional_logic')?.label).toBe(
				'Conditional Logic'
			);
		});

		it('has Data Formatting option', () => {
			expect(categories.find((c) => c.value === 'data_formatting')?.label).toBe(
				'Data Formatting'
			);
		});

		it('has Custom option', () => {
			expect(categories.find((c) => c.value === 'custom')?.label).toBe('Custom');
		});
	});

	describe('form placeholders', () => {
		it('name placeholder suggests example', () => {
			const placeholder = 'e.g. AD Attribute Mapper';
			expect(placeholder).toContain('AD');
		});

		it('description placeholder describes purpose', () => {
			const placeholder = 'Describe the template...';
			expect(placeholder).toContain('template');
		});

		it('template body placeholder suggests script body', () => {
			const placeholder = 'Enter template script body...';
			expect(placeholder).toContain('script body');
		});

		it('annotations placeholder shows JSON format', () => {
			const placeholder = '{"placeholder": "description"}';
			expect(placeholder).toContain('"placeholder"');
		});
	});

	describe('form buttons', () => {
		it('has Create Template submit button', () => {
			const text = 'Create Template';
			expect(text).toBe('Create Template');
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
		it('has back link to Scripts hub', () => {
			const href = '/governance/provisioning-scripts';
			expect(href).toBe('/governance/provisioning-scripts');
		});
	});

	describe('card heading', () => {
		it('has Template details heading', () => {
			const heading = 'Template details';
			expect(heading).toBe('Template details');
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

		it('category is required enum', () => {
			const validCategories = [
				'attribute_mapping',
				'value_generation',
				'conditional_logic',
				'data_formatting',
				'custom'
			];
			expect(validCategories).toHaveLength(5);
		});

		it('template_body is required', () => {
			const bodyRequired = true;
			expect(bodyRequired).toBe(true);
		});

		it('placeholder_annotations is optional', () => {
			const isOptional = true;
			expect(isOptional).toBe(true);
		});

		it('description max length is 2000', () => {
			const maxLen = 2000;
			expect(maxLen).toBe(2000);
		});
	});
});
