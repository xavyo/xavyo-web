import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import RuleTypeBadge from './rule-type-badge.svelte';

describe('RuleTypeBadge', () => {
	afterEach(() => { cleanup(); });

	it('renders NoManager type', () => {
		render(RuleTypeBadge, { props: { ruleType: 'no_manager' } });
		expect(screen.getByText('No Manager')).toBeTruthy();
	});

	it('renders Terminated type', () => {
		render(RuleTypeBadge, { props: { ruleType: 'terminated' } });
		expect(screen.getByText('Terminated')).toBeTruthy();
	});

	it('renders Inactive type', () => {
		render(RuleTypeBadge, { props: { ruleType: 'inactive' } });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('renders Custom type', () => {
		render(RuleTypeBadge, { props: { ruleType: 'custom' } });
		expect(screen.getByText('Custom')).toBeTruthy();
	});

	it('applies orange class for NoManager', () => {
		render(RuleTypeBadge, { props: { ruleType: 'no_manager' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-orange-100');
	});

	it('applies red class for Terminated', () => {
		render(RuleTypeBadge, { props: { ruleType: 'terminated' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-red-100');
	});

	it('applies indigo class for Custom', () => {
		render(RuleTypeBadge, { props: { ruleType: 'custom' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-indigo-100');
	});
});
