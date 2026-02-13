import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import RuleParamsEditor from './rule-params-editor.svelte';

describe('RuleParamsEditor', () => {
	afterEach(() => { cleanup(); });

	it('shows no params message for NoManager', () => {
		render(RuleParamsEditor, { props: { ruleType: 'no_manager' } });
		expect(screen.getByText('This rule type has no configurable parameters.')).toBeTruthy();
	});

	it('shows no params message for Terminated', () => {
		render(RuleParamsEditor, { props: { ruleType: 'terminated' } });
		expect(screen.getByText('This rule type has no configurable parameters.')).toBeTruthy();
	});

	it('shows days threshold input for Inactive', () => {
		render(RuleParamsEditor, { props: { ruleType: 'inactive' } });
		expect(screen.getByText('Days Threshold')).toBeTruthy();
		const input = document.querySelector('input[type="number"]');
		expect(input).toBeTruthy();
	});

	it('shows expression textarea for Custom', () => {
		render(RuleParamsEditor, { props: { ruleType: 'custom' } });
		expect(screen.getByText('Expression')).toBeTruthy();
		const textarea = document.querySelector('textarea');
		expect(textarea).toBeTruthy();
	});

	it('renders days threshold with default value', () => {
		render(RuleParamsEditor, { props: { ruleType: 'inactive', daysThreshold: 60 } });
		const input = document.querySelector('input[type="number"]') as HTMLInputElement;
		expect(input?.value).toBe('60');
	});

	it('renders expression with provided value', () => {
		render(RuleParamsEditor, { props: { ruleType: 'custom', expression: 'age > 30' } });
		const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
		expect(textarea?.value).toBe('age > 30');
	});

	it('renders readonly when specified', () => {
		render(RuleParamsEditor, { props: { ruleType: 'inactive', readonly: true } });
		const input = document.querySelector('input[type="number"]') as HTMLInputElement;
		expect(input?.readOnly).toBe(true);
	});
});
