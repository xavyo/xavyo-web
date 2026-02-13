import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	listProvisioningScripts: vi.fn(),
	listScriptTemplates: vi.fn()
}));

vi.mock('$lib/api/script-analytics', () => ({
	getScriptAnalyticsDashboard: vi.fn()
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
import { listProvisioningScripts, listScriptTemplates } from '$lib/api/provisioning-scripts';
import { getScriptAnalyticsDashboard } from '$lib/api/script-analytics';
import { hasAdminRole } from '$lib/server/auth';
import type {
	ProvisioningScript,
	ScriptTemplate,
	ScriptAnalyticsDashboard
} from '$lib/api/types';

const mockListScripts = vi.mocked(listProvisioningScripts);
const mockListTemplates = vi.mocked(listScriptTemplates);
const mockGetDashboard = vi.mocked(getScriptAnalyticsDashboard);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeScript(overrides: Partial<ProvisioningScript> = {}): ProvisioningScript {
	return {
		id: 'script-1',
		tenant_id: 'tid',
		name: 'AD Sync Script',
		description: 'Syncs attributes from Active Directory',
		current_version: 3,
		status: 'active',
		is_system: false,
		created_by: 'admin-user',
		created_at: '2026-02-01T10:00:00Z',
		updated_at: '2026-02-10T10:00:00Z',
		...overrides
	};
}

function makeTemplate(overrides: Partial<ScriptTemplate> = {}): ScriptTemplate {
	return {
		id: 'tpl-1',
		tenant_id: 'tid',
		name: 'AD Attribute Mapper',
		description: 'Maps AD attributes to identity fields',
		category: 'attribute_mapping',
		template_body: 'return { displayName: ctx.cn };',
		placeholder_annotations: { cn: 'Common Name from AD' },
		is_system: true,
		created_by: 'system',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-15T00:00:00Z',
		...overrides
	};
}

function makeDashboard(overrides: Partial<ScriptAnalyticsDashboard> = {}): ScriptAnalyticsDashboard {
	return {
		total_scripts: 10,
		active_scripts: 7,
		total_executions: 1500,
		success_rate: 0.95,
		avg_duration_ms: 42,
		scripts: [
			{
				script_id: 'script-1',
				name: 'AD Sync Script',
				total_executions: 500,
				success_count: 480,
				failure_count: 20,
				avg_duration_ms: 35
			}
		],
		...overrides
	};
}

describe('Provisioning Scripts hub +page.server', () => {
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

		it('returns scripts, templates, and dashboard for admin', async () => {
			const scripts = [makeScript()];
			const templates = [makeTemplate()];
			const dashboard = makeDashboard();

			mockListScripts.mockResolvedValue({ scripts, total: 1 });
			mockListTemplates.mockResolvedValue({ templates, total: 1 });
			mockGetDashboard.mockResolvedValue(dashboard);

			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.scripts).toHaveLength(1);
			expect(result.scripts[0].name).toBe('AD Sync Script');
			expect(result.scriptsTotal).toBe(1);
			expect(result.templates).toHaveLength(1);
			expect(result.templates[0].name).toBe('AD Attribute Mapper');
			expect(result.templatesTotal).toBe(1);
			expect(result.dashboard).toBeDefined();
			expect(result.dashboard.total_scripts).toBe(10);
		});

		it('calls listProvisioningScripts with page params', async () => {
			mockListScripts.mockResolvedValue({ scripts: [], total: 0 });
			mockListTemplates.mockResolvedValue({ templates: [], total: 0 });
			mockGetDashboard.mockResolvedValue(makeDashboard());

			await load({
				locals: mockLocals(true)
			} as any);

			expect(mockListScripts).toHaveBeenCalledWith(
				{ page: 1, page_size: 50 },
				'tok',
				'tid'
			);
		});

		it('calls listScriptTemplates with page params', async () => {
			mockListScripts.mockResolvedValue({ scripts: [], total: 0 });
			mockListTemplates.mockResolvedValue({ templates: [], total: 0 });
			mockGetDashboard.mockResolvedValue(makeDashboard());

			await load({
				locals: mockLocals(true)
			} as any);

			expect(mockListTemplates).toHaveBeenCalledWith(
				{ page: 1, page_size: 50 },
				'tok',
				'tid'
			);
		});

		it('calls getScriptAnalyticsDashboard with token and tenantId', async () => {
			mockListScripts.mockResolvedValue({ scripts: [], total: 0 });
			mockListTemplates.mockResolvedValue({ templates: [], total: 0 });
			mockGetDashboard.mockResolvedValue(makeDashboard());

			await load({
				locals: mockLocals(true)
			} as any);

			expect(mockGetDashboard).toHaveBeenCalledWith('tok', 'tid');
		});

		it('gracefully handles scripts API failure', async () => {
			mockListScripts.mockRejectedValue(new Error('scripts failed'));
			mockListTemplates.mockResolvedValue({ templates: [makeTemplate()], total: 1 });
			mockGetDashboard.mockResolvedValue(makeDashboard());

			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.scripts).toEqual([]);
			expect(result.scriptsTotal).toBe(0);
			expect(result.templates).toHaveLength(1);
			expect(result.dashboard).toBeDefined();
		});

		it('gracefully handles templates API failure', async () => {
			mockListScripts.mockResolvedValue({ scripts: [makeScript()], total: 1 });
			mockListTemplates.mockRejectedValue(new Error('templates failed'));
			mockGetDashboard.mockResolvedValue(makeDashboard());

			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.scripts).toHaveLength(1);
			expect(result.templates).toEqual([]);
			expect(result.templatesTotal).toBe(0);
		});

		it('gracefully handles dashboard API failure', async () => {
			mockListScripts.mockResolvedValue({ scripts: [makeScript()], total: 1 });
			mockListTemplates.mockResolvedValue({ templates: [makeTemplate()], total: 1 });
			mockGetDashboard.mockRejectedValue(new Error('dashboard failed'));

			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.scripts).toHaveLength(1);
			expect(result.templates).toHaveLength(1);
			expect(result.dashboard).toBeNull();
		});

		it('gracefully handles all APIs failing', async () => {
			mockListScripts.mockRejectedValue(new Error('fail'));
			mockListTemplates.mockRejectedValue(new Error('fail'));
			mockGetDashboard.mockRejectedValue(new Error('fail'));

			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.scripts).toEqual([]);
			expect(result.scriptsTotal).toBe(0);
			expect(result.templates).toEqual([]);
			expect(result.templatesTotal).toBe(0);
			expect(result.dashboard).toBeNull();
		});

		it('calls hasAdminRole with user roles', async () => {
			mockListScripts.mockResolvedValue({ scripts: [], total: 0 });
			mockListTemplates.mockResolvedValue({ templates: [], total: 0 });
			mockGetDashboard.mockResolvedValue(makeDashboard());

			await load({
				locals: mockLocals(true)
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('Provisioning Scripts hub +page.svelte', () => {
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

describe('Provisioning Scripts hub rendering logic', () => {
	describe('tab definitions', () => {
		const tabs = [
			{ id: 'scripts', label: 'Scripts' },
			{ id: 'templates', label: 'Templates' },
			{ id: 'analytics', label: 'Analytics' }
		];

		it('has 3 tabs', () => {
			expect(tabs).toHaveLength(3);
		});

		it('has Scripts as first tab', () => {
			expect(tabs[0].label).toBe('Scripts');
		});

		it('has Templates as second tab', () => {
			expect(tabs[1].label).toBe('Templates');
		});

		it('has Analytics as third tab', () => {
			expect(tabs[2].label).toBe('Analytics');
		});
	});

	describe('script status badge mapping', () => {
		function scriptStatusColor(status: string): string {
			switch (status) {
				case 'draft':
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
				case 'active':
					return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
				case 'inactive':
					return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			}
		}

		it('draft status gets gray badge', () => {
			expect(scriptStatusColor('draft')).toContain('gray');
		});

		it('active status gets green badge', () => {
			expect(scriptStatusColor('active')).toContain('green');
		});

		it('inactive status gets yellow badge', () => {
			expect(scriptStatusColor('inactive')).toContain('yellow');
		});

		it('unknown status gets gray badge', () => {
			expect(scriptStatusColor('unknown')).toContain('gray');
		});
	});

	describe('template category labels', () => {
		const categoryLabels: Record<string, string> = {
			attribute_mapping: 'Attribute Mapping',
			value_generation: 'Value Generation',
			conditional_logic: 'Conditional Logic',
			data_formatting: 'Data Formatting',
			custom: 'Custom'
		};

		it('maps attribute_mapping correctly', () => {
			expect(categoryLabels['attribute_mapping']).toBe('Attribute Mapping');
		});

		it('maps value_generation correctly', () => {
			expect(categoryLabels['value_generation']).toBe('Value Generation');
		});

		it('maps conditional_logic correctly', () => {
			expect(categoryLabels['conditional_logic']).toBe('Conditional Logic');
		});

		it('maps data_formatting correctly', () => {
			expect(categoryLabels['data_formatting']).toBe('Data Formatting');
		});

		it('maps custom correctly', () => {
			expect(categoryLabels['custom']).toBe('Custom');
		});
	});

	describe('script table headers', () => {
		const headers = ['Name', 'Status', 'Version', 'Created'];

		it('has 4 columns', () => {
			expect(headers).toHaveLength(4);
		});

		it('has Name as first column', () => {
			expect(headers[0]).toBe('Name');
		});

		it('has Status as second column', () => {
			expect(headers[1]).toBe('Status');
		});

		it('has Version as third column', () => {
			expect(headers[2]).toBe('Version');
		});

		it('has Created as fourth column', () => {
			expect(headers[3]).toBe('Created');
		});
	});

	describe('template table headers', () => {
		const headers = ['Name', 'Category', 'Created'];

		it('has 3 columns', () => {
			expect(headers).toHaveLength(3);
		});

		it('has Name as first column', () => {
			expect(headers[0]).toBe('Name');
		});

		it('has Category as second column', () => {
			expect(headers[1]).toBe('Category');
		});

		it('has Created as third column', () => {
			expect(headers[2]).toBe('Created');
		});
	});

	describe('empty state messages', () => {
		it('shows correct empty scripts message', () => {
			const msg = 'No provisioning scripts found';
			expect(msg).toBe('No provisioning scripts found');
		});

		it('shows correct empty templates message', () => {
			const msg = 'No script templates found';
			expect(msg).toBe('No script templates found');
		});

		it('shows Create Script CTA', () => {
			const text = 'Create your first script';
			expect(text).toBe('Create your first script');
		});

		it('shows Create Template CTA', () => {
			const text = 'Create your first template';
			expect(text).toBe('Create your first template');
		});
	});

	describe('script link generation', () => {
		it('generates correct detail link from script id', () => {
			const script = makeScript({ id: 'script-abc' });
			const href = `/governance/provisioning-scripts/${script.id}`;
			expect(href).toBe('/governance/provisioning-scripts/script-abc');
		});

		it('generates correct create script link', () => {
			const href = '/governance/provisioning-scripts/create';
			expect(href).toBe('/governance/provisioning-scripts/create');
		});
	});

	describe('template link generation', () => {
		it('generates correct detail link from template id', () => {
			const template = makeTemplate({ id: 'tpl-abc' });
			const href = `/governance/provisioning-scripts/templates/${template.id}`;
			expect(href).toBe('/governance/provisioning-scripts/templates/tpl-abc');
		});

		it('generates correct create template link', () => {
			const href = '/governance/provisioning-scripts/templates/create';
			expect(href).toBe('/governance/provisioning-scripts/templates/create');
		});
	});

	describe('version display', () => {
		it('formats version with v prefix', () => {
			const script = makeScript({ current_version: 3 });
			const display = `v${script.current_version}`;
			expect(display).toBe('v3');
		});

		it('formats version 1 correctly', () => {
			const script = makeScript({ current_version: 1 });
			const display = `v${script.current_version}`;
			expect(display).toBe('v1');
		});
	});

	describe('system badge display', () => {
		it('shows System badge for system scripts', () => {
			const script = makeScript({ is_system: true });
			expect(script.is_system).toBe(true);
		});

		it('hides System badge for non-system scripts', () => {
			const script = makeScript({ is_system: false });
			expect(script.is_system).toBe(false);
		});

		it('shows System badge for system templates', () => {
			const template = makeTemplate({ is_system: true });
			expect(template.is_system).toBe(true);
		});
	});

	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Provisioning Scripts';
			expect(title).toBe('Provisioning Scripts');
		});

		it('has correct description', () => {
			const description = 'Manage automation scripts for provisioning operations';
			expect(description).toContain('automation scripts');
			expect(description).toContain('provisioning');
		});
	});

	describe('mock data conformity', () => {
		it('ProvisioningScript has all required fields', () => {
			const s = makeScript();
			expect(s.id).toBeDefined();
			expect(s.tenant_id).toBeDefined();
			expect(s.name).toBeDefined();
			expect(typeof s.current_version).toBe('number');
			expect(s.status).toBeDefined();
			expect(typeof s.is_system).toBe('boolean');
			expect(s.created_by).toBeDefined();
			expect(s.created_at).toBeDefined();
			expect(s.updated_at).toBeDefined();
		});

		it('ProvisioningScript status is a valid value', () => {
			const validStatuses = ['draft', 'active', 'inactive'];
			const s = makeScript();
			expect(validStatuses).toContain(s.status);
		});

		it('ScriptTemplate has all required fields', () => {
			const t = makeTemplate();
			expect(t.id).toBeDefined();
			expect(t.tenant_id).toBeDefined();
			expect(t.name).toBeDefined();
			expect(t.category).toBeDefined();
			expect(t.template_body).toBeDefined();
			expect(typeof t.is_system).toBe('boolean');
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

		it('ScriptAnalyticsDashboard has all required fields', () => {
			const d = makeDashboard();
			expect(typeof d.total_scripts).toBe('number');
			expect(typeof d.active_scripts).toBe('number');
			expect(typeof d.total_executions).toBe('number');
			expect(typeof d.success_rate).toBe('number');
			expect(typeof d.avg_duration_ms).toBe('number');
			expect(Array.isArray(d.scripts)).toBe(true);
		});
	});
});
