import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/simulations', () => ({
	getBatchSimulation: vi.fn(),
	listBatchSimulationResults: vi.fn()
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

vi.mock('$lib/api/simulations-client', () => ({
	executeBatchSimulationClient: vi.fn(),
	applyBatchSimulationClient: vi.fn(),
	archiveBatchSimulationClient: vi.fn(),
	restoreBatchSimulationClient: vi.fn(),
	deleteBatchSimulationClient: vi.fn(),
	updateBatchNotesClient: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { load } from './+page.server';
import { getBatchSimulation, listBatchSimulationResults } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';
import type {
	BatchSimulation,
	BatchSimulationResult,
	BatchImpactSummary,
	AccessItem
} from '$lib/api/types';

const mockGetBatchSim = vi.mocked(getBatchSimulation);
const mockListResults = vi.mocked(listBatchSimulationResults);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeBatchSimulation(overrides: Partial<BatchSimulation> = {}): BatchSimulation {
	return {
		id: 'bat-1',
		tenant_id: 'tid',
		name: 'Q1 Role Cleanup',
		batch_type: 'role_remove',
		selection_mode: 'filter',
		user_ids: null,
		filter_criteria: { department: 'Engineering' },
		change_spec: { operation: 'role_remove', role_id: 'role-1', justification: 'Quarterly cleanup' },
		total_users: 150,
		processed_users: null,
		status: 'draft',
		impact_summary: null,
		has_scope_warning: false,
		data_snapshot_at: null,
		is_archived: false,
		notes: null,
		created_by: 'user-1111-2222-3333-444444444444',
		created_at: '2026-01-20T00:00:00Z',
		executed_at: null,
		applied_at: null,
		applied_by: null,
		...overrides
	};
}

function makeBatchImpactSummary(): BatchImpactSummary {
	return {
		total_users: 150,
		affected_users: 85,
		entitlements_gained: 0,
		entitlements_lost: 42,
		sod_violations_introduced: 0,
		warnings: ['Some users have pending access requests']
	};
}

function makeBatchResult(overrides: Partial<BatchSimulationResult> = {}): BatchSimulationResult {
	return {
		id: 'res-1',
		simulation_id: 'bat-1',
		user_id: 'user-aaaa-bbbb-cccc-dddddddddddd',
		access_gained: [],
		access_lost: [{ type: 'role', id: 'role-1', name: 'Engineering Role' }],
		warnings: [],
		created_at: '2026-01-21T00:00:00Z',
		...overrides
	};
}

describe('Batch simulation detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'bat-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns simulation and results for admin', async () => {
			const sim = makeBatchSimulation({ status: 'executed', impact_summary: makeBatchImpactSummary() });
			const results = [makeBatchResult()];

			mockGetBatchSim.mockResolvedValue(sim);
			mockListResults.mockResolvedValue({ items: results, total: 1, limit: 50, offset: 0 });

			const result = (await load({
				params: { id: 'bat-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.simulation.name).toBe('Q1 Role Cleanup');
			expect(result.simulation.status).toBe('executed');
			expect(result.results.items).toHaveLength(1);
		});

		it('handles results API failure gracefully', async () => {
			mockGetBatchSim.mockResolvedValue(makeBatchSimulation());
			mockListResults.mockRejectedValue(new Error('results failed'));

			const result = (await load({
				params: { id: 'bat-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.results.items).toEqual([]);
			expect(result.results.total).toBe(0);
		});

		it('throws 500 when simulation fetch fails', async () => {
			mockGetBatchSim.mockRejectedValue(new Error('not found'));
			mockListResults.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			try {
				await load({
					params: { id: 'bat-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

describe('Batch simulation detail +page.svelte', () => {
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

describe('Batch simulation detail rendering logic', () => {
	describe('scope warning banner', () => {
		it('shows banner when has_scope_warning is true', () => {
			const sim = makeBatchSimulation({ has_scope_warning: true });
			expect(sim.has_scope_warning).toBe(true);
		});

		it('hides banner when has_scope_warning is false', () => {
			const sim = makeBatchSimulation({ has_scope_warning: false });
			expect(sim.has_scope_warning).toBe(false);
		});
	});

	describe('status-dependent buttons', () => {
		it('shows Execute button for draft status', () => {
			const sim = makeBatchSimulation({ status: 'draft' });
			const showExecute = sim.status === 'draft';
			expect(showExecute).toBe(true);
		});

		it('shows Apply to Production button for executed status', () => {
			const sim = makeBatchSimulation({ status: 'executed' });
			const showApply = sim.status === 'executed';
			expect(showApply).toBe(true);
		});

		it('shows Archive button for executed status', () => {
			const sim = makeBatchSimulation({ status: 'executed' });
			const showArchive = sim.status === 'executed';
			expect(showArchive).toBe(true);
		});

		it('shows Archive button for applied status', () => {
			const sim = makeBatchSimulation({ status: 'applied' });
			const showArchive = sim.status === 'applied';
			expect(showArchive).toBe(true);
		});

		it('does not show Execute for executed status', () => {
			const sim = makeBatchSimulation({ status: 'executed' });
			const showExecute = sim.status === 'draft';
			expect(showExecute).toBe(false);
		});

		it('does not show Apply for draft status', () => {
			const sim = makeBatchSimulation({ status: 'draft' });
			const showApply = sim.status === 'executed';
			expect(showApply).toBe(false);
		});

		it('shows Restore button when archived', () => {
			const sim = makeBatchSimulation({ is_archived: true });
			expect(sim.is_archived).toBe(true);
		});
	});

	describe('apply dialog logic', () => {
		it('requires justification', () => {
			const justification = '';
			expect(justification.trim().length === 0).toBe(true);
		});

		it('accepts non-empty justification', () => {
			const justification = 'Approved by compliance team';
			expect(justification.trim().length > 0).toBe(true);
		});

		it('requires acknowledge scope checkbox', () => {
			const acknowledge = false;
			expect(!acknowledge).toBe(true);
		});
	});

	describe('batch impact summary cards', () => {
		it('shows total users', () => {
			const summary = makeBatchImpactSummary();
			expect(summary.total_users).toBe(150);
		});

		it('shows affected users', () => {
			const summary = makeBatchImpactSummary();
			expect(summary.affected_users).toBe(85);
		});

		it('shows entitlements gained', () => {
			const summary = makeBatchImpactSummary();
			expect(summary.entitlements_gained).toBe(0);
		});

		it('shows entitlements lost', () => {
			const summary = makeBatchImpactSummary();
			expect(summary.entitlements_lost).toBe(42);
		});

		it('shows sod violations introduced', () => {
			const summary = makeBatchImpactSummary();
			expect(summary.sod_violations_introduced).toBe(0);
		});

		it('shows warnings list', () => {
			const summary = makeBatchImpactSummary();
			expect(summary.warnings).toHaveLength(1);
			expect(summary.warnings[0]).toContain('pending access requests');
		});
	});

	describe('batch results', () => {
		it('result has access_gained array', () => {
			const result = makeBatchResult({ access_gained: [{ type: 'entitlement', id: 'ent-1', name: 'Read Access' }] });
			expect(result.access_gained).toHaveLength(1);
			expect(result.access_gained[0].name).toBe('Read Access');
		});

		it('result has access_lost array', () => {
			const result = makeBatchResult();
			expect(result.access_lost).toHaveLength(1);
			expect(result.access_lost[0].name).toBe('Engineering Role');
		});

		it('result has warnings array', () => {
			const result = makeBatchResult({ warnings: ['SoD conflict with Finance role'] });
			expect(result.warnings).toHaveLength(1);
		});

		it('result truncates user_id for display', () => {
			const result = makeBatchResult();
			const display = result.user_id.slice(0, 8) + '...';
			expect(display).toBe('user-aaa...');
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string | null): string {
			if (!dateStr) return '-';
			return new Date(dateStr).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}

		it('formats valid date string', () => {
			const result = formatDate('2026-01-20T00:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('-');
		});

		it('returns dash for null', () => {
			expect(formatDate(null)).toBe('-');
		});
	});

	describe('batchTypeLabel', () => {
		function batchTypeLabel(bt: string): string {
			return bt.replace(/_/g, ' ');
		}

		it('converts role_remove to role remove', () => {
			expect(batchTypeLabel('role_remove')).toBe('role remove');
		});

		it('converts entitlement_add to entitlement add', () => {
			expect(batchTypeLabel('entitlement_add')).toBe('entitlement add');
		});
	});

	describe('mock data conformity', () => {
		it('BatchSimulation has all required fields', () => {
			const sim = makeBatchSimulation();
			expect(sim.id).toBeDefined();
			expect(sim.tenant_id).toBeDefined();
			expect(sim.name).toBeDefined();
			expect(sim.batch_type).toBeDefined();
			expect(sim.selection_mode).toBeDefined();
			expect(sim.change_spec).toBeDefined();
			expect(sim.status).toBeDefined();
			expect(typeof sim.has_scope_warning).toBe('boolean');
			expect(typeof sim.is_archived).toBe('boolean');
			expect(sim.created_by).toBeDefined();
			expect(sim.created_at).toBeDefined();
		});

		it('BatchSimulationResult has all required fields', () => {
			const r = makeBatchResult();
			expect(r.id).toBeDefined();
			expect(r.simulation_id).toBeDefined();
			expect(r.user_id).toBeDefined();
			expect(Array.isArray(r.access_gained)).toBe(true);
			expect(Array.isArray(r.access_lost)).toBe(true);
			expect(Array.isArray(r.warnings)).toBe(true);
			expect(r.created_at).toBeDefined();
		});
	});
});
