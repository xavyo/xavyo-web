import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RiskSummaryCards from './risk-summary-cards.svelte';
import type { NhiRiskSummary } from '$lib/api/types';

function makeSummary(overrides: Partial<NhiRiskSummary> = {}): NhiRiskSummary {
	return {
		total_entities: 25,
		by_type: [
			{ nhi_type: 'tool', count: 10, avg_score: 35.5 },
			{ nhi_type: 'agent', count: 10, avg_score: 55.2 },
			{ nhi_type: 'service_account', count: 5, avg_score: 20.0 }
		],
		by_level: [
			{ level: 'low', count: 10 },
			{ level: 'medium', count: 8 },
			{ level: 'high', count: 5 },
			{ level: 'critical', count: 2 }
		],
		...overrides
	};
}

describe('RiskSummaryCards', () => {
	afterEach(cleanup);

	it('renders total entities count', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('25')).toBeTruthy();
	});

	it('renders type summary cards', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('Tools')).toBeTruthy();
		expect(screen.getByText('Agents')).toBeTruthy();
		expect(screen.getByText('Service Accounts')).toBeTruthy();
	});

	it('renders type counts', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		// '10' appears multiple times (tool count, agent count, low level count)
		expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
		// '5' appears in both service_account count and high level count
		expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
	});

	it('renders avg scores', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText(/35\.5/)).toBeTruthy();
		expect(screen.getByText(/55\.2/)).toBeTruthy();
		expect(screen.getByText(/20\.0/)).toBeTruthy();
	});

	it('renders risk level distribution', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('low')).toBeTruthy();
		expect(screen.getByText('medium')).toBeTruthy();
		expect(screen.getByText('high')).toBeTruthy();
		expect(screen.getByText('critical')).toBeTruthy();
	});

	it('handles empty by_type array', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary({ by_type: [] }) } });
		expect(screen.getByText('Total Entities')).toBeTruthy();
	});

	it('handles empty by_level array', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary({ by_level: [] }) } });
		expect(screen.getByText('Risk Distribution')).toBeTruthy();
	});

	it('handles zero total entities', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary({ total_entities: 0, by_type: [], by_level: [] }) } });
		expect(screen.getByText('0')).toBeTruthy();
	});
});
