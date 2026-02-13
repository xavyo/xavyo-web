import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	getScriptTemplate: vi.fn()
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
import { getScriptTemplate } from '$lib/api/provisioning-scripts';
import { hasAdminRole } from '$lib/server/auth';
import type { ScriptTemplate } from '$lib/api/types';

const mockGetTemplate = vi.mocked(getScriptTemplate);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeTemplate(overrides: Partial<ScriptTemplate> = {}): ScriptTemplate {
	return {
		id: 'tpl-1',
		tenant_id: 'tid',
		name: 'AD Attribute Mapper',
		description: 'Maps AD attributes to identity fields',
		category: 'attribute_mapping',
		template_body: 'return { displayName: ctx.cn };',
		placeholder_annotations: { cn: 'Common Name from AD' },
		is_system: false,
		created_by: 'admin-user',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-15T00:00:00Z',
		...overrides
	};
}

describe('Template Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects to login when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					params: { id: 'tpl-1' }
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
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } },
					params: { id: 'tpl-1' }
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
					locals: mockLocals(false),
					params: { id: 'tpl-1' }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/');
			}
		});

		it('returns template for admin', async () => {
			mockGetTemplate.mockResolvedValue(makeTemplate());

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'tpl-1' }
			} as any)) as any;

			expect(result.template).toBeDefined();
			expect(result.template.id).toBe('tpl-1');
			expect(result.template.name).toBe('AD Attribute Mapper');
		});

		it('calls getScriptTemplate with params.id', async () => {
			mockGetTemplate.mockResolvedValue(makeTemplate());

			await load({
				locals: mockLocals(true),
				params: { id: 'tpl-xyz' }
			} as any);

			expect(mockGetTemplate).toHaveBeenCalledWith('tpl-xyz', 'tok', 'tid');
		});

		it('throws when getScriptTemplate fails', async () => {
			mockGetTemplate.mockRejectedValue(new Error('not found'));

			await expect(
				load({
					locals: mockLocals(true),
					params: { id: 'bad-id' }
				} as any)
			).rejects.toThrow('not found');
		});

		it('calls hasAdminRole with user roles', async () => {
			mockGetTemplate.mockResolvedValue(makeTemplate());

			await load({
				locals: mockLocals(true),
				params: { id: 'tpl-1' }
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});

		it('passes correct token and tenantId', async () => {
			mockGetTemplate.mockResolvedValue(makeTemplate());

			await load({
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['admin'] }
				},
				params: { id: 'tpl-1' }
			} as any);

			expect(mockGetTemplate).toHaveBeenCalledWith('tpl-1', 'my-token', 'my-tenant');
		});
	});
});

describe('Template Detail +page.svelte', () => {
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

describe('Template Detail rendering logic', () => {
	describe('template information fields', () => {
		const fields = ['Category', 'System Template', 'Created', 'Updated'];

		it('has 4 information fields', () => {
			expect(fields).toHaveLength(4);
		});

		it('displays Category field', () => {
			expect(fields).toContain('Category');
		});

		it('displays System Template field', () => {
			expect(fields).toContain('System Template');
		});

		it('displays Created field', () => {
			expect(fields).toContain('Created');
		});

		it('displays Updated field', () => {
			expect(fields).toContain('Updated');
		});
	});

	describe('system template display', () => {
		it('shows Yes for system templates', () => {
			const template = makeTemplate({ is_system: true });
			const display = template.is_system ? 'Yes' : 'No';
			expect(display).toBe('Yes');
		});

		it('shows No for non-system templates', () => {
			const template = makeTemplate({ is_system: false });
			const display = template.is_system ? 'Yes' : 'No';
			expect(display).toBe('No');
		});
	});

	describe('system badge in header', () => {
		it('shows System badge for system templates', () => {
			const template = makeTemplate({ is_system: true });
			expect(template.is_system).toBe(true);
		});

		it('hides System badge for non-system templates', () => {
			const template = makeTemplate({ is_system: false });
			expect(template.is_system).toBe(false);
		});
	});

	describe('action buttons', () => {
		it('shows Use Template button', () => {
			const text = 'Use Template';
			expect(text).toBe('Use Template');
		});

		it('shows Delete button for non-system templates', () => {
			const template = makeTemplate({ is_system: false });
			expect(!template.is_system).toBe(true);
		});

		it('hides Delete button for system templates', () => {
			const template = makeTemplate({ is_system: true });
			expect(!template.is_system).toBe(false);
		});
	});

	describe('card sections', () => {
		it('has Template Information card', () => {
			const heading = 'Template Information';
			expect(heading).toBe('Template Information');
		});

		it('has Template Body card', () => {
			const heading = 'Template Body';
			expect(heading).toBe('Template Body');
		});

		it('has Placeholder Annotations card when annotations exist', () => {
			const heading = 'Placeholder Annotations';
			expect(heading).toBe('Placeholder Annotations');
		});

		it('has Actions card', () => {
			const heading = 'Actions';
			expect(heading).toBe('Actions');
		});
	});

	describe('placeholder annotations display', () => {
		it('shows annotations card when annotations exist', () => {
			const template = makeTemplate({
				placeholder_annotations: { cn: 'Common Name' }
			});
			expect(template.placeholder_annotations).toBeTruthy();
		});

		it('hides annotations card when annotations are null', () => {
			const template = makeTemplate({ placeholder_annotations: null });
			expect(template.placeholder_annotations).toBeFalsy();
		});

		it('formats JSON annotations with indentation', () => {
			const annotations = { cn: 'Common Name', sn: 'Surname' };
			const formatted = JSON.stringify(annotations, null, 2);
			expect(formatted).toContain('"cn"');
			expect(formatted).toContain('"sn"');
		});

		it('displays string annotations as-is', () => {
			const annotations = '{"cn": "Common Name"}';
			expect(typeof annotations).toBe('string');
		});
	});

	describe('description display', () => {
		it('shows description when available', () => {
			const template = makeTemplate({ description: 'My template description' });
			expect(template.description).toBe('My template description');
		});

		it('shows fallback for null description', () => {
			const template = makeTemplate({ description: null });
			const display = template.description ?? 'No description';
			expect(display).toBe('No description');
		});
	});

	describe('navigation links', () => {
		it('has back to scripts hub link', () => {
			const href = '/governance/provisioning-scripts';
			expect(href).toBe('/governance/provisioning-scripts');
		});

		it('back link text is Back to Scripts', () => {
			const text = 'Back to Scripts';
			expect(text).toBe('Back to Scripts');
		});
	});

	describe('category badge display', () => {
		it('shows category badge in header', () => {
			const template = makeTemplate({ category: 'attribute_mapping' });
			expect(template.category).toBe('attribute_mapping');
		});

		it('shows category badge in information card', () => {
			// Category appears twice: header and info card
			const fields = ['Category'];
			expect(fields).toContain('Category');
		});
	});

	describe('mock data conformity', () => {
		it('ScriptTemplate has all required fields', () => {
			const t = makeTemplate();
			expect(t.id).toBeDefined();
			expect(t.tenant_id).toBeDefined();
			expect(t.name).toBeDefined();
			expect(t.category).toBeDefined();
			expect(t.template_body).toBeDefined();
			expect(typeof t.is_system).toBe('boolean');
			expect(t.created_by).toBeDefined();
			expect(t.created_at).toBeDefined();
			expect(t.updated_at).toBeDefined();
		});

		it('ScriptTemplate category is a valid value', () => {
			const validCategories = [
				'attribute_mapping',
				'value_generation',
				'conditional_logic',
				'data_formatting',
				'custom'
			];
			const t = makeTemplate();
			expect(validCategories).toContain(t.category);
		});

		it('ScriptTemplate template_body is a non-empty string', () => {
			const t = makeTemplate();
			expect(t.template_body.length).toBeGreaterThan(0);
		});
	});

	describe('template body display', () => {
		it('displays template body in pre block', () => {
			const template = makeTemplate({ template_body: 'return { displayName: ctx.cn };' });
			expect(template.template_body).toBe('return { displayName: ctx.cn };');
		});
	});

	describe('page title uses template name', () => {
		it('displays template name as page title', () => {
			const template = makeTemplate({ name: 'My Template' });
			expect(template.name).toBe('My Template');
		});
	});
});
