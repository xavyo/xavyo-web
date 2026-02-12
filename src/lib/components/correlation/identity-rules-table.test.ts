import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import IdentityRulesTable from './identity-rules-table.svelte';
import type { IdentityCorrelationRule } from '$lib/api/types';

vi.mock('$lib/api/correlation-client', () => ({
	createIdentityCorrelationRuleClient: vi.fn().mockResolvedValue({}),
	updateIdentityCorrelationRuleClient: vi.fn().mockResolvedValue({}),
	deleteIdentityCorrelationRuleClient: vi.fn().mockResolvedValue(undefined)
}));

function makeRule(overrides: Partial<IdentityCorrelationRule> = {}): IdentityCorrelationRule {
	return {
		id: 'irule-1',
		name: 'Email Match',
		attribute: 'email',
		match_type: 'exact',
		algorithm: null,
		threshold: 0.8,
		weight: 1,
		is_active: true,
		priority: 1,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		...overrides
	};
}

describe('IdentityRulesTable', () => {
	afterEach(cleanup);

	it('renders empty state when rules is empty', () => {
		render(IdentityRulesTable, { props: { rules: [] } });
		expect(screen.getByText('No identity correlation rules configured.')).toBeTruthy();
		expect(screen.getByText('0 identity correlation rules')).toBeTruthy();
	});

	it('renders singular "rule" when there is exactly one rule', () => {
		render(IdentityRulesTable, { props: { rules: [makeRule()] } });
		expect(screen.getByText('1 identity correlation rule')).toBeTruthy();
	});

	it('renders plural "rules" when there are multiple rules', () => {
		const rules = [makeRule(), makeRule({ id: 'irule-2', name: 'Name Match' })];
		render(IdentityRulesTable, { props: { rules } });
		expect(screen.getByText('2 identity correlation rules')).toBeTruthy();
	});

	it('renders table rows with rule data', () => {
		const rule = makeRule({
			name: 'Email Match',
			attribute: 'email',
			match_type: 'exact',
			threshold: 0.8,
			weight: 1,
			priority: 1
		});
		render(IdentityRulesTable, { props: { rules: [rule] } });

		expect(screen.getByText('Email Match')).toBeTruthy();
		expect(screen.getByText('email')).toBeTruthy();
		expect(screen.getByText('exact')).toBeTruthy();
		expect(screen.getByText('80%')).toBeTruthy();
	});

	it('renders table column headers', () => {
		render(IdentityRulesTable, { props: { rules: [makeRule()] } });
		expect(screen.getByText('Name')).toBeTruthy();
		expect(screen.getByText('Attribute')).toBeTruthy();
		expect(screen.getByText('Match Type')).toBeTruthy();
		expect(screen.getByText('Algorithm')).toBeTruthy();
		expect(screen.getByText('Threshold')).toBeTruthy();
		// "Weight" appears as header and data cell value "1", check header exists
		expect(screen.getByText('Weight')).toBeTruthy();
		// "Active" appears in both the header and the badge, so use getAllByText
		expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('Priority')).toBeTruthy();
		expect(screen.getByText('Actions')).toBeTruthy();
	});

	it('shows Add Rule button', () => {
		render(IdentityRulesTable, { props: { rules: [] } });
		expect(screen.getByText('Add Rule')).toBeTruthy();
	});

	it('shows Active badge for active rules', () => {
		const rule = makeRule({ is_active: true });
		render(IdentityRulesTable, { props: { rules: [rule] } });
		// "Active" appears as both column header and badge text
		const matches = screen.getAllByText('Active');
		expect(matches.length).toBe(2); // header + badge
	});

	it('shows Inactive badge for inactive rules', () => {
		const rule = makeRule({ is_active: false });
		render(IdentityRulesTable, { props: { rules: [rule] } });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('renders threshold as percentage', () => {
		const rule = makeRule({ threshold: 0.95 });
		render(IdentityRulesTable, { props: { rules: [rule] } });
		expect(screen.getByText('95%')).toBeTruthy();
	});

	it('displays algorithm when present', () => {
		const rule = makeRule({ algorithm: 'levenshtein' });
		render(IdentityRulesTable, { props: { rules: [rule] } });
		expect(screen.getByText('levenshtein')).toBeTruthy();
	});

	it('displays "--" when algorithm is null', () => {
		const rule = makeRule({ algorithm: null });
		render(IdentityRulesTable, { props: { rules: [rule] } });
		expect(screen.getByText('--')).toBeTruthy();
	});

	it('renders different match types with badges', () => {
		const rules = [
			makeRule({ id: 'r1', name: 'Exact', match_type: 'exact' }),
			makeRule({ id: 'r2', name: 'Fuzzy', match_type: 'fuzzy' }),
			makeRule({ id: 'r3', name: 'Expr', match_type: 'expression' })
		];
		render(IdentityRulesTable, { props: { rules } });
		expect(screen.getByText('exact')).toBeTruthy();
		expect(screen.getByText('fuzzy')).toBeTruthy();
		expect(screen.getByText('expression')).toBeTruthy();
	});

	it('renders weight and priority values', () => {
		const rule = makeRule({ weight: 2.5, priority: 3 });
		render(IdentityRulesTable, { props: { rules: [rule] } });
		expect(screen.getByText('2.5')).toBeTruthy();
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('renders multiple rules in the table', () => {
		const rules = [
			makeRule({ id: 'r1', name: 'Email Match', attribute: 'email' }),
			makeRule({ id: 'r2', name: 'Name Match', attribute: 'display_name' }),
			makeRule({ id: 'r3', name: 'Phone Match', attribute: 'phone' })
		];
		render(IdentityRulesTable, { props: { rules } });
		expect(screen.getByText('Email Match')).toBeTruthy();
		expect(screen.getByText('Name Match')).toBeTruthy();
		expect(screen.getByText('Phone Match')).toBeTruthy();
	});

	it('renders both active and inactive rules in same table', () => {
		const rules = [
			makeRule({ id: 'r1', name: 'Active Rule', is_active: true }),
			makeRule({ id: 'r2', name: 'Inactive Rule', is_active: false })
		];
		render(IdentityRulesTable, { props: { rules } });
		// "Active" appears as column header + badge on first rule = 2
		expect(screen.getAllByText('Active').length).toBe(2);
		expect(screen.getByText('Inactive')).toBeTruthy();
	});
});
