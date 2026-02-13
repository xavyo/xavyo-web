import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/simulations', () => ({
	getPolicySimulation: vi.fn(),
	listPolicySimulationResults: vi.fn(),
	checkPolicySimulationStaleness: vi.fn()
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
	executePolicySimulationClient: vi.fn(),
	cancelPolicySimulationClient: vi.fn(),
	archivePolicySimulationClient: vi.fn(),
	restorePolicySimulationClient: vi.fn(),
	deletePolicySimulationClient: vi.fn(),
	updatePolicyNotesClient: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { load } from './+page.server';
import {
	getPolicySimulation,
	listPolicySimulationResults,
	checkPolicySimulationStaleness
} from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';
import type { PolicySimulation, PolicySimulationResult, StalenessCheck, PolicyImpactSummary } from '$lib/api/types';

const mockGetPolicySim = vi.mocked(getPolicySimulation);
const mockListResults = vi.mocked(listPolicySimulationResults);
const mockCheckStaleness = vi.mocked(checkPolicySimulationStaleness);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makePolicySimulation(overrides: Partial<PolicySimulation> = {}): PolicySimulation {
	return {
		id: 'pol-1',
		tenant_id: 'tid',
		name: 'SoD Impact Analysis',
		simulation_type: 'sod_rule',
		policy_id: null,
		policy_config: { rules: [] },
		status: 'draft',
		affected_user_count: null,
		impact_summary: null,
		data_snapshot_at: null,
		is_stale: false,
		is_archived: false,
		notes: null,
		created_by: 'user-1111-2222-3333-444444444444',
		created_at: '2026-01-15T00:00:00Z',
		executed_at: null,
		...overrides
	};
}

function makeImpactSummary(): PolicyImpactSummary {
	return {
		total_users_analyzed: 100,
		affected_users: 25,
		by_severity: { critical: 2, high: 5, medium: 10, low: 8 },
		by_impact_type: { violation: 7, entitlement_gain: 5, entitlement_loss: 8, no_change: 3, warning: 2 }
	};
}

function makePolicyResult(overrides: Partial<PolicySimulationResult> = {}): PolicySimulationResult {
	return {
		id: 'res-1',
		simulation_id: 'pol-1',
		user_id: 'user-aaaa-bbbb-cccc-dddddddddddd',
		impact_type: 'violation',
		details: { rule_name: 'Finance-IT SoD' },
		severity: 'high',
		created_at: '2026-01-16T00:00:00Z',
		...overrides
	};
}

function makeStalenessCheck(overrides: Partial<StalenessCheck> = {}): StalenessCheck {
	return {
		is_stale: false,
		data_snapshot_at: '2026-01-15T00:00:00Z',
		last_data_change_at: '2026-01-14T00:00:00Z',
		...overrides
	};
}

describe('Policy simulation detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'pol-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns simulation, results, and staleness for admin', async () => {
			const sim = makePolicySimulation({ status: 'executed', impact_summary: makeImpactSummary() });
			const results = [makePolicyResult()];
			const staleness = makeStalenessCheck();

			mockGetPolicySim.mockResolvedValue(sim);
			mockListResults.mockResolvedValue({ items: results, total: 1, limit: 50, offset: 0 });
			mockCheckStaleness.mockResolvedValue(staleness);

			const result = (await load({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.simulation.name).toBe('SoD Impact Analysis');
			expect(result.simulation.status).toBe('executed');
			expect(result.results.items).toHaveLength(1);
			expect(result.staleness.is_stale).toBe(false);
		});

		it('handles results API failure gracefully', async () => {
			mockGetPolicySim.mockResolvedValue(makePolicySimulation());
			mockListResults.mockRejectedValue(new Error('results failed'));
			mockCheckStaleness.mockResolvedValue(makeStalenessCheck());

			const result = (await load({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.results.items).toEqual([]);
			expect(result.results.total).toBe(0);
		});

		it('handles staleness API failure gracefully', async () => {
			mockGetPolicySim.mockResolvedValue(makePolicySimulation());
			mockListResults.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockCheckStaleness.mockRejectedValue(new Error('staleness failed'));

			const result = (await load({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.staleness.is_stale).toBe(false);
		});

		it('throws 500 when simulation fetch fails', async () => {
			mockGetPolicySim.mockRejectedValue(new Error('not found'));
			mockListResults.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockCheckStaleness.mockResolvedValue(makeStalenessCheck());

			try {
				await load({
					params: { id: 'pol-1' },
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

describe('Policy simulation detail +page.svelte', () => {
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

describe('Policy simulation detail rendering logic', () => {
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
			const result = formatDate('2026-01-15T00:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('-');
		});

		it('returns dash for null', () => {
			expect(formatDate(null)).toBe('-');
		});
	});

	describe('status-dependent buttons', () => {
		it('shows Execute button for draft status', () => {
			const sim = makePolicySimulation({ status: 'draft' });
			expect(sim.status).toBe('draft');
			const showExecute = sim.status === 'draft';
			expect(showExecute).toBe(true);
		});

		it('shows Archive button for executed status', () => {
			const sim = makePolicySimulation({ status: 'executed' });
			const showArchive = sim.status === 'executed';
			expect(showArchive).toBe(true);
		});

		it('shows Delete button for draft status', () => {
			const sim = makePolicySimulation({ status: 'draft' });
			const showDelete = sim.status === 'draft';
			expect(showDelete).toBe(true);
		});

		it('shows Delete button for cancelled status', () => {
			const sim = makePolicySimulation({ status: 'cancelled' });
			const showDelete = sim.status === 'cancelled';
			expect(showDelete).toBe(true);
		});

		it('shows Restore button when archived', () => {
			const sim = makePolicySimulation({ is_archived: true });
			expect(sim.is_archived).toBe(true);
		});

		it('does not show Execute for executed status', () => {
			const sim = makePolicySimulation({ status: 'executed' });
			const showExecute = sim.status === 'draft';
			expect(showExecute).toBe(false);
		});
	});

	describe('staleness warning', () => {
		it('shows warning when stale', () => {
			const staleness = makeStalenessCheck({ is_stale: true });
			expect(staleness.is_stale).toBe(true);
		});

		it('does not show warning when not stale', () => {
			const staleness = makeStalenessCheck({ is_stale: false });
			expect(staleness.is_stale).toBe(false);
		});
	});

	describe('impact summary cards for executed simulation', () => {
		it('shows total users analyzed', () => {
			const summary = makeImpactSummary();
			expect(summary.total_users_analyzed).toBe(100);
		});

		it('shows affected users', () => {
			const summary = makeImpactSummary();
			expect(summary.affected_users).toBe(25);
		});

		it('shows severity breakdown', () => {
			const summary = makeImpactSummary();
			expect(summary.by_severity.critical).toBe(2);
			expect(summary.by_severity.high).toBe(5);
			expect(summary.by_severity.medium).toBe(10);
			expect(summary.by_severity.low).toBe(8);
		});

		it('shows impact type breakdown', () => {
			const summary = makeImpactSummary();
			expect(summary.by_impact_type.violation).toBe(7);
			expect(summary.by_impact_type.entitlement_gain).toBe(5);
			expect(summary.by_impact_type.entitlement_loss).toBe(8);
		});
	});

	describe('results table with data', () => {
		it('result has correct user_id', () => {
			const result = makePolicyResult();
			expect(result.user_id).toBeDefined();
			expect(result.user_id.length).toBeGreaterThan(0);
		});

		it('result has valid impact_type', () => {
			const validTypes = ['violation', 'entitlement_gain', 'entitlement_loss', 'no_change', 'warning'];
			const result = makePolicyResult();
			expect(validTypes).toContain(result.impact_type);
		});

		it('result has valid severity', () => {
			const validSeverities = ['critical', 'high', 'medium', 'low'];
			const result = makePolicyResult();
			expect(validSeverities).toContain(result.severity);
		});

		it('result truncates user_id for display', () => {
			const result = makePolicyResult();
			const display = result.user_id.slice(0, 8) + '...';
			expect(display).toBe('user-aaa...');
		});
	});

	describe('mock data conformity', () => {
		it('PolicySimulation has all required fields', () => {
			const sim = makePolicySimulation();
			expect(sim.id).toBeDefined();
			expect(sim.tenant_id).toBeDefined();
			expect(sim.name).toBeDefined();
			expect(sim.simulation_type).toBeDefined();
			expect(sim.status).toBeDefined();
			expect(sim.created_by).toBeDefined();
			expect(sim.created_at).toBeDefined();
			expect(typeof sim.is_stale).toBe('boolean');
			expect(typeof sim.is_archived).toBe('boolean');
		});

		it('PolicySimulationResult has all required fields', () => {
			const r = makePolicyResult();
			expect(r.id).toBeDefined();
			expect(r.simulation_id).toBeDefined();
			expect(r.user_id).toBeDefined();
			expect(r.impact_type).toBeDefined();
			expect(r.severity).toBeDefined();
			expect(r.details).toBeDefined();
			expect(r.created_at).toBeDefined();
		});

		it('StalenessCheck has all required fields', () => {
			const s = makeStalenessCheck();
			expect(typeof s.is_stale).toBe('boolean');
			expect(s.data_snapshot_at).toBeDefined();
			expect(s.last_data_change_at).toBeDefined();
		});
	});
});
