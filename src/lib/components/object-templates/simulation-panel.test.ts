import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import SimulationPanel from './simulation-panel.svelte';
import type { TemplateSimulationResult } from '$lib/api/types';

function makeResult(overrides: Partial<TemplateSimulationResult> = {}): TemplateSimulationResult {
	return {
		template_id: 'tmpl-1',
		rules_applied: [],
		validation_errors: [],
		computed_values: {},
		affected_count: 0,
		...overrides
	};
}

describe('SimulationPanel', () => {
	afterEach(cleanup);

	it('renders Sample Object textarea', () => {
		render(SimulationPanel);
		expect(screen.getByLabelText('Sample Object (JSON)')).toBeTruthy();
	});

	it('renders Run Simulation button', () => {
		render(SimulationPanel);
		expect(screen.getByText('Run Simulation')).toBeTruthy();
	});

	it('shows Simulating... when loading', () => {
		render(SimulationPanel, { props: { loading: true } });
		expect(screen.getByText('Simulating...')).toBeTruthy();
	});

	it('disables button when loading', () => {
		render(SimulationPanel, { props: { loading: true } });
		const button = screen.getByText('Simulating...') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});

	it('shows error message', () => {
		render(SimulationPanel, { props: { error: 'Something went wrong' } });
		expect(screen.getByText('Something went wrong')).toBeTruthy();
	});

	it('shows affected count', () => {
		render(SimulationPanel, { props: { result: makeResult({ affected_count: 42 }) } });
		expect(screen.getByText('Affected Count')).toBeTruthy();
		expect(screen.getByText('42')).toBeTruthy();
	});

	it('shows rules applied with count', () => {
		const result = makeResult({
			rules_applied: [
				{
					rule_id: 'r-1',
					target_attribute: 'department',
					rule_type: 'default',
					before_value: '',
					after_value: 'Engineering',
					applied: true,
					skip_reason: null
				}
			]
		});
		render(SimulationPanel, { props: { result } });
		expect(screen.getByText('Rules Applied (1)')).toBeTruthy();
		expect(screen.getByText('department')).toBeTruthy();
		expect(screen.getByText('default')).toBeTruthy();
	});

	it('shows before and after values in rules applied', () => {
		const result = makeResult({
			rules_applied: [
				{
					rule_id: 'r-1',
					target_attribute: 'dept',
					rule_type: 'default',
					before_value: 'old',
					after_value: 'new',
					applied: true,
					skip_reason: null
				}
			]
		});
		render(SimulationPanel, { props: { result } });
		expect(screen.getByText('old')).toBeTruthy();
		expect(screen.getByText('new')).toBeTruthy();
	});

	it('shows Yes for applied rules and No for skipped', () => {
		const result = makeResult({
			rules_applied: [
				{
					rule_id: 'r-1',
					target_attribute: 'dept',
					rule_type: 'default',
					before_value: null,
					after_value: 'Eng',
					applied: true,
					skip_reason: null
				},
				{
					rule_id: 'r-2',
					target_attribute: 'title',
					rule_type: 'validation',
					before_value: 'x',
					after_value: 'x',
					applied: false,
					skip_reason: 'Condition not met'
				}
			]
		});
		render(SimulationPanel, { props: { result } });
		expect(screen.getByText('Yes')).toBeTruthy();
		expect(screen.getByText('No')).toBeTruthy();
		expect(screen.getByText('Condition not met')).toBeTruthy();
	});

	it('shows no rules applied message when empty', () => {
		render(SimulationPanel, { props: { result: makeResult() } });
		expect(screen.getByText('No rules were applied.')).toBeTruthy();
	});

	it('shows validation errors when present', () => {
		const result = makeResult({
			validation_errors: [
				{
					rule_id: 'r-1',
					target_attribute: 'email',
					expression: 'email_format(value)',
					message: 'Invalid email format'
				}
			]
		});
		render(SimulationPanel, { props: { result } });
		expect(screen.getByText('Validation Errors (1)')).toBeTruthy();
		expect(screen.getByText(/Invalid email format/)).toBeTruthy();
	});

	it('does not show validation errors section when empty', () => {
		render(SimulationPanel, { props: { result: makeResult() } });
		expect(screen.queryByText(/Validation Errors/)).toBeNull();
	});

	it('shows computed values when present', () => {
		const result = makeResult({
			computed_values: { full_name: 'John Doe', display_name: 'jdoe' }
		});
		render(SimulationPanel, { props: { result } });
		expect(screen.getByText('Computed Values')).toBeTruthy();
		expect(screen.getByText(/full_name/)).toBeTruthy();
		expect(screen.getByText(/John Doe/)).toBeTruthy();
	});

	it('does not show computed values section when empty', () => {
		render(SimulationPanel, { props: { result: makeResult({ computed_values: {} }) } });
		expect(screen.queryByText('Computed Values')).toBeNull();
	});

	it('validates JSON before submitting', async () => {
		const onsubmit = vi.fn();
		render(SimulationPanel, { props: { onsubmit } });
		const textarea = screen.getByLabelText('Sample Object (JSON)') as HTMLTextAreaElement;
		await fireEvent.input(textarea, { target: { value: 'not json' } });
		await fireEvent.click(screen.getByText('Run Simulation'));
		expect(screen.getByText('Invalid JSON. Please check your input.')).toBeTruthy();
		expect(onsubmit).not.toHaveBeenCalled();
	});

	it('calls onsubmit with valid JSON string', async () => {
		const onsubmit = vi.fn();
		render(SimulationPanel, { props: { onsubmit } });
		const textarea = screen.getByLabelText('Sample Object (JSON)') as HTMLTextAreaElement;
		const json = '{"department": "Eng"}';
		await fireEvent.input(textarea, { target: { value: json } });
		await fireEvent.click(screen.getByText('Run Simulation'));
		expect(onsubmit).toHaveBeenCalledWith(json);
	});

	it('does not render result section when result is null', () => {
		render(SimulationPanel, { props: { result: null } });
		expect(screen.queryByText('Affected Count')).toBeNull();
		expect(screen.queryByText('Rules Applied')).toBeNull();
	});

	it('renders table headers for rules applied', () => {
		const result = makeResult({
			rules_applied: [
				{
					rule_id: 'r-1',
					target_attribute: 'dept',
					rule_type: 'default',
					before_value: '',
					after_value: 'Eng',
					applied: true,
					skip_reason: null
				}
			]
		});
		render(SimulationPanel, { props: { result } });
		expect(screen.getByText('Attribute')).toBeTruthy();
		expect(screen.getByText('Rule Type')).toBeTruthy();
		expect(screen.getByText('Before')).toBeTruthy();
		expect(screen.getByText('After')).toBeTruthy();
		expect(screen.getByText('Applied')).toBeTruthy();
		expect(screen.getByText('Skip Reason')).toBeTruthy();
	});
});
