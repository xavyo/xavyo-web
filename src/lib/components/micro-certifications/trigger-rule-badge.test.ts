import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TriggerRuleBadge from './trigger-rule-badge.svelte';

describe('TriggerRuleBadge', () => {
	it('renders high_risk_assignment trigger type', () => {
		render(TriggerRuleBadge, { props: { type: 'trigger', value: 'high_risk_assignment' } });
		const badge = screen.getByTestId('trigger-rule-badge');
		expect(badge.textContent).toContain('High Risk');
		expect(badge.className).toContain('purple');
	});

	it('renders sod_violation trigger type', () => {
		render(TriggerRuleBadge, { props: { type: 'trigger', value: 'sod_violation' } });
		expect(screen.getByTestId('trigger-rule-badge').textContent).toContain('SoD Violation');
	});

	it('renders manager_change trigger type', () => {
		render(TriggerRuleBadge, { props: { type: 'trigger', value: 'manager_change' } });
		const badge = screen.getByTestId('trigger-rule-badge');
		expect(badge.textContent).toContain('Manager Change');
		expect(badge.className).toContain('red');
	});

	it('renders periodic_recert trigger type', () => {
		render(TriggerRuleBadge, { props: { type: 'trigger', value: 'periodic_recert' } });
		expect(screen.getByTestId('trigger-rule-badge').textContent).toContain('Periodic');
	});

	it('renders manual trigger type', () => {
		render(TriggerRuleBadge, { props: { type: 'trigger', value: 'manual' } });
		expect(screen.getByTestId('trigger-rule-badge').textContent).toContain('Manual');
	});

	it('renders tenant scope', () => {
		render(TriggerRuleBadge, { props: { type: 'scope', value: 'tenant' } });
		const badge = screen.getByTestId('trigger-rule-badge');
		expect(badge.textContent).toContain('Tenant');
		expect(badge.className).toContain('indigo');
	});

	it('renders application scope', () => {
		render(TriggerRuleBadge, { props: { type: 'scope', value: 'application' } });
		expect(screen.getByTestId('trigger-rule-badge').textContent).toContain('Application');
	});

	it('renders entitlement scope', () => {
		render(TriggerRuleBadge, { props: { type: 'scope', value: 'entitlement' } });
		expect(screen.getByTestId('trigger-rule-badge').textContent).toContain('Entitlement');
	});
});
