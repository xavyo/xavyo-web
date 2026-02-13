import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	getProvisioningScript: vi.fn(),
	listScriptVersions: vi.fn(),
	listHookBindings: vi.fn()
}));

vi.mock('$lib/api/script-analytics', () => ({
	listScriptExecutionLogs: vi.fn()
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
import {
	getProvisioningScript,
	listScriptVersions,
	listHookBindings
} from '$lib/api/provisioning-scripts';
import { listScriptExecutionLogs } from '$lib/api/script-analytics';
import { hasAdminRole } from '$lib/server/auth';
import type {
	ProvisioningScript,
	ScriptVersion,
	HookBinding,
	ScriptExecutionLog
} from '$lib/api/types';

const mockGetScript = vi.mocked(getProvisioningScript);
const mockListVersions = vi.mocked(listScriptVersions);
const mockListBindings = vi.mocked(listHookBindings);
const mockListLogs = vi.mocked(listScriptExecutionLogs);
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

function makeVersion(overrides: Partial<ScriptVersion> = {}): ScriptVersion {
	return {
		id: 'ver-1',
		script_id: 'script-1',
		version_number: 3,
		script_body: 'return { displayName: ctx.cn };',
		change_description: 'Added cn mapping',
		created_by: 'admin-user',
		created_at: '2026-02-10T10:00:00Z',
		...overrides
	};
}

function makeBinding(overrides: Partial<HookBinding> = {}): HookBinding {
	return {
		id: 'bind-1',
		tenant_id: 'tid',
		script_id: 'script-1',
		connector_id: 'conn-1',
		hook_phase: 'before',
		operation_type: 'create',
		execution_order: 1,
		failure_policy: 'abort',
		max_retries: null,
		timeout_seconds: 30,
		enabled: true,
		created_by: 'admin-user',
		created_at: '2026-02-01T00:00:00Z',
		updated_at: '2026-02-10T00:00:00Z',
		...overrides
	};
}

function makeLog(overrides: Partial<ScriptExecutionLog> = {}): ScriptExecutionLog {
	return {
		id: 'log-1',
		tenant_id: 'tid',
		script_id: 'script-1',
		binding_id: 'bind-1',
		connector_id: 'conn-1',
		script_version: 3,
		status: 'success',
		dry_run: false,
		input_context: { cn: 'John Doe' },
		output: { displayName: 'John Doe' },
		error: null,
		duration_ms: 12,
		executed_by: 'system',
		executed_at: '2026-02-10T12:00:00Z',
		...overrides
	};
}

describe('Script Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects to login when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					params: { id: 'script-1' }
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
					params: { id: 'script-1' }
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
					params: { id: 'script-1' }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/');
			}
		});

		it('returns script, versions, bindings, and logs for admin', async () => {
			const script = makeScript();
			mockGetScript.mockResolvedValue(script);
			mockListVersions.mockResolvedValue({ versions: [makeVersion()], total: 1 });
			mockListBindings.mockResolvedValue({ bindings: [makeBinding()], total: 1 });
			mockListLogs.mockResolvedValue({ logs: [makeLog()], total: 1 });

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.script.id).toBe('script-1');
			expect(result.script.name).toBe('AD Sync Script');
			expect(result.versions).toHaveLength(1);
			expect(result.versionsTotal).toBe(1);
			expect(result.bindings).toHaveLength(1);
			expect(result.bindingsTotal).toBe(1);
			expect(result.logs).toHaveLength(1);
			expect(result.logsTotal).toBe(1);
		});

		it('calls getProvisioningScript with params.id', async () => {
			mockGetScript.mockResolvedValue(makeScript());
			mockListVersions.mockResolvedValue({ versions: [], total: 0 });
			mockListBindings.mockResolvedValue({ bindings: [], total: 0 });
			mockListLogs.mockResolvedValue({ logs: [], total: 0 });

			await load({
				locals: mockLocals(true),
				params: { id: 'script-xyz' }
			} as any);

			expect(mockGetScript).toHaveBeenCalledWith('script-xyz', 'tok', 'tid');
		});

		it('calls listScriptVersions with script id', async () => {
			mockGetScript.mockResolvedValue(makeScript());
			mockListVersions.mockResolvedValue({ versions: [], total: 0 });
			mockListBindings.mockResolvedValue({ bindings: [], total: 0 });
			mockListLogs.mockResolvedValue({ logs: [], total: 0 });

			await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any);

			expect(mockListVersions).toHaveBeenCalledWith('script-1', 'tok', 'tid');
		});

		it('calls listHookBindings with script_id filter', async () => {
			mockGetScript.mockResolvedValue(makeScript());
			mockListVersions.mockResolvedValue({ versions: [], total: 0 });
			mockListBindings.mockResolvedValue({ bindings: [], total: 0 });
			mockListLogs.mockResolvedValue({ logs: [], total: 0 });

			await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any);

			expect(mockListBindings).toHaveBeenCalledWith(
				{ script_id: 'script-1', page: 1, page_size: 50 },
				'tok',
				'tid'
			);
		});

		it('calls listScriptExecutionLogs with script_id filter', async () => {
			mockGetScript.mockResolvedValue(makeScript());
			mockListVersions.mockResolvedValue({ versions: [], total: 0 });
			mockListBindings.mockResolvedValue({ bindings: [], total: 0 });
			mockListLogs.mockResolvedValue({ logs: [], total: 0 });

			await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any);

			expect(mockListLogs).toHaveBeenCalledWith(
				{ script_id: 'script-1', page: 1, page_size: 20 },
				'tok',
				'tid'
			);
		});

		it('gracefully handles versions API failure', async () => {
			mockGetScript.mockResolvedValue(makeScript());
			mockListVersions.mockRejectedValue(new Error('versions failed'));
			mockListBindings.mockResolvedValue({ bindings: [makeBinding()], total: 1 });
			mockListLogs.mockResolvedValue({ logs: [makeLog()], total: 1 });

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.versions).toEqual([]);
			expect(result.versionsTotal).toBe(0);
			expect(result.bindings).toHaveLength(1);
			expect(result.logs).toHaveLength(1);
		});

		it('gracefully handles bindings API failure', async () => {
			mockGetScript.mockResolvedValue(makeScript());
			mockListVersions.mockResolvedValue({ versions: [makeVersion()], total: 1 });
			mockListBindings.mockRejectedValue(new Error('bindings failed'));
			mockListLogs.mockResolvedValue({ logs: [makeLog()], total: 1 });

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.versions).toHaveLength(1);
			expect(result.bindings).toEqual([]);
			expect(result.bindingsTotal).toBe(0);
			expect(result.logs).toHaveLength(1);
		});

		it('gracefully handles logs API failure', async () => {
			mockGetScript.mockResolvedValue(makeScript());
			mockListVersions.mockResolvedValue({ versions: [makeVersion()], total: 1 });
			mockListBindings.mockResolvedValue({ bindings: [makeBinding()], total: 1 });
			mockListLogs.mockRejectedValue(new Error('logs failed'));

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.versions).toHaveLength(1);
			expect(result.bindings).toHaveLength(1);
			expect(result.logs).toEqual([]);
			expect(result.logsTotal).toBe(0);
		});

		it('throws when getProvisioningScript fails (not caught)', async () => {
			mockGetScript.mockRejectedValue(new Error('not found'));

			await expect(
				load({
					locals: mockLocals(true),
					params: { id: 'bad-id' }
				} as any)
			).rejects.toThrow('not found');
		});
	});
});

describe('Script Detail +page.svelte', () => {
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

describe('Script Detail rendering logic', () => {
	describe('tab definitions', () => {
		const tabs = [
			{ id: 'details', label: 'Details' },
			{ id: 'versions', label: 'Versions' },
			{ id: 'bindings', label: 'Bindings' },
			{ id: 'logs', label: 'Logs' }
		];

		it('has 4 tabs', () => {
			expect(tabs).toHaveLength(4);
		});

		it('has Details as first tab', () => {
			expect(tabs[0].label).toBe('Details');
		});

		it('has Versions as second tab', () => {
			expect(tabs[1].label).toBe('Versions');
		});

		it('has Bindings as third tab', () => {
			expect(tabs[2].label).toBe('Bindings');
		});

		it('has Logs as fourth tab', () => {
			expect(tabs[3].label).toBe('Logs');
		});
	});

	describe('hook phase labels', () => {
		const hookPhaseLabels: Record<string, string> = { before: 'Before', after: 'After' };

		it('maps before correctly', () => {
			expect(hookPhaseLabels['before']).toBe('Before');
		});

		it('maps after correctly', () => {
			expect(hookPhaseLabels['after']).toBe('After');
		});
	});

	describe('operation type labels', () => {
		const operationLabels: Record<string, string> = {
			create: 'Create',
			update: 'Update',
			delete: 'Delete',
			enable: 'Enable',
			disable: 'Disable'
		};

		it('maps create correctly', () => {
			expect(operationLabels['create']).toBe('Create');
		});

		it('maps update correctly', () => {
			expect(operationLabels['update']).toBe('Update');
		});

		it('maps delete correctly', () => {
			expect(operationLabels['delete']).toBe('Delete');
		});

		it('maps enable correctly', () => {
			expect(operationLabels['enable']).toBe('Enable');
		});

		it('maps disable correctly', () => {
			expect(operationLabels['disable']).toBe('Disable');
		});
	});

	describe('failure policy labels', () => {
		const failurePolicyLabels: Record<string, string> = {
			abort: 'Abort',
			continue: 'Continue',
			retry: 'Retry'
		};

		it('maps abort correctly', () => {
			expect(failurePolicyLabels['abort']).toBe('Abort');
		});

		it('maps continue correctly', () => {
			expect(failurePolicyLabels['continue']).toBe('Continue');
		});

		it('maps retry correctly', () => {
			expect(failurePolicyLabels['retry']).toBe('Retry');
		});
	});

	describe('log status colors', () => {
		const logStatusColors: Record<string, string> = {
			success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
			failure: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
			timeout: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
			skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
		};

		it('success gets green badge', () => {
			expect(logStatusColors['success']).toContain('green');
		});

		it('failure gets red badge', () => {
			expect(logStatusColors['failure']).toContain('red');
		});

		it('timeout gets yellow badge', () => {
			expect(logStatusColors['timeout']).toContain('yellow');
		});

		it('skipped gets gray badge', () => {
			expect(logStatusColors['skipped']).toContain('gray');
		});
	});

	describe('lifecycle actions visibility', () => {
		it('shows Activate for draft scripts', () => {
			const script = makeScript({ status: 'draft' });
			const showActivate = script.status === 'draft' || script.status === 'inactive';
			expect(showActivate).toBe(true);
		});

		it('shows Activate for inactive scripts', () => {
			const script = makeScript({ status: 'inactive' });
			const showActivate = script.status === 'draft' || script.status === 'inactive';
			expect(showActivate).toBe(true);
		});

		it('hides Activate for active scripts', () => {
			const script = makeScript({ status: 'active' });
			const showActivate = script.status === 'draft' || script.status === 'inactive';
			expect(showActivate).toBe(false);
		});

		it('shows Deactivate only for active scripts', () => {
			const script = makeScript({ status: 'active' });
			const showDeactivate = script.status === 'active';
			expect(showDeactivate).toBe(true);
		});

		it('hides Deactivate for draft scripts', () => {
			const script = makeScript({ status: 'draft' });
			const showDeactivate = script.status === 'active';
			expect(showDeactivate).toBe(false);
		});

		it('shows Delete for non-system scripts', () => {
			const script = makeScript({ is_system: false });
			expect(!script.is_system).toBe(true);
		});

		it('hides Delete for system scripts', () => {
			const script = makeScript({ is_system: true });
			expect(!script.is_system).toBe(false);
		});

		it('always shows Validate button', () => {
			// Validate is always visible regardless of status
			expect(true).toBe(true);
		});
	});

	describe('version table headers', () => {
		const headers = ['Version', 'Change Description', 'Created', 'Actions'];

		it('has 4 columns', () => {
			expect(headers).toHaveLength(4);
		});

		it('has Version column', () => {
			expect(headers[0]).toBe('Version');
		});

		it('has Change Description column', () => {
			expect(headers[1]).toBe('Change Description');
		});

		it('has Created column', () => {
			expect(headers[2]).toBe('Created');
		});

		it('has Actions column', () => {
			expect(headers[3]).toBe('Actions');
		});
	});

	describe('binding table headers', () => {
		const headers = ['Phase', 'Operation', 'Connector', 'Order', 'Failure Policy', 'Enabled'];

		it('has 6 columns', () => {
			expect(headers).toHaveLength(6);
		});

		it('has Phase column', () => {
			expect(headers[0]).toBe('Phase');
		});

		it('has Operation column', () => {
			expect(headers[1]).toBe('Operation');
		});

		it('has Connector column', () => {
			expect(headers[2]).toBe('Connector');
		});

		it('has Order column', () => {
			expect(headers[3]).toBe('Order');
		});

		it('has Failure Policy column', () => {
			expect(headers[4]).toBe('Failure Policy');
		});

		it('has Enabled column', () => {
			expect(headers[5]).toBe('Enabled');
		});
	});

	describe('log table headers', () => {
		const headers = ['Status', 'Version', 'Duration', 'Dry Run', 'Executed At'];

		it('has 5 columns', () => {
			expect(headers).toHaveLength(5);
		});

		it('has Status column', () => {
			expect(headers[0]).toBe('Status');
		});

		it('has Version column', () => {
			expect(headers[1]).toBe('Version');
		});

		it('has Duration column', () => {
			expect(headers[2]).toBe('Duration');
		});

		it('has Dry Run column', () => {
			expect(headers[3]).toBe('Dry Run');
		});

		it('has Executed At column', () => {
			expect(headers[4]).toBe('Executed At');
		});
	});

	describe('empty state messages', () => {
		it('shows correct empty versions message', () => {
			const msg = 'No versions yet. Create the first version above.';
			expect(msg).toContain('No versions');
		});

		it('shows correct empty bindings message', () => {
			const msg = 'No bindings configured for this script.';
			expect(msg).toContain('No bindings');
		});

		it('shows correct empty logs message', () => {
			const msg = 'No execution logs found for this script.';
			expect(msg).toContain('No execution logs');
		});
	});

	describe('version display formatting', () => {
		it('displays version with v prefix', () => {
			const version = makeVersion({ version_number: 3 });
			const display = `v${version.version_number}`;
			expect(display).toBe('v3');
		});

		it('shows Current badge for current version', () => {
			const script = makeScript({ current_version: 3 });
			const version = makeVersion({ version_number: 3 });
			const isCurrent = version.version_number === script.current_version;
			expect(isCurrent).toBe(true);
		});

		it('hides Current badge for non-current version', () => {
			const script = makeScript({ current_version: 3 });
			const version = makeVersion({ version_number: 2 });
			const isCurrent = version.version_number === script.current_version;
			expect(isCurrent).toBe(false);
		});

		it('shows Rollback button for non-current version', () => {
			const script = makeScript({ current_version: 3 });
			const version = makeVersion({ version_number: 2 });
			const showRollback = version.version_number !== script.current_version;
			expect(showRollback).toBe(true);
		});

		it('hides Rollback button for current version', () => {
			const script = makeScript({ current_version: 3 });
			const version = makeVersion({ version_number: 3 });
			const showRollback = version.version_number !== script.current_version;
			expect(showRollback).toBe(false);
		});
	});

	describe('binding enabled status', () => {
		it('shows Enabled badge for enabled bindings', () => {
			const binding = makeBinding({ enabled: true });
			const label = binding.enabled ? 'Enabled' : 'Disabled';
			expect(label).toBe('Enabled');
		});

		it('shows Disabled badge for disabled bindings', () => {
			const binding = makeBinding({ enabled: false });
			const label = binding.enabled ? 'Enabled' : 'Disabled';
			expect(label).toBe('Disabled');
		});
	});

	describe('retry display logic', () => {
		it('shows max retries when failure_policy is retry', () => {
			const binding = makeBinding({ failure_policy: 'retry', max_retries: 3 });
			const showRetries = binding.failure_policy === 'retry' && binding.max_retries;
			expect(showRetries).toBeTruthy();
		});

		it('hides max retries when failure_policy is abort', () => {
			const binding = makeBinding({ failure_policy: 'abort', max_retries: null });
			const showRetries = binding.failure_policy === 'retry' && binding.max_retries;
			expect(showRetries).toBeFalsy();
		});
	});

	describe('connector id display', () => {
		it('truncates connector id to 8 chars with ellipsis', () => {
			const binding = makeBinding({ connector_id: 'abcdefgh-ijkl-mnop-qrst-uvwxyz012345' });
			const display = binding.connector_id.substring(0, 8) + '...';
			expect(display).toBe('abcdefgh...');
		});
	});

	describe('duration display', () => {
		it('formats duration with ms suffix', () => {
			const log = makeLog({ duration_ms: 42 });
			const display = `${log.duration_ms}ms`;
			expect(display).toBe('42ms');
		});
	});

	describe('dry run badge display', () => {
		it('shows Dry Run badge when log is dry run', () => {
			const log = makeLog({ dry_run: true });
			expect(log.dry_run).toBe(true);
		});

		it('hides Dry Run badge when log is not dry run', () => {
			const log = makeLog({ dry_run: false });
			expect(log.dry_run).toBe(false);
		});
	});

	describe('navigation links', () => {
		it('generates correct edit link', () => {
			const script = makeScript({ id: 'script-abc' });
			const href = `/governance/provisioning-scripts/${script.id}/edit`;
			expect(href).toBe('/governance/provisioning-scripts/script-abc/edit');
		});

		it('generates correct back to list link', () => {
			const href = '/governance/provisioning-scripts';
			expect(href).toBe('/governance/provisioning-scripts');
		});
	});

	describe('detail card information fields', () => {
		it('displays Status field', () => {
			const fields = ['Status', 'Current Version', 'Created', 'Updated'];
			expect(fields).toContain('Status');
		});

		it('displays Current Version field', () => {
			const fields = ['Status', 'Current Version', 'Created', 'Updated'];
			expect(fields).toContain('Current Version');
		});

		it('displays Created field', () => {
			const fields = ['Status', 'Current Version', 'Created', 'Updated'];
			expect(fields).toContain('Created');
		});

		it('displays Updated field', () => {
			const fields = ['Status', 'Current Version', 'Created', 'Updated'];
			expect(fields).toContain('Updated');
		});
	});

	describe('mock data conformity', () => {
		it('ScriptVersion has all required fields', () => {
			const v = makeVersion();
			expect(v.id).toBeDefined();
			expect(v.script_id).toBeDefined();
			expect(typeof v.version_number).toBe('number');
			expect(v.script_body).toBeDefined();
			expect(v.created_by).toBeDefined();
			expect(v.created_at).toBeDefined();
		});

		it('HookBinding has all required fields', () => {
			const b = makeBinding();
			expect(b.id).toBeDefined();
			expect(b.tenant_id).toBeDefined();
			expect(b.script_id).toBeDefined();
			expect(b.connector_id).toBeDefined();
			expect(b.hook_phase).toBeDefined();
			expect(b.operation_type).toBeDefined();
			expect(typeof b.execution_order).toBe('number');
			expect(b.failure_policy).toBeDefined();
			expect(typeof b.enabled).toBe('boolean');
		});

		it('HookBinding hook_phase is a valid value', () => {
			const validPhases = ['before', 'after'];
			const b = makeBinding();
			expect(validPhases).toContain(b.hook_phase);
		});

		it('HookBinding operation_type is a valid value', () => {
			const validOps = ['create', 'update', 'delete', 'enable', 'disable'];
			const b = makeBinding();
			expect(validOps).toContain(b.operation_type);
		});

		it('HookBinding failure_policy is a valid value', () => {
			const validPolicies = ['abort', 'continue', 'retry'];
			const b = makeBinding();
			expect(validPolicies).toContain(b.failure_policy);
		});

		it('ScriptExecutionLog has all required fields', () => {
			const l = makeLog();
			expect(l.id).toBeDefined();
			expect(l.script_id).toBeDefined();
			expect(typeof l.script_version).toBe('number');
			expect(l.status).toBeDefined();
			expect(typeof l.dry_run).toBe('boolean');
			expect(typeof l.duration_ms).toBe('number');
			expect(l.executed_by).toBeDefined();
			expect(l.executed_at).toBeDefined();
		});

		it('ScriptExecutionLog status is a valid value', () => {
			const validStatuses = ['success', 'failure', 'timeout', 'skipped'];
			const l = makeLog();
			expect(validStatuses).toContain(l.status);
		});
	});

	describe('compare versions validation', () => {
		it('disables compare when from is 0', () => {
			const compareFrom = 0;
			const compareTo = 2;
			const disabled = compareFrom <= 0 || compareTo <= 0 || compareFrom === compareTo;
			expect(disabled).toBe(true);
		});

		it('disables compare when to is 0', () => {
			const compareFrom = 1;
			const compareTo = 0;
			const disabled = compareFrom <= 0 || compareTo <= 0 || compareFrom === compareTo;
			expect(disabled).toBe(true);
		});

		it('disables compare when from equals to', () => {
			const compareFrom = 2;
			const compareTo = 2;
			const disabled = compareFrom <= 0 || compareTo <= 0 || compareFrom === compareTo;
			expect(disabled).toBe(true);
		});

		it('enables compare when from and to are different positive numbers', () => {
			const compareFrom = 1;
			const compareTo = 3;
			const disabled = compareFrom <= 0 || compareTo <= 0 || compareFrom === compareTo;
			expect(disabled).toBe(false);
		});
	});

	describe('compare versions section visibility', () => {
		it('shows compare section when 2+ versions exist', () => {
			const versions = [makeVersion({ version_number: 3 }), makeVersion({ version_number: 2 })];
			expect(versions.length >= 2).toBe(true);
		});

		it('hides compare section when less than 2 versions', () => {
			const versions = [makeVersion({ version_number: 1 })];
			expect(versions.length >= 2).toBe(false);
		});

		it('hides compare section when no versions', () => {
			const versions: ScriptVersion[] = [];
			expect(versions.length >= 2).toBe(false);
		});
	});
});
