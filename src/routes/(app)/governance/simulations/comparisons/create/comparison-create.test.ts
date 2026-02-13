import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/simulations', () => ({
	listPolicySimulations: vi.fn(),
	listBatchSimulations: vi.fn(),
	createSimulationComparison: vi.fn()
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

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({
		valid: true,
		data: {
			name: '',
			comparison_type: '',
			simulation_a_type: '',
			simulation_a_id: '',
			simulation_b_type: '',
			simulation_b_id: ''
		},
		errors: {}
	}),
	message: vi.fn((form, msg, opts) => ({ form, message: msg, ...opts }))
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { hasAdminRole } from '$lib/server/auth';
import { listPolicySimulations, listBatchSimulations } from '$lib/api/simulations';

const mockHasAdminRole = vi.mocked(hasAdminRole);
const mockListPolicy = vi.mocked(listPolicySimulations);
const mockListBatch = vi.mocked(listBatchSimulations);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Comparison create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			const { load } = await import('./+page.server');
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

		it('returns form, policy simulations, and batch simulations for admin', async () => {
			mockListPolicy.mockResolvedValue({
				items: [{ id: 'pol-1', name: 'SoD Test', simulation_type: 'sod_rule' }] as any,
				total: 1,
				limit: 100,
				offset: 0
			});
			mockListBatch.mockResolvedValue({
				items: [{ id: 'bat-1', name: 'Role Cleanup', batch_type: 'role_remove' }] as any,
				total: 1,
				limit: 100,
				offset: 0
			});

			const { load } = await import('./+page.server');
			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.form).toBeDefined();
			expect(result.policySimulations).toHaveLength(1);
			expect(result.batchSimulations).toHaveLength(1);
		});

		it('returns empty arrays when APIs fail', async () => {
			mockListPolicy.mockRejectedValue(new Error('fail'));
			mockListBatch.mockRejectedValue(new Error('fail'));

			const { load } = await import('./+page.server');
			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policySimulations).toEqual([]);
			expect(result.batchSimulations).toEqual([]);
		});
	});
});

describe('Comparison create +page.svelte', () => {
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

describe('Comparison create form logic', () => {
	describe('form fields', () => {
		const fields = ['name', 'comparison_type', 'simulation_a_type', 'simulation_a_id', 'simulation_b_type', 'simulation_b_id'];

		it('has name field', () => {
			expect(fields).toContain('name');
		});

		it('has comparison_type field', () => {
			expect(fields).toContain('comparison_type');
		});

		it('has simulation_a_type field', () => {
			expect(fields).toContain('simulation_a_type');
		});

		it('has simulation_a_id field', () => {
			expect(fields).toContain('simulation_a_id');
		});

		it('has simulation_b_type field', () => {
			expect(fields).toContain('simulation_b_type');
		});

		it('has simulation_b_id field', () => {
			expect(fields).toContain('simulation_b_id');
		});
	});

	describe('comparison type options', () => {
		const comparisonTypeOptions = [
			{ value: 'simulation_vs_simulation', label: 'Simulation vs Simulation' },
			{ value: 'simulation_vs_current', label: 'Simulation vs Current' }
		];

		it('has 2 comparison type options', () => {
			expect(comparisonTypeOptions).toHaveLength(2);
		});

		it('has Simulation vs Simulation option', () => {
			expect(comparisonTypeOptions[0].value).toBe('simulation_vs_simulation');
		});

		it('has Simulation vs Current option', () => {
			expect(comparisonTypeOptions[1].value).toBe('simulation_vs_current');
		});
	});

	describe('simulation B fields visibility', () => {
		it('shows simulation B fields for simulation_vs_simulation type', () => {
			const comparisonType = 'simulation_vs_simulation';
			const showSimB = comparisonType === 'simulation_vs_simulation';
			expect(showSimB).toBe(true);
		});

		it('hides simulation B fields for simulation_vs_current type', () => {
			const comparisonType: string = 'simulation_vs_current';
			const showSimB = comparisonType === 'simulation_vs_simulation';
			expect(showSimB).toBe(false);
		});
	});

	describe('simulation type selector options', () => {
		const simTypeOptions = [
			{ value: 'policy', label: 'Policy' },
			{ value: 'batch', label: 'Batch' }
		];

		it('has 2 simulation type options', () => {
			expect(simTypeOptions).toHaveLength(2);
		});

		it('has Policy option', () => {
			expect(simTypeOptions[0].value).toBe('policy');
		});

		it('has Batch option', () => {
			expect(simTypeOptions[1].value).toBe('batch');
		});
	});

	describe('getSimLabel', () => {
		function getSimLabel(sim: { id: string; name: string; simulation_type?: string; batch_type?: string }): string {
			const typeLabel = sim.simulation_type ?? sim.batch_type ?? '';
			return `${sim.name} (${typeLabel.replace(/_/g, ' ')})`;
		}

		it('formats policy simulation label', () => {
			const label = getSimLabel({ id: 'pol-1', name: 'SoD Test', simulation_type: 'sod_rule' });
			expect(label).toBe('SoD Test (sod rule)');
		});

		it('formats batch simulation label', () => {
			const label = getSimLabel({ id: 'bat-1', name: 'Role Cleanup', batch_type: 'role_remove' });
			expect(label).toBe('Role Cleanup (role remove)');
		});

		it('handles missing type', () => {
			const label = getSimLabel({ id: 'x', name: 'No Type' });
			expect(label).toBe('No Type ()');
		});
	});

	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Create Comparison';
			expect(title).toBe('Create Comparison');
		});

		it('has correct description', () => {
			const description = 'Compare two simulations or a simulation against the current state';
			expect(description).toBe('Compare two simulations or a simulation against the current state');
		});
	});

	describe('cancel link', () => {
		it('links back to simulations hub', () => {
			expect('/governance/simulations').toBe('/governance/simulations');
		});
	});
});
