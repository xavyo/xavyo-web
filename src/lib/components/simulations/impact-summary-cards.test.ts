import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ImpactSummaryCards from './impact-summary-cards.svelte';
import type { PolicyImpactSummary, BatchImpactSummary } from '$lib/api/types';

function makePolicySummary(overrides: Partial<PolicyImpactSummary> = {}): PolicyImpactSummary {
	return {
		total_users_analyzed: 100,
		affected_users: 25,
		by_severity: { critical: 3, high: 7, medium: 10, low: 5 },
		by_impact_type: { violation: 4, entitlement_gain: 8, entitlement_loss: 6, no_change: 5, warning: 2 },
		...overrides
	};
}

function makeBatchSummary(overrides: Partial<BatchImpactSummary> = {}): BatchImpactSummary {
	return {
		total_users: 200,
		affected_users: 50,
		entitlements_gained: 30,
		entitlements_lost: 10,
		sod_violations_introduced: 0,
		warnings: [],
		...overrides
	};
}

describe('ImpactSummaryCards', () => {
	afterEach(cleanup);

	// --- Null summary ---

	it('shows "No impact summary available" when summary is null', () => {
		render(ImpactSummaryCards, { props: { summary: null, type: 'policy' } });
		expect(screen.getByText(/No impact summary available/)).toBeTruthy();
	});

	// --- Policy impact summary ---

	it('renders total analyzed count for policy summary', () => {
		render(ImpactSummaryCards, { props: { summary: makePolicySummary(), type: 'policy' } });
		expect(screen.getByText('Total Analyzed')).toBeTruthy();
		expect(screen.getByText('100')).toBeTruthy();
	});

	it('renders affected users count for policy summary', () => {
		render(ImpactSummaryCards, { props: { summary: makePolicySummary(), type: 'policy' } });
		expect(screen.getByText('Affected Users')).toBeTruthy();
		expect(screen.getByText('25')).toBeTruthy();
	});

	it('renders severity breakdown card for policy summary', () => {
		render(ImpactSummaryCards, { props: { summary: makePolicySummary(), type: 'policy' } });
		expect(screen.getByText('By Severity')).toBeTruthy();
		expect(screen.getByText(/Critical: 3/)).toBeTruthy();
		expect(screen.getByText(/High: 7/)).toBeTruthy();
		expect(screen.getByText(/Medium: 10/)).toBeTruthy();
		expect(screen.getByText(/Low: 5/)).toBeTruthy();
	});

	it('renders impact type breakdown card for policy summary', () => {
		render(ImpactSummaryCards, { props: { summary: makePolicySummary(), type: 'policy' } });
		expect(screen.getByText('By Impact')).toBeTruthy();
		expect(screen.getByText(/Violations: 4/)).toBeTruthy();
		expect(screen.getByText(/Gains: 8/)).toBeTruthy();
		expect(screen.getByText(/Losses: 6/)).toBeTruthy();
	});

	it('hides zero-count severity entries', () => {
		const summary = makePolicySummary({
			by_severity: { critical: 0, high: 0, medium: 5, low: 3 }
		});
		render(ImpactSummaryCards, { props: { summary, type: 'policy' } });
		expect(screen.queryByText(/Critical: 0/)).toBeNull();
		expect(screen.queryByText(/High: 0/)).toBeNull();
		expect(screen.getByText(/Medium: 5/)).toBeTruthy();
		expect(screen.getByText(/Low: 3/)).toBeTruthy();
	});

	it('hides zero-count impact type entries', () => {
		const summary = makePolicySummary({
			by_impact_type: { violation: 2, entitlement_gain: 0, entitlement_loss: 0, no_change: 0, warning: 0 }
		});
		render(ImpactSummaryCards, { props: { summary, type: 'policy' } });
		expect(screen.getByText(/Violations: 2/)).toBeTruthy();
		expect(screen.queryByText(/Gains: 0/)).toBeNull();
	});

	// --- Batch impact summary ---

	it('renders total users count for batch summary', () => {
		render(ImpactSummaryCards, { props: { summary: makeBatchSummary(), type: 'batch' } });
		expect(screen.getByText('Total Users')).toBeTruthy();
		expect(screen.getByText('200')).toBeTruthy();
	});

	it('renders affected users count for batch summary', () => {
		render(ImpactSummaryCards, { props: { summary: makeBatchSummary(), type: 'batch' } });
		expect(screen.getByText('Affected Users')).toBeTruthy();
		expect(screen.getByText('50')).toBeTruthy();
	});

	it('renders entitlements gained count for batch summary', () => {
		render(ImpactSummaryCards, { props: { summary: makeBatchSummary(), type: 'batch' } });
		expect(screen.getByText('Entitlements Gained')).toBeTruthy();
		expect(screen.getByText('30')).toBeTruthy();
	});

	it('renders entitlements lost count for batch summary', () => {
		render(ImpactSummaryCards, { props: { summary: makeBatchSummary(), type: 'batch' } });
		expect(screen.getByText('Entitlements Lost')).toBeTruthy();
		expect(screen.getByText('10')).toBeTruthy();
	});

	// --- SoD violations ---

	it('shows SoD violations card when sod_violations_introduced > 0', () => {
		const summary = makeBatchSummary({ sod_violations_introduced: 3 });
		render(ImpactSummaryCards, { props: { summary, type: 'batch' } });
		expect(screen.getByText('SoD Violations')).toBeTruthy();
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('hides SoD violations card when sod_violations_introduced is 0', () => {
		const summary = makeBatchSummary({ sod_violations_introduced: 0 });
		render(ImpactSummaryCards, { props: { summary, type: 'batch' } });
		expect(screen.queryByText('SoD Violations')).toBeNull();
	});

	// --- Warnings ---

	it('shows warnings list when warnings are present', () => {
		const summary = makeBatchSummary({
			warnings: ['User X has conflicting roles', 'Entitlement Y is deprecated']
		});
		render(ImpactSummaryCards, { props: { summary, type: 'batch' } });
		expect(screen.getByText('Warnings')).toBeTruthy();
		expect(screen.getByText('User X has conflicting roles')).toBeTruthy();
		expect(screen.getByText('Entitlement Y is deprecated')).toBeTruthy();
	});

	it('hides warnings section when warnings array is empty', () => {
		const summary = makeBatchSummary({ warnings: [] });
		render(ImpactSummaryCards, { props: { summary, type: 'batch' } });
		expect(screen.queryByText('Warnings')).toBeNull();
	});

	// --- Correct numbers across all cards ---

	it('displays correct numbers in all policy cards', () => {
		const summary = makePolicySummary({
			total_users_analyzed: 500,
			affected_users: 123
		});
		render(ImpactSummaryCards, { props: { summary, type: 'policy' } });
		expect(screen.getByText('500')).toBeTruthy();
		expect(screen.getByText('123')).toBeTruthy();
	});

	it('displays correct numbers in all batch cards', () => {
		const summary = makeBatchSummary({
			total_users: 1000,
			affected_users: 250,
			entitlements_gained: 75,
			entitlements_lost: 20
		});
		render(ImpactSummaryCards, { props: { summary, type: 'batch' } });
		expect(screen.getByText('1000')).toBeTruthy();
		expect(screen.getByText('250')).toBeTruthy();
		expect(screen.getByText('75')).toBeTruthy();
		expect(screen.getByText('20')).toBeTruthy();
	});
});
