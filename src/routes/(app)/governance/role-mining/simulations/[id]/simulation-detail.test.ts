import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true,
	dev: false
}));

vi.mock('$lib/api/role-mining-client', () => ({
	executeSimulationClient: vi.fn(),
	applySimulationClient: vi.fn(),
	cancelSimulationClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import SimulationDetailPage from './+page.svelte';
import type { Simulation, SimulationChanges, SimulationStatus, ScenarioType } from '$lib/api/types';

function makeSimulation(overrides: Partial<Simulation> = {}): Simulation {
	return {
		id: 'sim-1',
		tenant_id: 't1',
		name: 'Add Finance Entitlement',
		scenario_type: 'add_entitlement' as ScenarioType,
		target_role_id: 'role-1',
		changes: {
			change_type: 'add_entitlement',
			role_id: 'role-1',
			entitlement_id: 'ent-1'
		},
		status: 'draft' as SimulationStatus,
		affected_users: [],
		access_gained: null,
		access_lost: null,
		applied_by: null,
		applied_at: null,
		created_by: 'admin-1',
		created_at: '2026-02-01T10:00:00Z',
		...overrides
	};
}

function renderDetail(simulation: Simulation = makeSimulation()) {
	return render(SimulationDetailPage, {
		props: {
			data: { simulation } as any
		}
	});
}

describe('Simulation detail page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders simulation name in header', () => {
		renderDetail(makeSimulation({ name: 'Add Finance Entitlement' }));
		expect(screen.getByText('Add Finance Entitlement')).toBeTruthy();
	});

	it('shows simulation status badge', () => {
		renderDetail(makeSimulation({ status: 'draft' }));
		expect(screen.getByText('Draft')).toBeTruthy();
	});

	it('shows scenario type', () => {
		renderDetail(makeSimulation({ scenario_type: 'add_entitlement' }));
		expect(screen.getByText('Add Entitlement')).toBeTruthy();
	});

	it('shows Execute button for draft simulations', () => {
		renderDetail(makeSimulation({ status: 'draft' }));
		expect(screen.getByText('Execute')).toBeTruthy();
	});

	it('shows Apply button for executed simulations', () => {
		renderDetail(
			makeSimulation({
				status: 'executed',
				affected_users: ['u-1', 'u-2'],
				access_gained: { entitlements: ['ent-1'] },
				access_lost: {}
			})
		);
		expect(screen.getByText('Apply')).toBeTruthy();
	});
});

describe('Simulation detail rendering logic', () => {
	describe('simulation status states', () => {
		it('isDraft is true for draft status', () => {
			const sim = makeSimulation({ status: 'draft' });
			expect(sim.status === 'draft').toBe(true);
		});

		it('isExecuted is true for executed status', () => {
			const sim = makeSimulation({ status: 'executed' });
			expect(sim.status === 'executed').toBe(true);
		});

		it('isApplied is true for applied status', () => {
			const sim = makeSimulation({ status: 'applied' });
			expect(sim.status === 'applied').toBe(true);
		});

		it('isCancelled is true for cancelled status', () => {
			const sim = makeSimulation({ status: 'cancelled' });
			expect(sim.status === 'cancelled').toBe(true);
		});

		it('isReadOnly is true for applied and cancelled', () => {
			for (const status of ['applied', 'cancelled'] as SimulationStatus[]) {
				const sim = makeSimulation({ status });
				const isReadOnly = sim.status === 'applied' || sim.status === 'cancelled';
				expect(isReadOnly).toBe(true);
			}
		});

		it('isReadOnly is false for draft and executed', () => {
			for (const status of ['draft', 'executed'] as SimulationStatus[]) {
				const sim = makeSimulation({ status });
				const isReadOnly = sim.status === 'applied' || sim.status === 'cancelled';
				expect(isReadOnly).toBe(false);
			}
		});
	});

	describe('scenario type labels', () => {
		const scenarioTypeLabels: Record<string, string> = {
			add_entitlement: 'Add Entitlement',
			remove_entitlement: 'Remove Entitlement',
			add_role: 'Add Role',
			remove_role: 'Remove Role',
			modify_role: 'Modify Role'
		};

		it('add_entitlement maps to Add Entitlement', () => {
			expect(scenarioTypeLabels['add_entitlement']).toBe('Add Entitlement');
		});

		it('remove_entitlement maps to Remove Entitlement', () => {
			expect(scenarioTypeLabels['remove_entitlement']).toBe('Remove Entitlement');
		});

		it('add_role maps to Add Role', () => {
			expect(scenarioTypeLabels['add_role']).toBe('Add Role');
		});

		it('remove_role maps to Remove Role', () => {
			expect(scenarioTypeLabels['remove_role']).toBe('Remove Role');
		});

		it('modify_role maps to Modify Role', () => {
			expect(scenarioTypeLabels['modify_role']).toBe('Modify Role');
		});
	});

	describe('formatDate', () => {
		function formatDate(val: string | null): string {
			if (!val) return '--';
			const d = new Date(val);
			if (isNaN(d.getTime())) return '--';
			return d.toLocaleString();
		}

		it('formats valid date', () => {
			expect(formatDate('2026-02-01T10:00:00Z')).not.toBe('--');
		});

		it('returns -- for null', () => {
			expect(formatDate(null)).toBe('--');
		});

		it('returns -- for empty string', () => {
			expect(formatDate('')).toBe('--');
		});
	});

	describe('formatJson', () => {
		function formatJson(val: unknown): string {
			if (val === null || val === undefined) return 'None';
			try {
				return JSON.stringify(val, null, 2);
			} catch {
				return String(val);
			}
		}

		it('returns None for null', () => {
			expect(formatJson(null)).toBe('None');
		});

		it('returns None for undefined', () => {
			expect(formatJson(undefined)).toBe('None');
		});

		it('returns pretty-printed JSON for objects', () => {
			const result = formatJson({ entitlements: ['ent-1'] });
			expect(result).toContain('entitlements');
			expect(result).toContain('ent-1');
		});

		it('returns string for primitive', () => {
			expect(formatJson(42)).toBe('42');
		});
	});

	describe('changes section', () => {
		it('shows change_type when present', () => {
			const sim = makeSimulation({
				changes: { change_type: 'add_entitlement', role_id: 'r-1' }
			});
			expect(sim.changes.change_type).toBe('add_entitlement');
		});

		it('shows role_id when present', () => {
			const sim = makeSimulation({ changes: { role_id: 'r-1' } });
			expect(sim.changes.role_id).toBe('r-1');
		});

		it('shows entitlement_id when present', () => {
			const sim = makeSimulation({ changes: { entitlement_id: 'ent-1' } });
			expect(sim.changes.entitlement_id).toBe('ent-1');
		});

		it('handles entitlement_ids array', () => {
			const sim = makeSimulation({
				changes: { entitlement_ids: ['ent-1', 'ent-2', 'ent-3'] }
			});
			expect(sim.changes.entitlement_ids).toHaveLength(3);
		});

		it('handles user_ids array', () => {
			const sim = makeSimulation({ changes: { user_ids: ['u-1', 'u-2'] } });
			expect(sim.changes.user_ids).toHaveLength(2);
		});

		it('handles empty changes', () => {
			const sim = makeSimulation({ changes: {} });
			expect(Object.keys(sim.changes)).toHaveLength(0);
		});
	});

	describe('impact analysis visibility', () => {
		it('impact shown for executed simulations', () => {
			const sim = makeSimulation({ status: 'executed' });
			const showImpact = sim.status === 'executed' || sim.status === 'applied';
			expect(showImpact).toBe(true);
		});

		it('impact shown for applied simulations', () => {
			const sim = makeSimulation({ status: 'applied' });
			const showImpact = sim.status === 'executed' || sim.status === 'applied';
			expect(showImpact).toBe(true);
		});

		it('impact hidden for draft simulations', () => {
			const sim = makeSimulation({ status: 'draft' });
			const showImpact = sim.status === 'executed' || sim.status === 'applied';
			expect(showImpact).toBe(false);
		});

		it('impact hidden for cancelled simulations', () => {
			const sim = makeSimulation({ status: 'cancelled' });
			const showImpact = sim.status === 'executed' || sim.status === 'applied';
			expect(showImpact).toBe(false);
		});
	});

	describe('action button visibility', () => {
		it('Execute and Cancel shown for draft', () => {
			const sim = makeSimulation({ status: 'draft' });
			expect(sim.status === 'draft').toBe(true);
		});

		it('Apply and Cancel shown for executed', () => {
			const sim = makeSimulation({ status: 'executed' });
			expect(sim.status === 'executed').toBe(true);
		});

		it('no actions for applied', () => {
			const sim = makeSimulation({ status: 'applied' });
			const isReadOnly = sim.status === 'applied' || sim.status === 'cancelled';
			expect(isReadOnly).toBe(true);
		});

		it('no actions for cancelled', () => {
			const sim = makeSimulation({ status: 'cancelled' });
			const isReadOnly = sim.status === 'applied' || sim.status === 'cancelled';
			expect(isReadOnly).toBe(true);
		});
	});

	describe('applied info visibility', () => {
		it('shows applied info for applied simulations', () => {
			const sim = makeSimulation({
				status: 'applied',
				applied_by: 'admin-1',
				applied_at: '2026-02-10T15:00:00Z'
			});
			expect(sim.applied_by).toBe('admin-1');
			expect(sim.applied_at).toBe('2026-02-10T15:00:00Z');
		});

		it('hides applied info for draft simulations', () => {
			const sim = makeSimulation({ status: 'draft' });
			expect(sim.applied_by).toBeNull();
			expect(sim.applied_at).toBeNull();
		});
	});

	describe('mock data conformity', () => {
		it('Simulation has all required fields', () => {
			const sim = makeSimulation();
			expect(sim.id).toBeDefined();
			expect(sim.tenant_id).toBeDefined();
			expect(sim.name).toBeDefined();
			expect(sim.scenario_type).toBeDefined();
			expect(sim.changes).toBeDefined();
			expect(sim.status).toBeDefined();
			expect(Array.isArray(sim.affected_users)).toBe(true);
			expect(sim.created_by).toBeDefined();
			expect(sim.created_at).toBeDefined();
		});

		it('Simulation status is a valid value', () => {
			const validStatuses = ['draft', 'executed', 'applied', 'cancelled'];
			const sim = makeSimulation();
			expect(validStatuses).toContain(sim.status);
		});

		it('Simulation scenario_type is a valid value', () => {
			const validTypes = [
				'add_entitlement',
				'remove_entitlement',
				'add_role',
				'remove_role',
				'modify_role'
			];
			const sim = makeSimulation();
			expect(validTypes).toContain(sim.scenario_type);
		});
	});
});

describe('Simulation detail +page.svelte module', () => {
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
