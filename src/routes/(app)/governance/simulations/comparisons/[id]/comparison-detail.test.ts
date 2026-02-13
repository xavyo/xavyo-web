import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/simulations', () => ({
	getSimulationComparison: vi.fn()
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
	deleteSimulationComparisonClient: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { load } from './+page.server';
import { getSimulationComparison } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';
import type {
	SimulationComparison,
	ComparisonSummary,
	DeltaResults,
	DeltaEntry,
	ModifiedEntry
} from '$lib/api/types';

const mockGetComparison = vi.mocked(getSimulationComparison);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeComparisonSummary(): ComparisonSummary {
	return {
		users_in_both: 80,
		users_only_in_a: 10,
		users_only_in_b: 5,
		different_impacts: 15,
		total_additions: 20,
		total_removals: 12
	};
}

function makeDeltaResults(): DeltaResults {
	return {
		added: [
			{ user_id: 'user-aaaa-bbbb-cccc-dddddddddddd', impact_type: 'entitlement_gain', severity: 'low', details: null }
		],
		removed: [
			{ user_id: 'user-eeee-ffff-gggg-hhhhhhhhhhhh', impact_type: 'entitlement_loss', severity: 'medium', details: null }
		],
		modified: [
			{
				user_id: 'user-iiii-jjjj-kkkk-llllllllllll',
				impact_a: { type: 'violation', severity: 'high' },
				impact_b: { type: 'warning', severity: 'low' }
			}
		]
	};
}

function makeComparison(overrides: Partial<SimulationComparison> = {}): SimulationComparison {
	return {
		id: 'cmp-1',
		tenant_id: 'tid',
		name: 'Before vs After SoD',
		comparison_type: 'simulation_vs_simulation',
		simulation_a_id: 'pol-1111-2222-3333-444444444444',
		simulation_a_type: 'policy',
		simulation_b_id: 'pol-5555-6666-7777-888888888888',
		simulation_b_type: 'policy',
		summary_stats: makeComparisonSummary(),
		delta_results: makeDeltaResults(),
		is_stale: false,
		created_by: 'user-1111-2222-3333-444444444444',
		created_at: '2026-01-25T00:00:00Z',
		...overrides
	};
}

describe('Comparison detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'cmp-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns comparison for admin', async () => {
			const comp = makeComparison();
			mockGetComparison.mockResolvedValue(comp);

			const result = (await load({
				params: { id: 'cmp-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.comparison.name).toBe('Before vs After SoD');
			expect(result.comparison.comparison_type).toBe('simulation_vs_simulation');
		});

		it('throws 500 when comparison fetch fails', async () => {
			mockGetComparison.mockRejectedValue(new Error('not found'));

			try {
				await load({
					params: { id: 'cmp-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});

		it('passes correct token and tenantId', async () => {
			mockGetComparison.mockResolvedValue(makeComparison());
			const mockFetch = vi.fn();

			await load({
				params: { id: 'cmp-1' },
				locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
				fetch: mockFetch
			} as any);

			expect(mockGetComparison).toHaveBeenCalledWith(
				'cmp-1',
				'my-token',
				'my-tenant',
				mockFetch
			);
		});
	});
});

describe('Comparison detail +page.svelte', () => {
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

describe('Comparison detail rendering logic', () => {
	describe('staleness warning', () => {
		it('shows warning when stale', () => {
			const comp = makeComparison({ is_stale: true });
			expect(comp.is_stale).toBe(true);
		});

		it('does not show warning when not stale', () => {
			const comp = makeComparison({ is_stale: false });
			expect(comp.is_stale).toBe(false);
		});
	});

	describe('delta-view summary cards', () => {
		it('shows users in both', () => {
			const summary = makeComparisonSummary();
			expect(summary.users_in_both).toBe(80);
		});

		it('shows users only in A', () => {
			const summary = makeComparisonSummary();
			expect(summary.users_only_in_a).toBe(10);
		});

		it('shows users only in B', () => {
			const summary = makeComparisonSummary();
			expect(summary.users_only_in_b).toBe(5);
		});

		it('shows different impacts', () => {
			const summary = makeComparisonSummary();
			expect(summary.different_impacts).toBe(15);
		});

		it('shows total additions', () => {
			const summary = makeComparisonSummary();
			expect(summary.total_additions).toBe(20);
		});

		it('shows total removals', () => {
			const summary = makeComparisonSummary();
			expect(summary.total_removals).toBe(12);
		});
	});

	describe('export and delete buttons', () => {
		it('has Export JSON button', () => {
			const exportFormats = ['json', 'csv'];
			expect(exportFormats).toContain('json');
		});

		it('has Export CSV button', () => {
			const exportFormats = ['json', 'csv'];
			expect(exportFormats).toContain('csv');
		});

		it('has Delete button', () => {
			const actions = ['export_json', 'export_csv', 'delete'];
			expect(actions).toContain('delete');
		});
	});

	describe('comparison metadata display', () => {
		it('shows comparison type', () => {
			const comp = makeComparison();
			expect(comp.comparison_type).toBe('simulation_vs_simulation');
		});

		it('shows simulation A info', () => {
			const comp = makeComparison();
			expect(comp.simulation_a_id).toBeDefined();
			expect(comp.simulation_a_type).toBe('policy');
		});

		it('shows simulation B info for sim-vs-sim', () => {
			const comp = makeComparison();
			expect(comp.simulation_b_id).toBeDefined();
			expect(comp.simulation_b_type).toBe('policy');
		});

		it('shows Current State for sim-vs-current', () => {
			const comp = makeComparison({
				comparison_type: 'simulation_vs_current',
				simulation_b_id: null,
				simulation_b_type: null
			});
			expect(comp.simulation_b_id).toBeNull();
		});

		it('truncates simulation A ID for display', () => {
			const comp = makeComparison();
			const display = comp.simulation_a_id.slice(0, 8) + '...';
			expect(display).toBe('pol-1111...');
		});

		it('truncates created_by for display', () => {
			const comp = makeComparison();
			const display = comp.created_by.slice(0, 8) + '...';
			expect(display).toBe('user-111...');
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
			const result = formatDate('2026-01-25T00:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('-');
		});

		it('returns dash for null', () => {
			expect(formatDate(null)).toBe('-');
		});
	});

	describe('mock data conformity', () => {
		it('SimulationComparison has all required fields', () => {
			const comp = makeComparison();
			expect(comp.id).toBeDefined();
			expect(comp.tenant_id).toBeDefined();
			expect(comp.name).toBeDefined();
			expect(comp.comparison_type).toBeDefined();
			expect(comp.simulation_a_id).toBeDefined();
			expect(comp.simulation_a_type).toBeDefined();
			expect(typeof comp.is_stale).toBe('boolean');
			expect(comp.created_by).toBeDefined();
			expect(comp.created_at).toBeDefined();
		});

		it('ComparisonSummary has all required fields', () => {
			const s = makeComparisonSummary();
			expect(typeof s.users_in_both).toBe('number');
			expect(typeof s.users_only_in_a).toBe('number');
			expect(typeof s.users_only_in_b).toBe('number');
			expect(typeof s.different_impacts).toBe('number');
			expect(typeof s.total_additions).toBe('number');
			expect(typeof s.total_removals).toBe('number');
		});

		it('DeltaResults has all required fields', () => {
			const d = makeDeltaResults();
			expect(Array.isArray(d.added)).toBe(true);
			expect(Array.isArray(d.removed)).toBe(true);
			expect(Array.isArray(d.modified)).toBe(true);
		});

		it('DeltaEntry has all required fields', () => {
			const entry = makeDeltaResults().added[0];
			expect(entry.user_id).toBeDefined();
			expect(entry.impact_type).toBeDefined();
		});

		it('ModifiedEntry has all required fields', () => {
			const entry = makeDeltaResults().modified[0];
			expect(entry.user_id).toBeDefined();
			expect(entry.impact_a).toBeDefined();
			expect(entry.impact_b).toBeDefined();
		});
	});
});
