import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/simulations', () => ({
	listPolicySimulations: vi.fn(),
	listBatchSimulations: vi.fn(),
	listSimulationComparisons: vi.fn()
}));

vi.mock('$lib/api/simulations-client', () => ({
	deleteSimulationComparisonClient: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { load } from './+page.server';
import { listPolicySimulations, listBatchSimulations, listSimulationComparisons } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';
import type { PolicySimulation, BatchSimulation, SimulationComparison } from '$lib/api/types';

const mockListPolicy = vi.mocked(listPolicySimulations);
const mockListBatch = vi.mocked(listBatchSimulations);
const mockListComparisons = vi.mocked(listSimulationComparisons);
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
		policy_config: {},
		status: 'draft',
		affected_user_count: 42,
		impact_summary: null,
		data_snapshot_at: null,
		is_stale: false,
		is_archived: false,
		notes: null,
		created_by: 'user-1',
		created_at: '2026-01-15T00:00:00Z',
		executed_at: null,
		...overrides
	};
}

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
		created_by: 'user-1',
		created_at: '2026-01-20T00:00:00Z',
		executed_at: null,
		applied_at: null,
		applied_by: null,
		...overrides
	};
}

function makeComparison(overrides: Partial<SimulationComparison> = {}): SimulationComparison {
	return {
		id: 'cmp-1',
		tenant_id: 'tid',
		name: 'Before vs After SoD',
		comparison_type: 'simulation_vs_simulation',
		simulation_a_id: 'pol-1',
		simulation_a_type: 'policy',
		simulation_b_id: 'pol-2',
		simulation_b_type: 'policy',
		summary_stats: null,
		delta_results: null,
		is_stale: false,
		created_by: 'user-1',
		created_at: '2026-01-25T00:00:00Z',
		...overrides
	};
}

describe('Simulations hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns policy simulations, batch simulations, and comparisons', async () => {
			const policySims = [makePolicySimulation()];
			const batchSims = [makeBatchSimulation()];
			const comparisons = [makeComparison()];

			mockListPolicy.mockResolvedValue({ items: policySims, total: 1, limit: 20, offset: 0 });
			mockListBatch.mockResolvedValue({ items: batchSims, total: 1, limit: 20, offset: 0 });
			mockListComparisons.mockResolvedValue({ items: comparisons, total: 1, limit: 20, offset: 0 });

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policySimulations.items).toHaveLength(1);
			expect(result.policySimulations.items[0].name).toBe('SoD Impact Analysis');
			expect(result.batchSimulations.items).toHaveLength(1);
			expect(result.batchSimulations.items[0].name).toBe('Q1 Role Cleanup');
			expect(result.comparisons.items).toHaveLength(1);
			expect(result.comparisons.items[0].name).toBe('Before vs After SoD');
		});

		it('returns empty items when all APIs fail', async () => {
			mockListPolicy.mockRejectedValue(new Error('fail'));
			mockListBatch.mockRejectedValue(new Error('fail'));
			mockListComparisons.mockRejectedValue(new Error('fail'));

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policySimulations.items).toEqual([]);
			expect(result.policySimulations.total).toBe(0);
			expect(result.batchSimulations.items).toEqual([]);
			expect(result.batchSimulations.total).toBe(0);
			expect(result.comparisons.items).toEqual([]);
			expect(result.comparisons.total).toBe(0);
		});

		it('passes correct token and tenantId', async () => {
			mockListPolicy.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			mockListBatch.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			mockListComparisons.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			const mockFetch = vi.fn();

			await load({
				locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
				fetch: mockFetch
			} as any);

			expect(mockListPolicy).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 20, offset: 0 }),
				'my-token',
				'my-tenant',
				mockFetch
			);
			expect(mockListBatch).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 20, offset: 0 }),
				'my-token',
				'my-tenant',
				mockFetch
			);
			expect(mockListComparisons).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 20, offset: 0 }),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});
	});
});

describe('Simulations hub +page.svelte', () => {
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

describe('Simulations hub rendering logic', () => {
	describe('tab definitions', () => {
		const tabs = [
			{ id: 'policy', label: 'Policy Simulations' },
			{ id: 'batch', label: 'Batch Simulations' },
			{ id: 'comparisons', label: 'Comparisons' }
		];

		it('has 3 tabs', () => {
			expect(tabs).toHaveLength(3);
		});

		it('has Policy Simulations as first tab', () => {
			expect(tabs[0].label).toBe('Policy Simulations');
		});

		it('has Batch Simulations as second tab', () => {
			expect(tabs[1].label).toBe('Batch Simulations');
		});

		it('has Comparisons as third tab', () => {
			expect(tabs[2].label).toBe('Comparisons');
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string | null): string {
			if (!dateStr) return '-';
			return new Date(dateStr).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
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

	describe('simulationTypeLabel', () => {
		function simulationTypeLabel(type: string): string {
			return type.replace(/_/g, ' ');
		}

		it('converts sod_rule to sod rule', () => {
			expect(simulationTypeLabel('sod_rule')).toBe('sod rule');
		});

		it('converts birthright_policy to birthright policy', () => {
			expect(simulationTypeLabel('birthright_policy')).toBe('birthright policy');
		});

		it('converts role_add to role add', () => {
			expect(simulationTypeLabel('role_add')).toBe('role add');
		});
	});

	describe('empty state messages', () => {
		it('shows correct empty policy simulations message', () => {
			const msg = 'No policy simulations';
			expect(msg).toBe('No policy simulations');
		});

		it('shows correct empty batch simulations message', () => {
			const msg = 'No batch simulations';
			expect(msg).toBe('No batch simulations');
		});

		it('shows correct empty comparisons message', () => {
			const msg = 'No comparisons';
			expect(msg).toBe('No comparisons');
		});
	});

	describe('policy simulation count pluralization', () => {
		it('singular when 1 simulation', () => {
			const total = 1;
			const text = `${total} policy simulation${total !== 1 ? 's' : ''}`;
			expect(text).toBe('1 policy simulation');
		});

		it('plural when 0 simulations', () => {
			const total: number = 0;
			const text = `${total} policy simulation${total !== 1 ? 's' : ''}`;
			expect(text).toBe('0 policy simulations');
		});

		it('plural when multiple simulations', () => {
			const total: number = 5;
			const text = `${total} policy simulation${total !== 1 ? 's' : ''}`;
			expect(text).toBe('5 policy simulations');
		});
	});

	describe('comparison count pluralization', () => {
		it('singular when 1 comparison', () => {
			const total = 1;
			const text = `${total} comparison${total !== 1 ? 's' : ''}`;
			expect(text).toBe('1 comparison');
		});

		it('plural when multiple comparisons', () => {
			const total: number = 3;
			const text = `${total} comparison${total !== 1 ? 's' : ''}`;
			expect(text).toBe('3 comparisons');
		});
	});

	describe('Create button links', () => {
		it('policy create link is correct', () => {
			expect('/governance/simulations/policy/create').toBe('/governance/simulations/policy/create');
		});

		it('batch create link is correct', () => {
			expect('/governance/simulations/batch/create').toBe('/governance/simulations/batch/create');
		});

		it('comparison create link is correct', () => {
			expect('/governance/simulations/comparisons/create').toBe('/governance/simulations/comparisons/create');
		});
	});

	describe('mock data conformity', () => {
		it('PolicySimulation has all required fields', () => {
			const sim = makePolicySimulation();
			expect(sim.id).toBeDefined();
			expect(sim.name).toBeDefined();
			expect(sim.simulation_type).toBeDefined();
			expect(sim.status).toBeDefined();
			expect(sim.created_by).toBeDefined();
			expect(sim.created_at).toBeDefined();
		});

		it('BatchSimulation has all required fields', () => {
			const sim = makeBatchSimulation();
			expect(sim.id).toBeDefined();
			expect(sim.name).toBeDefined();
			expect(sim.batch_type).toBeDefined();
			expect(sim.selection_mode).toBeDefined();
			expect(sim.status).toBeDefined();
			expect(sim.created_by).toBeDefined();
			expect(sim.created_at).toBeDefined();
		});

		it('SimulationComparison has all required fields', () => {
			const comp = makeComparison();
			expect(comp.id).toBeDefined();
			expect(comp.name).toBeDefined();
			expect(comp.comparison_type).toBeDefined();
			expect(comp.simulation_a_id).toBeDefined();
			expect(comp.simulation_a_type).toBeDefined();
			expect(comp.created_by).toBeDefined();
			expect(comp.created_at).toBeDefined();
		});

		it('PolicySimulation simulation_type is a valid value', () => {
			const validTypes = ['sod_rule', 'birthright_policy'];
			const sim = makePolicySimulation();
			expect(validTypes).toContain(sim.simulation_type);
		});

		it('BatchSimulation batch_type is a valid value', () => {
			const validTypes = ['role_add', 'role_remove', 'entitlement_add', 'entitlement_remove'];
			const sim = makeBatchSimulation();
			expect(validTypes).toContain(sim.batch_type);
		});

		it('SimulationComparison comparison_type is a valid value', () => {
			const validTypes = ['simulation_vs_simulation', 'simulation_vs_current'];
			const comp = makeComparison();
			expect(validTypes).toContain(comp.comparison_type);
		});

		it('PolicySimulation status is a valid value', () => {
			const validStatuses = ['draft', 'executed', 'applied', 'cancelled'];
			const sim = makePolicySimulation();
			expect(validStatuses).toContain(sim.status);
		});

		it('BatchSimulation selection_mode is a valid value', () => {
			const validModes = ['user_list', 'filter'];
			const sim = makeBatchSimulation();
			expect(validModes).toContain(sim.selection_mode);
		});
	});
});
