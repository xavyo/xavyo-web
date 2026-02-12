import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RuleForm from './rule-form.svelte';
import type { CorrelationRule } from '$lib/api/types';

vi.mock('$lib/api/correlation-client', () => ({
	createCorrelationRuleClient: vi.fn(),
	updateCorrelationRuleClient: vi.fn(),
	validateExpressionClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

function makeRule(overrides: Partial<CorrelationRule> = {}): CorrelationRule {
	return {
		id: 'rule-1',
		tenant_id: 'tenant-1',
		connector_id: 'conn-1',
		name: 'Email exact match',
		source_attribute: 'email',
		target_attribute: 'email',
		match_type: 'exact',
		algorithm: null,
		threshold: 0.8,
		weight: 1,
		expression: null,
		tier: 1,
		is_definitive: false,
		normalize: true,
		is_active: true,
		priority: 10,
		created_at: '2025-06-01T10:00:00Z',
		updated_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('RuleForm', () => {
	afterEach(cleanup);

	// --- Create mode tests ---

	it('renders the name input', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Name')).toBeTruthy();
		expect(screen.getByLabelText('Name')).toBeTruthy();
	});

	it('renders source and target attribute inputs', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Source Attribute')).toBeTruthy();
		expect(screen.getByText('Target Attribute')).toBeTruthy();
		expect(screen.getByLabelText('Source Attribute')).toBeTruthy();
		expect(screen.getByLabelText('Target Attribute')).toBeTruthy();
	});

	it('renders match type select with options', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Match Type')).toBeTruthy();
		const select = screen.getByLabelText('Match Type') as HTMLSelectElement;
		expect(select.value).toBe('exact');
		// Check that all options exist
		const options = Array.from(select.querySelectorAll('option'));
		const values = options.map((o) => o.value);
		expect(values).toContain('exact');
		expect(values).toContain('fuzzy');
		expect(values).toContain('expression');
	});

	it('renders threshold and weight inputs', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Threshold (%)')).toBeTruthy();
		expect(screen.getByText('Weight')).toBeTruthy();
	});

	it('renders tier and priority inputs', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Tier')).toBeTruthy();
		expect(screen.getByText('Priority')).toBeTruthy();
	});

	it('renders boolean checkboxes', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Definitive match')).toBeTruthy();
		expect(screen.getByText('Normalize values')).toBeTruthy();
	});

	it('renders "Create Rule" submit button in create mode', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Create Rule')).toBeTruthy();
	});

	it('does not show algorithm field by default (exact match type)', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.queryByText('Algorithm')).toBeNull();
	});

	it('does not show expression field by default (exact match type)', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.queryByLabelText('Expression')).toBeNull();
	});

	it('renders cancel button when onCancel is provided', () => {
		const onCancel = vi.fn();
		render(RuleForm, { props: { connectorId: 'conn-1', onCancel } });
		expect(screen.getByText('Cancel')).toBeTruthy();
	});

	it('does not render cancel button when onCancel is not provided', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		expect(screen.queryByText('Cancel')).toBeNull();
	});

	// --- Edit mode tests ---

	it('renders "Update Rule" submit button in edit mode', () => {
		render(RuleForm, { props: { connectorId: 'conn-1', rule: makeRule() } });
		expect(screen.getByText('Update Rule')).toBeTruthy();
	});

	it('populates form fields from existing rule in edit mode', () => {
		const rule = makeRule({
			name: 'Email exact match',
			source_attribute: 'email',
			target_attribute: 'user_email'
		});
		render(RuleForm, { props: { connectorId: 'conn-1', rule } });

		const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
		expect(nameInput.value).toBe('Email exact match');

		const sourceInput = screen.getByLabelText('Source Attribute') as HTMLInputElement;
		expect(sourceInput.value).toBe('email');

		const targetInput = screen.getByLabelText('Target Attribute') as HTMLInputElement;
		expect(targetInput.value).toBe('user_email');
	});

	it('shows algorithm field when rule match_type is fuzzy', () => {
		const rule = makeRule({
			match_type: 'fuzzy',
			algorithm: 'jaro_winkler'
		});
		render(RuleForm, { props: { connectorId: 'conn-1', rule } });
		expect(screen.getByText('Algorithm')).toBeTruthy();
	});

	it('shows expression field and test section when rule match_type is expression', () => {
		const rule = makeRule({
			match_type: 'expression',
			expression: 'source.email == target.email'
		});
		render(RuleForm, { props: { connectorId: 'conn-1', rule } });
		expect(screen.getByLabelText('Expression')).toBeTruthy();
		expect(screen.getByText('Test Expression')).toBeTruthy();
		expect(screen.getByText('Test Input (optional JSON)')).toBeTruthy();
	});

	it('populates weight from existing rule', () => {
		const rule = makeRule({ weight: 2.5 });
		render(RuleForm, { props: { connectorId: 'conn-1', rule } });
		const weightInput = screen.getByLabelText('Weight') as HTMLInputElement;
		expect(weightInput.value).toBe('2.5');
	});

	it('populates tier from existing rule', () => {
		const rule = makeRule({ tier: 3 });
		render(RuleForm, { props: { connectorId: 'conn-1', rule } });
		const tierInput = screen.getByLabelText('Tier') as HTMLInputElement;
		expect(tierInput.value).toBe('3');
	});

	it('populates priority from existing rule', () => {
		const rule = makeRule({ priority: 25 });
		render(RuleForm, { props: { connectorId: 'conn-1', rule } });
		const priorityInput = screen.getByLabelText('Priority') as HTMLInputElement;
		expect(priorityInput.value).toBe('25');
	});

	it('renders default threshold as percentage', () => {
		render(RuleForm, { props: { connectorId: 'conn-1' } });
		const thresholdInput = screen.getByLabelText('Threshold (%)') as HTMLInputElement;
		// Default threshold 0.8 -> 80%
		expect(thresholdInput.value).toBe('80');
	});

	it('renders existing rule threshold as percentage', () => {
		const rule = makeRule({ threshold: 0.95 });
		render(RuleForm, { props: { connectorId: 'conn-1', rule } });
		const thresholdInput = screen.getByLabelText('Threshold (%)') as HTMLInputElement;
		expect(thresholdInput.value).toBe('95');
	});
});
