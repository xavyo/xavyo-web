import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import RulesTable from './rules-table.svelte';
import type { CorrelationRule } from '$lib/api/types';

vi.mock('$lib/api/correlation-client', () => ({
	deleteCorrelationRuleClient: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

function makeRule(overrides: Partial<CorrelationRule> = {}): CorrelationRule {
	return {
		id: 'rule-1',
		tenant_id: 'tenant-1',
		connector_id: 'conn-1',
		name: 'Email Match',
		source_attribute: 'mail',
		target_attribute: 'email',
		match_type: 'exact',
		algorithm: null,
		threshold: 0.85,
		weight: 1,
		expression: null,
		tier: 1,
		is_definitive: false,
		normalize: false,
		is_active: true,
		priority: 1,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		...overrides
	};
}

describe('RulesTable', () => {
	afterEach(cleanup);

	it('renders empty state when rules is empty', () => {
		render(RulesTable, { props: { rules: [], connectorId: 'conn-1' } });
		expect(screen.getByText('No correlation rules configured')).toBeTruthy();
		expect(screen.getByText('0 correlation rules')).toBeTruthy();
	});

	it('renders singular "rule" when there is exactly one rule', () => {
		render(RulesTable, { props: { rules: [makeRule()], connectorId: 'conn-1' } });
		expect(screen.getByText('1 correlation rule')).toBeTruthy();
	});

	it('renders plural "rules" when there are multiple rules', () => {
		const rules = [makeRule(), makeRule({ id: 'rule-2', name: 'Name Match' })];
		render(RulesTable, { props: { rules, connectorId: 'conn-1' } });
		expect(screen.getByText('2 correlation rules')).toBeTruthy();
	});

	it('renders table rows with rule data', () => {
		const rule = makeRule({
			name: 'Email Match',
			source_attribute: 'mail',
			target_attribute: 'email',
			match_type: 'exact',
			threshold: 0.85,
			weight: 1,
			tier: 1,
			priority: 1
		});
		render(RulesTable, { props: { rules: [rule], connectorId: 'conn-1' } });

		expect(screen.getByText('Email Match')).toBeTruthy();
		expect(screen.getByText('mail')).toBeTruthy();
		expect(screen.getByText('email')).toBeTruthy();
		expect(screen.getByText('exact')).toBeTruthy();
		expect(screen.getByText('85%')).toBeTruthy();
	});

	it('shows Add Rule button', () => {
		render(RulesTable, { props: { rules: [], connectorId: 'conn-1' } });
		const buttons = screen.getAllByText('Add Rule');
		expect(buttons.length).toBeGreaterThanOrEqual(1);
	});

	it('shows Active badge for active rules', () => {
		const rule = makeRule({ is_active: true });
		render(RulesTable, { props: { rules: [rule], connectorId: 'conn-1' } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('shows Inactive badge for inactive rules', () => {
		const rule = makeRule({ is_active: false });
		render(RulesTable, { props: { rules: [rule], connectorId: 'conn-1' } });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('renders different match types', () => {
		const rules = [
			makeRule({ id: 'r1', name: 'Exact', match_type: 'exact' }),
			makeRule({ id: 'r2', name: 'Fuzzy', match_type: 'fuzzy' }),
			makeRule({ id: 'r3', name: 'Expr', match_type: 'expression' })
		];
		render(RulesTable, { props: { rules, connectorId: 'conn-1' } });
		expect(screen.getByText('exact')).toBeTruthy();
		expect(screen.getByText('fuzzy')).toBeTruthy();
		expect(screen.getByText('expression')).toBeTruthy();
	});

	it('renders threshold as percentage', () => {
		const rule = makeRule({ threshold: 0.9 });
		render(RulesTable, { props: { rules: [rule], connectorId: 'conn-1' } });
		expect(screen.getByText('90%')).toBeTruthy();
	});

	it('renders definitive indicator for definitive rules', () => {
		const rule = makeRule({ is_definitive: true });
		render(RulesTable, { props: { rules: [rule], connectorId: 'conn-1' } });
		// Non-definitive shows "--", definitive shows a check icon (no "--")
		expect(screen.queryByText('--')).toBeFalsy();
	});

	it('renders "--" for non-definitive rules', () => {
		const rule = makeRule({ is_definitive: false });
		render(RulesTable, { props: { rules: [rule], connectorId: 'conn-1' } });
		expect(screen.getByText('--')).toBeTruthy();
	});

	it('renders table column headers', () => {
		render(RulesTable, { props: { rules: [makeRule()], connectorId: 'conn-1' } });
		expect(screen.getByText('Name')).toBeTruthy();
		expect(screen.getByText('Mapping')).toBeTruthy();
		expect(screen.getByText('Match Type')).toBeTruthy();
		expect(screen.getByText('Threshold')).toBeTruthy();
		expect(screen.getByText('Weight')).toBeTruthy();
		expect(screen.getByText('Tier')).toBeTruthy();
		expect(screen.getByText('Definitive')).toBeTruthy();
		expect(screen.getByText('Status')).toBeTruthy();
		expect(screen.getByText('Priority')).toBeTruthy();
		expect(screen.getByText('Actions')).toBeTruthy();
	});

	it('sorts rules by tier then priority', () => {
		const rules = [
			makeRule({ id: 'r1', name: 'Low-Prio', tier: 2, priority: 2 }),
			makeRule({ id: 'r2', name: 'First', tier: 1, priority: 1 }),
			makeRule({ id: 'r3', name: 'High-Prio', tier: 2, priority: 1 })
		];
		render(RulesTable, { props: { rules, connectorId: 'conn-1' } });
		const rows = screen.getAllByRole('row');
		// Row 0 is the header, rows 1-3 are data
		expect(rows[1].textContent).toContain('First');
		expect(rows[2].textContent).toContain('High-Prio');
		expect(rows[3].textContent).toContain('Low-Prio');
	});

	it('renders edit and delete buttons per rule', () => {
		render(RulesTable, { props: { rules: [makeRule()], connectorId: 'conn-1' } });
		expect(screen.getByTitle('Edit rule')).toBeTruthy();
		expect(screen.getByTitle('Delete rule')).toBeTruthy();
	});

	it('has Add Rule button in empty state', () => {
		render(RulesTable, { props: { rules: [], connectorId: 'conn-1' } });
		// Both the header and empty state have Add Rule buttons
		const buttons = screen.getAllByText('Add Rule');
		expect(buttons.length).toBe(2);
	});
});
